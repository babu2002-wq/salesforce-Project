public class JobApplication {
    @AuraEnabled
    public static void createApplication(String jobId, String applicantName, String contact, String email, String experience) {
            Application__c application = new Application__c();
            application.JobAdvertisement__c=jobId;
            application.Applicant_Name__c = applicantName;
            application.Contact_Number__c = contact;
            application.Email_ID__c = email;
            application.Years_of_Experience__c = Decimal.valueOf(experience);
            application.Status__c = 'Applied';
            application.Stage__c  = 'Applied';
            insert application;
        
    }

}