public class loginPage {
    @AuraEnabled
    public static Employee__c login(String username,String password){
        Employee__c employee=[Select Id,Username__c,Password__c,Name,User_Type__c From Employee__c WHERE Username__c = :username];
        if (employee == null) {
            throw new AuraHandledException('Username does not exist.');
        }
         if (employee.Password__c != password) { 
            throw new AuraHandledException('Invalid password.');
        }
        return employee;
    }

    
    
}