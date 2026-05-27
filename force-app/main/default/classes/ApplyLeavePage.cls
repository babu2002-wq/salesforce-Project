public class ApplyLeavePage {
    @AuraEnabled
    public static void leaverequest(string start,string enddat,string leavereason,string leavetype,String employeeId,String email){
        Date startdate = Date.valueOf(start);
        Date enddate = Date.valueOf(enddat);
        Employee__c employee = [SELECT Id FROM Employee__c WHERE Id = :employeeId LIMIT 1];
           Leave__c newleave=new Leave__c();
           newleave.Start_Date__c=startdate;
           newleave.End_Date__c=enddate;
           newleave.Reason_for_leave__c=leavereason;
           newLeave.Employee_Name__c = employee.Id;
           newLeave.Employee_Email__c=email;
           newLeave.Status__c='Pending';
           newLeave.Leave_Type__c=leavetype;

        
        insert newleave;
        
    }

    @AuraEnabled(cacheable=true)
    public static String getEmployeeEmail(Id userId) {
        Employee__c emp = [SELECT Email__c FROM Employee__c WHERE Id = :userId LIMIT 1];
        return emp.Email__c;
    

}
}