public class hrInterviewPanel {
    @AuraEnabled(cacheable=true)
    public static List<Application__c> getApplications() {
        List<Application__c> applications=[SELECT Id, Applicant_Name__c, Stage__c, Status__c FROM Application__c];
        for(Application__c app:applications){
            System.debug(app);
        }
        return applications;
    }

}