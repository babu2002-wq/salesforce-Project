public class allEmployees {
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployees() {
        return [SELECT Id, Name,IS_Clicked__c, CreatedDate FROM Employee__c ORDER BY CreatedDate DESC];
    }

}