public class Login {
    @AuraEnabled(cacheable=true)
    public static Events__c LoginPage(String Username){
        Events__c event=[SELECT Id,Profiles__c FROM Events__c WHERE Profiles__c=:Username];
        if (event == null) {
            throw new AuraHandledException('Username does not exist.');
        }
        return event;
    }

}