public class recemployee {
    @AuraEnabled
     public static List<Employee__c> getRecentEmployees() {
        List<Employee__c> rec=[SELECT Id, Name, CreatedDate FROM Employee__c ORDER BY CreatedDate DESC LIMIT 3];
         for(Employee__c em:rec){
             System.debug(em);
         }
        return rec;
    }

}