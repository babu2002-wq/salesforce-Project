public class Recent {
     @AuraEnabled(cacheable=true)
     public static List<Employee__c> getRecentEmployees() {
        List<Employee__c> rec=[SELECT Id, Name, CreatedDate FROM Employee__c ORDER BY CreatedDate DESC LIMIT 3];
        return rec;
    }
}