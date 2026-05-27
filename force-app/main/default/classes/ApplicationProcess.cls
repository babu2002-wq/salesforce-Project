public class ApplicationProcess {
    @AuraEnabled
    public static void updateApplicationStatus(Id applicationId, Boolean isPassed) {
        try {
            Application__c application = [
                SELECT Id, Applicant_Name__c, Stage__c, Status__c, Email_ID__c 
                FROM Application__c 
                WHERE Id = :applicationId LIMIT 1
            ];

            if (isPassed) {
                // Update stage and status for passed application
                application.Stage__c = ApplicationProcess.getNextStage(application.Stage__c);
                application.Status__c = 'Passed ' + application.Stage__c;
            } else {
                // Update status for rejected application
                application.Status__c = 'Rejected';
            }

            // Update the application record
            update application;

            // Send notification email
            ApplicationProcess.sendNotificationEmail(application);

        } catch (Exception e) {
            // Log the error for debugging
            System.debug('Error updating application: ' + e.getMessage());
            throw new AuraHandledException('An error occurred while updating the application. Please try again later.');
        }
    }

    // Retrieve all applications
    @AuraEnabled(cacheable=true)
    public static List<Application__c> getallApplications() {
        return [SELECT Id, Applicant_Name__c, Stage__c, Status__c FROM Application__c];
    }

    // Get the next stage in the process
    private static String getNextStage(String currentStage) {
        Map<String, String> stageOrder = new Map<String, String>{
            'Applied' => '1st Round', 
            '1st Round' => '2nd Round', 
            '2nd Round' => '3rd Round', 
            '3rd Round' => 'Final Round'
        };

        // Return the next stage or default to 'Final Round'
        return stageOrder.containsKey(currentStage) ? stageOrder.get(currentStage) : 'Final Round';
    }

    // Send notification emails to the applicant and HR
    public static void sendNotificationEmail(Application__c application) {
        // Ensure required fields are not null
        if (String.isBlank(application.Email_ID__c) || String.isBlank(application.Applicant_Name__c)) {
            throw new AuraHandledException('Applicant email or name is missing.');
        }

        String applicantEmail = application.Email_ID__c;
        String hrEmail = 'ashisdash96@gmail.com'; // Replace with dynamic HR email if needed

        // Email subject and body
        String subject = 'Application Update';
        String applicantBody = 'Dear ' + application.Applicant_Name__c + ',\n\n'
            + 'We would like to inform you about the status of your application:\n'
            + 'Current Stage: ' + application.Stage__c + '\n'
            + 'Result: ' + (application.Status__c.startsWith('Passed') 
                ? 'Congratulations! You have cleared this stage.' 
                : 'We regret to inform you that your application has been rejected.') + '\n\n'
            + 'Thank you for applying!\n\n'
            + 'Best regards,\nHR Team';

        String hrBody = 'Applicant Name: ' + application.Applicant_Name__c + '\n'
            + 'Current Stage: ' + application.Stage__c + '\n'
            + 'Result: ' + application.Status__c + '\n\n'
            + 'Please review the application for further actions.';

        // Create applicant email
        Messaging.SingleEmailMessage applicantEmailMessage = new Messaging.SingleEmailMessage();
        applicantEmailMessage.setToAddresses(new String[] { applicantEmail });
        applicantEmailMessage.setSubject(subject);
        applicantEmailMessage.setPlainTextBody(applicantBody);

        // Create HR email
        Messaging.SingleEmailMessage hrEmailMessage = new Messaging.SingleEmailMessage();
        hrEmailMessage.setToAddresses(new String[] { hrEmail });
        hrEmailMessage.setSubject('Applicant Update: ' + application.Applicant_Name__c);
        hrEmailMessage.setPlainTextBody(hrBody);

        // Send emails
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { applicantEmailMessage, hrEmailMessage });
    }

    @AuraEnabled(cacheable=true)
    public static Application__c  getApplicationstatus(String applicationId){
        Application__c app=[Select Id,Stage__c,Applicant_Name__c FROM Application__c WHERE Id=:applicationId LIMIT 1];
        if (app != null && app.Stage__c == null) {
             throw new AuraHandledException('Record not found.');
        } 
        return app;
         
    }
}