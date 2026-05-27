public class JobNotificationQueueable
implements Queueable {

    private Id applicationId;

    public JobNotificationQueueable(
        Id appId
    ) {

        this.applicationId = appId;
    }

    public void execute(
        QueueableContext qc
    ) {

        Application__c app = [

            SELECT Id,
                   Applicant_Name__c,
                   Email_ID__c,
                   JobAdvertisement__r.Job_Title__c
            FROM Application__c
            WHERE Id = :applicationId
            LIMIT 1
        ];

        Messaging.SingleEmailMessage mail =
            new Messaging.SingleEmailMessage();

        mail.setToAddresses(
            new List<String>{
                app.Email_ID__c
            }
        );

        mail.setSubject(
            'Application Submitted'
        );

        mail.setPlainTextBody(

            'Hello ' +
            app.Applicant_Name__c +
            ', your application for "' +
            app.JobAdvertisement__r.Job_Title__c +
            '" has been submitted successfully.'
        );

        Messaging.sendEmail(
            new List<Messaging.SingleEmailMessage>{
                mail
            }
        );
    }
}