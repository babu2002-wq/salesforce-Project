public class RegistrationHandler {
    public static void sendConfirmationEmails(List<Registration__c> newRegistrations) {
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();

        for(Registration__c reg : newRegistrations){
            if(String.isNotBlank(reg.Email__c)){
                Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                email.setToAddresses(new String[] { reg.Email__c });
                email.setSubject('Event Registration Confirmation');
                email.setPlainTextBody('Thank you for registering. We will notify you once your participation is confirmed.');
                emails.add(email);
            }
        }

        if(!emails.isEmpty()){
            Messaging.sendEmail(emails);
        }
    }
    
    public static void UpdateStatus(List<Registration__c> reglist,Map<Id,Registration__c> regmap){
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        for(Registration__c reg:reglist){
            if(reg.Status__c != regmap.get(reg.Id).Status__c){
                if(String.isNotBlank(reg.Email__c)){
                   Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
                   email.setToAddresses(new String[] { reg.Email__c });
                   email.setSubject('Event Registration Confirmation');
                   email.setPlainTextBody('Your participation has been confirmed.Thank you');
                   emails.add(email);
                }
            }
        }
         if(!emails.isEmpty()){
            Messaging.sendEmail(emails);
        }
    }

}