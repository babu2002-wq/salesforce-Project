public class admin {
    @AuraEnabled(cacheable=true)
    public static Employee__c profile(String employeeId){
        Employee__c pro=[SELECT Id,Name FROM Employee__c WHERE Id=:employeeId LIMIT 1];
        System.debug(pro);
        return pro;
    }
    

}