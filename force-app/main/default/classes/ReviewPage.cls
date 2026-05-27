public class ReviewPage {
    @AuraEnabled
    public static void updateReview(String employeeId, String revi, Boolean isReject, String rejectReason) {
        // Retrieve the employee record
        Employee__c employee = [SELECT Id FROM Employee__c WHERE Id = :employeeId LIMIT 1];

        // Try to retrieve an existing review for the employee
        Review__c reviewRecord;
        List<Review__c> existingReviews = [SELECT Id, Review__c, Status__c, Reject_Reason__c 
                                           FROM Review__c 
                                           WHERE Employee__c = :employee.Id 
                                           LIMIT 1];

        if (existingReviews.isEmpty()) {
            // If no existing review is found, create a new one
            reviewRecord = new Review__c();
            reviewRecord.Employee__c = employeeId;  // Link to the employee
            reviewRecord.Review__c = revi;
            if (isReject) {
                reviewRecord.Status__c = 'Rejected';
                reviewRecord.Reject_Reason__c = rejectReason;
            } else {
                reviewRecord.Status__c = 'Approved';
            }
            insert reviewRecord;  // Insert the new review record
        } else {
            // If an existing review is found, update it
            reviewRecord = existingReviews[0];
            reviewRecord.Review__c = revi;
            if (isReject) {
                reviewRecord.Status__c = 'Rejected';
                reviewRecord.Reject_Reason__c = rejectReason;
            } else {
                reviewRecord.Status__c = 'Approved';
                reviewRecord.Reject_Reason__c = null;
            }
            update reviewRecord;  // Update the existing review
        }
    }

    @AuraEnabled
    public static Review__c getReview(String employeeId){
        Review__c re=[SELECT Id, Review__c FROM Review__c WHERE Employee__c = :employeeId LIMIT 1];
        if(re.Review__c==null){
            throw new AuraHandledException('Record not found.');
        }
        return re;
    }

}