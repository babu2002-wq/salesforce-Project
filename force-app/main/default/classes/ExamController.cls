public with sharing class ExamController {

    // Wrapper classes for transfer
    public class QuestionWrapper {
        @AuraEnabled public Id questionId;
        @AuraEnabled public String questionText;
        @AuraEnabled public String type; // 'Single Choice' or 'Multiple Choice'
        @AuraEnabled public List<OptionWrapper> options;
    }
    public class OptionWrapper {
        @AuraEnabled public Id optionId;
        @AuraEnabled public String optionText;
        public OptionWrapper(Id id, String text) { optionId = id; optionText = text; }
    }

    public class QuestionSubmission {
    @AuraEnabled public Id questionId { get; set; }
    @AuraEnabled public List<Id> selectedOptionIds { get; set; }
}


    public class ExamSubmissionResponse {
        @AuraEnabled public Id resultId;
        @AuraEnabled public Integer score;
        @AuraEnabled public Decimal percentage;
        public ExamSubmissionResponse(Id r, Integer s, Decimal p) {
            resultId = r; score = s; percentage = p;
        }
    }

    /**
     * Get questions + options for an exam
     */
    @AuraEnabled(cacheable=true)
    public static List<QuestionWrapper> getQuestions(Id examId) {
        List<QuestionWrapper> out = new List<QuestionWrapper>();
        if (examId == null) return out;

        // Query questions and child options
        List<Question__c> qs = [
            SELECT Id, Text__c, Question_Type__c,
                   (SELECT Id, Option_Text_c__c FROM Answers__r ORDER BY CreatedDate)
            FROM Question__c
            WHERE Exam__c = :examId
            ORDER BY CreatedDate
        ];

        for (Question__c q : qs) {
            QuestionWrapper qw = new QuestionWrapper();
            qw.questionId = q.Id;
            qw.questionText = q.Text__c;
            qw.type = q.Question_Type__c;
            qw.options = new List<OptionWrapper>();
            for (Answer_Option__c ao : q.Answers__r) {
                qw.options.add(new OptionWrapper(ao.Id, ao.Option_Text_c__c));
            }
            out.add(qw);
        }
        return out;
    }

    /**
     * Submit an exam attempt.
     * - One attempt per contact per exam is enforced.
     * - For each question, correctness requires exact match (selected set == correct set).
     * - Stores Exam_Result__c and Exam_Response__c (Selected_Options__c as CSV).
     */
  @AuraEnabled
public static ExamSubmissionResponse submitExamAttempt(Id contactId, Id examId, List<QuestionSubmission> submissions) {
    if (contactId == null || examId == null) {
        throw new AuraHandledException('Missing contactId or examId');
    }
    if (submissions == null) submissions = new List<QuestionSubmission>();

    // 1) Prevent multiple attempts
    List<Exam_Result__c> existing = [
        SELECT Id FROM Exam_Result__c
        WHERE Contact__c = :contactId AND Exam__c = :examId
        LIMIT 1
    ];
    if (!existing.isEmpty()) {
        throw new AuraHandledException('You have already attempted this exam.');
    }

    // 2) Insert Exam_Result__c
    Exam_Result__c result = new Exam_Result__c(
        Contact__c = contactId,
        Exam__c = examId,
        Submission_Date__c = Datetime.now()
    );
    insert result;

    // 3) Get ALL questions for the exam (including type)
    List<Question__c> examQuestions = [
        SELECT Id, Question_Type__c
        FROM Question__c
        WHERE Exam__c = :examId
    ];

    // 4) Query correct answer options for these questions
    Map<Id, Set<Id>> correctOptsByQuestion = new Map<Id, Set<Id>>();
    for (Answer_Option__c ao : [
        SELECT Id, Question__c
        FROM Answer_Option__c
        WHERE Question__c IN :examQuestions AND IsCorrect__c = true
    ]) {
        if (!correctOptsByQuestion.containsKey(ao.Question__c)) {
            correctOptsByQuestion.put(ao.Question__c, new Set<Id>());
        }
        correctOptsByQuestion.get(ao.Question__c).add(ao.Id);
    }

    // 5) Convert submissions list into a map for easy lookup
    Map<Id, Set<Id>> selectedOptsByQuestion = new Map<Id, Set<Id>>();

    // Collect all submitted option IDs
    Set<Id> allSubmittedOptionIds = new Set<Id>();
    for (QuestionSubmission qs : submissions) {
        if (qs.selectedOptionIds != null) {
            allSubmittedOptionIds.addAll(qs.selectedOptionIds);
        }
    }
    System.debug('🔥 Submitted Option Ids: ' + allSubmittedOptionIds);

    // Query their parent Question Ids
    Map<Id, Id> optionToQuestionMap = new Map<Id, Id>();
    for (Answer_Option__c ao : [
        SELECT Id, Question__c
        FROM Answer_Option__c
        WHERE Id IN :allSubmittedOptionIds
    ]) {
        optionToQuestionMap.put(ao.Id, ao.Question__c);
    }
    System.debug('🔥 Option -> Question Map: ' + optionToQuestionMap);

    // Build map<QuestionId, Set<AnswerOptionId>>
    for (QuestionSubmission qs : submissions) {
        if (qs.selectedOptionIds != null) {
            for (Id optId : qs.selectedOptionIds) {
                Id qId = optionToQuestionMap.get(optId);
                if (qId != null) {
                    if (!selectedOptsByQuestion.containsKey(qId)) {
                        selectedOptsByQuestion.put(qId, new Set<Id>());
                    }
                    selectedOptsByQuestion.get(qId).add(optId);
                }
            }
        }
    }
    System.debug('🔥 SelectedOptsByQuestion: ' + selectedOptsByQuestion);

    // 6) Evaluate each question
    List<Exam_Answer__c> responsesToInsert = new List<Exam_Answer__c>();
    Integer correctCount = 0;
    Integer totalQuestions = examQuestions.size();

    for (Question__c q : examQuestions) {
        Set<Id> selectedSet = selectedOptsByQuestion.containsKey(q.Id) 
                              ? selectedOptsByQuestion.get(q.Id) 
                              : new Set<Id>();

        Set<Id> correctSet = correctOptsByQuestion.containsKey(q.Id) 
                             ? correctOptsByQuestion.get(q.Id) 
                             : new Set<Id>();

        System.debug('👉 Evaluating Q: ' + q.Id + ' Type=' + q.Question_Type__c 
                     + ' Selected=' + selectedSet + ' Correct=' + correctSet);

        Boolean isCorrect = false;
        String qType = (q.Question_Type__c == null) ? '' : q.Question_Type__c.trim();

        if (qType.equalsIgnoreCase('Single Choice') || 
            qType.equalsIgnoreCase('SingleChoice') || 
            qType.equalsIgnoreCase('Single')) {

            if (selectedSet.size() == 1 && correctSet.size() == 1 && selectedSet.equals(correctSet)) {
                isCorrect = true;
            }
        } else {
            if (!correctSet.isEmpty() && selectedSet.equals(correctSet)) {
                isCorrect = true;
            }
        }

        if (isCorrect) correctCount++;

        // Record answers
        for (Id selectedOpt : selectedSet) {
            Boolean isOptCorrect = correctSet.contains(selectedOpt);
            responsesToInsert.add(new Exam_Answer__c(
                Exam_Result__c   = result.Id,
                Question__c      = q.Id,
                Answer_Option__c = selectedOpt,
                Is_Correct__c    = isOptCorrect
            ));
        }
    }

    if (!responsesToInsert.isEmpty()) insert responsesToInsert;

    // 7) Compute score & percentage
    Integer score = correctCount;
    Decimal percentage = 0;
    if (totalQuestions > 0) {
        percentage = (Decimal.valueOf(score) / Decimal.valueOf(totalQuestions)) * 100;
    }

    result.Score__c = score;
    result.Percentage__c = percentage.setScale(2);
    update result;

    return new ExamSubmissionResponse(result.Id, score, result.Percentage__c);
}

    
    
    
    @AuraEnabled(cacheable=true)
public static List<Exam__c> getExamsForLoggedInUser() {
    User u = [SELECT Email FROM User WHERE Id = :UserInfo.getUserId()];
    Contact c = [SELECT Id, Semester__r.Name FROM Contact WHERE Email = :u.Email LIMIT 1];

    if (c == null || c.Semester__c == null) {
        return new List<Exam__c>();
    }

    return [SELECT Id, Name, Semester__c, Start_Date__c
            FROM Exam__c
            WHERE Semester__c = :c.Semester__c];
}

    
    
    
    @AuraEnabled(cacheable=true)
public static Id getLoggedInContactId() {
    User u = [
        SELECT Email
        FROM User
        WHERE Id = :UserInfo.getUserId()
        LIMIT 1
    ];
    Contact c = [SELECT Id, Semester__c FROM Contact WHERE Email = :u.Email LIMIT 1];
    return c.Id;
}

}