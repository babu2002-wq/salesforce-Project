public class Registrations {
    @AuraEnabled(cacheable=true)
    public static List<Registration__c> getRegistrations(){
        return [SELECT Id,Name FROM Registration__c];
    }

}