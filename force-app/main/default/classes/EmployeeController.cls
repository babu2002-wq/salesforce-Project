public with sharing class EmployeeController {
    @AuraEnabled(cacheable=true)
    public static Employee__c getEmployeeForUser() {
        String userName = [SELECT Name FROM User WHERE Id = :UserInfo.getUserId()].Name;
        List<Employee__c> employees = [
            SELECT Id, Name
            FROM Employee__c
            WHERE Name = :userName
            LIMIT 1
        ];

       
        return (employees.isEmpty()) ? null : employees[0];
    }
}