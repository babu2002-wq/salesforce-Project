trigger Reg_Attendee_Trigger on Registration__c (after insert,after update) {
    if(Trigger.isAfter && Trigger.isInsert){
        RegistrationHandler.sendConfirmationEmails(Trigger.new);
    }
    
    if(Trigger.isUpdate && Trigger.isAfter){
        RegistrationHandler.UpdateStatus(Trigger.new,Trigger.OldMap);
    }
}