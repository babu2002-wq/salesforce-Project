public class ProfilePage {
    @AuraEnabled(cacheable=true)
    public static Employee__c displayProfile(String EmployeeId){
        System.debug('EmployeeId passed to Apex: ' + EmployeeId);
        Employee__c emp=[Select Id,Name,Email__c,Phone_No__c,DOB__c,Department__c,Address__c,Username__c FROM Employee__c WHERE Id=:EmployeeId LIMIT 1];
        return emp;
        
    }

}