public class Events {
    @AuraEnabled(cacheable=true)
    public static List<Events__c> getEvents(){
        return [SELECT Name,Event_Date__c,Location__c,Maximum_Capacity__c FROM Events__c];
    }

}