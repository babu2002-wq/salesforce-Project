public class Leaveapproval {
    @AuraEnabled(cacheable=true)
    public static List<Leave__c> getPendingLeaves() {
          return [SELECT Id, Employee_Name__r.Name, Start_Date__c, End_Date__c, Reason_for_leave__c,Leave_Type__c FROM Leave__c WHERE Status__c = 'Pending'];
}

@AuraEnabled
public static void updateLeaveStatus(Id leaveId, String status, String rejectionReason) {
    Leave__c leave = [SELECT Id, Employee_Name__r.Email__c FROM Leave__c WHERE Id = :leaveId LIMIT 1];
    leave.Status__c = status;
    if (status == 'Rejected') {
        leave.Rejection_Reason__c = rejectionReason;
    }
    update leave;

    
    sendEmailNotification(leave.Employee_Name__r.Email__c, status, rejectionReason);
}


private static void sendEmailNotification(String toAddress, String status, String rejectionReason) {
    
    Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
    
    
    email.setToAddresses(new String[] { toAddress });
    
    
    email.setSenderDisplayName('HR');
    
    
    String subject;
    if (status == 'Approved') {
        subject = 'Leave Request Approved';
    } else if (status == 'Rejected') {
        subject = 'Leave Request Rejected';
    }
    email.setSubject(subject);
    
    
    String body;
    if (status == 'Approved') {
        body = 'Dear Employee,\n\n' +
               'We are pleased to inform you that your leave request has been approved.\n\n' +
               'Thank you,\nHR';
    } else if (status == 'Rejected') {
        body = 'Dear Employee,\n\n' +
               'We regret to inform you that your leave request has been rejected.\n\n' +
               'Reason for Rejection: ' + rejectionReason + '\n\n' +
               'Thank you,\nHR';
    }
    
    
    email.setPlainTextBody(body);

    try {  
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { email });
    } catch (Exception e) {
        System.debug('Error sending email: ' + e.getMessage());
    }
}



}