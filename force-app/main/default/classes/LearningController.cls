public with sharing class LearningController {

    /* =====================================================
       GET COURSES WITH USER PROGRESS %
       ===================================================== */
    @AuraEnabled(cacheable=true)
    public static List<CourseWrapper> getCourses() {

        Id userId = UserInfo.getUserId();

        Map<Id, Decimal> courseProgress = new Map<Id, Decimal>();
        for (Course_Progress__c cp : [
            SELECT Course__c, Completion_Percentage__c
            FROM Course_Progress__c
            WHERE User__c = :userId
        ]) {
            courseProgress.put(cp.Course__c, cp.Completion_Percentage__c);
        }

        List<CourseWrapper> result = new List<CourseWrapper>();

        for (Course__c c : [
            SELECT Id, Name
            FROM Course__c
            ORDER BY Name
        ]) {
            result.add(new CourseWrapper(
                c.Id,
                c.Name,
                courseProgress.containsKey(c.Id) ? courseProgress.get(c.Id) : 0
            ));
        }

        return result;
    }

    /* =====================================================
       GET TOPICS WITH COMPLETION STATUS
       ===================================================== */
    @AuraEnabled(cacheable=true)
    public static List<TopicWrapper> getTopics(Id courseId) {

        Id userId = UserInfo.getUserId();

        Set<Id> completedTopics = new Set<Id>();
        for (Topic_Progress__c tp : [
            SELECT Topic__c
            FROM Topic_Progress__c
            WHERE User__c = :userId
            AND Status__c = 'Completed'
        ]) {
            completedTopics.add(tp.Topic__c);
        }

        List<TopicWrapper> result = new List<TopicWrapper>();

        for (Topic__c t : [
            SELECT Id, Name
            FROM Topic__c
            WHERE Course__c = :courseId
            ORDER BY Name
        ]) {
            result.add(new TopicWrapper(
                t.Id,
                t.Name,
                completedTopics.contains(t.Id)
            ));
        }

        return result;
    }

    /* =====================================================
       GET MATERIALS WITH FILES + USER STATUS
       ===================================================== */
    @AuraEnabled(cacheable=true)
    public static List<MaterialWrapper> getMaterials(Id topicId) {

        Id userId = UserInfo.getUserId();

        Map<Id, Boolean> progressMap = new Map<Id, Boolean>();
        for (User_Material_Progress__c ump : [
            SELECT Study_Material__c, Completed__c
            FROM User_Material_Progress__c
            WHERE User__c = :userId
        ]) {
            progressMap.put(ump.Study_Material__c, ump.Completed__c);
        }

        List<Study_Material__c> materials = [
            SELECT Id, Name
            FROM Study_Material__c
            WHERE Topic__c = :topicId
        ];

        Set<Id> materialIds = new Set<Id>();
        for (Study_Material__c sm : materials) {
            materialIds.add(sm.Id);
        }

        Map<Id, Set<Id>> materialToDocIds = new Map<Id, Set<Id>>();
        for (ContentDocumentLink cdl : [
            SELECT LinkedEntityId, ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId IN :materialIds
        ]) {
            if (!materialToDocIds.containsKey(cdl.LinkedEntityId)) {
                materialToDocIds.put(cdl.LinkedEntityId, new Set<Id>());
            }
            materialToDocIds.get(cdl.LinkedEntityId).add(cdl.ContentDocumentId);
        }

        Map<Id, FileWrapper> docIdToFile = new Map<Id, FileWrapper>();
        if (!materialToDocIds.isEmpty()) {

            Set<Id> docIds = new Set<Id>();
            for (Set<Id> ids : materialToDocIds.values()) {
                docIds.addAll(ids);
            }

            for (ContentVersion cv : [
                SELECT ContentDocumentId, Title
                FROM ContentVersion
                WHERE IsLatest = true
                AND ContentDocumentId IN :docIds
            ]) {
                docIdToFile.put(
                    cv.ContentDocumentId,
                    new FileWrapper(cv.ContentDocumentId, cv.Title)
                );
            }
        }

        List<MaterialWrapper> response = new List<MaterialWrapper>();

        for (Study_Material__c sm : materials) {

            List<FileWrapper> files = new List<FileWrapper>();

            if (materialToDocIds.containsKey(sm.Id)) {
                for (Id docId : materialToDocIds.get(sm.Id)) {
                    if (docIdToFile.containsKey(docId)) {
                        files.add(docIdToFile.get(docId));
                    }
                }
            }

            response.add(new MaterialWrapper(
                sm.Id,
                sm.Name,
                progressMap.containsKey(sm.Id) ? progressMap.get(sm.Id) : false,
                files
            ));
        }

        return response;
    }

    /* =====================================================
       AUTO MARK MATERIAL COMPLETED
       ===================================================== */
    @AuraEnabled
    public static void markMaterialCompleted(Id materialId) {

        Id userId = UserInfo.getUserId();

        List<User_Material_Progress__c> existing = [
            SELECT Id, Completed__c
            FROM User_Material_Progress__c
            WHERE User__c = :userId
            AND Study_Material__c = :materialId
            LIMIT 1
        ];

        if (existing.isEmpty()) {
            insert new User_Material_Progress__c(
                User__c = userId,
                Study_Material__c = materialId,
                Completed__c = true,
                Completed_On__c = System.now()
            );
        } else if (!existing[0].Completed__c) {
            existing[0].Completed__c = true;
            update existing[0];
        }

        updateTopicAndCourseProgress(userId, materialId);
    }

    /* =====================================================
       INTERNAL HELPERS
       ===================================================== */
    private static void updateTopicAndCourseProgress(Id userId, Id materialId) {

    Study_Material__c sm = [
        SELECT Topic__c, Topic__r.Course__c
        FROM Study_Material__c
        WHERE Id = :materialId
    ];

    Id topicId = sm.Topic__c;
    Id courseId = sm.Topic__r.Course__c;

    Integer remaining = [
        SELECT COUNT()
        FROM Study_Material__c
        WHERE Topic__c = :topicId
        AND Id NOT IN (
            SELECT Study_Material__c
            FROM User_Material_Progress__c
            WHERE User__c = :userId
            AND Completed__c = true
        )
    ];

    if (remaining == 0) {
        // Upsert with unique key
        upsert new Topic_Progress__c(
            Topic_Progress_Key__c = userId + '-' + topicId,
            User__c = userId,
            Topic__c = topicId,
            Status__c = 'Completed'
        ) Topic_Progress_Key__c;
        
        updateCourseProgress(userId, courseId);
    }
}

private static void updateCourseProgress(Id userId, Id courseId) {
    
    Set<Id> completedTopicIds = new Set<Id>();
    
    for (Topic_Progress__c tp : [
        SELECT Topic__c
        FROM Topic_Progress__c
        WHERE User__c = :userId
        AND Status__c = 'Completed'
        AND Topic__r.Course__c = :courseId
    ]) {
        completedTopicIds.add(tp.Topic__c);
    }
    
    Integer totalTopics = [
        SELECT COUNT()
        FROM Topic__c
        WHERE Course__c = :courseId
    ];
    
    Decimal percent = totalTopics == 0
        ? 0
        : (completedTopicIds.size() * 100.0 / totalTopics);
    
    // Upsert with unique key
    upsert new Course_Progress__c(
        Course_Progress_Key__c = userId + '-' + courseId,
        User__c = userId,
        Course__c = courseId,
        Completion_Percentage__c = percent
    ) Course_Progress_Key__c;
}

    /* =====================================================
       WRAPPERS
       ===================================================== */
    public class CourseWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public Decimal percent;
        public CourseWrapper(Id i, String n, Decimal p) {
            id = i; name = n; percent = p;
        }
    }

    public class TopicWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public Boolean completed;
        public TopicWrapper(Id i, String n, Boolean c) {
            id = i; name = n; completed = c;
        }
    }

    public class MaterialWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public Boolean completed;
        @AuraEnabled public List<FileWrapper> files;
        public MaterialWrapper(Id i, String n, Boolean c, List<FileWrapper> f) {
            id = i; name = n; completed = c; files = f;
        }
    }

    public class FileWrapper {
        @AuraEnabled public Id documentId;
        @AuraEnabled public String title;
        public FileWrapper(Id d, String t) {
            documentId = d; title = t;
        }
    }
}