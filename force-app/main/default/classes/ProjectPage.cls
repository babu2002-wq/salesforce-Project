public class ProjectPage {
    @AuraEnabled
    public static List<Project__c> AllProjects(){
         return [SELECT Id, Name FROM Project__c]; 
    }
    
    @AuraEnabled
    public static Employee__c  getEmployeeProject(String employeeId){
        Employee__c emp=[Select Id,Project__r.Name,Project__c FROM Employee__c WHERE Id=:employeeId LIMIT 1];
        if (emp != null && emp.Project__c == null) {
             throw new AuraHandledException('Record not found.');
        } 
        return emp;
         
    }
    
    @AuraEnabled
    public static void updateproject(String employeeId,String projectId){
        Employee__c pr=[Select Id,Project__c FROM Employee__c WHERE Id=:employeeId LIMIT 1];
        pr.Project__c=projectId;
        update pr;
    }

}