public class JobAdvertisement {
    @AuraEnabled(cacheable=true)
    public static List<JobAdvertisement__c> getJobAdvertisements() {
        return [SELECT Id, Job_Title__c, Status__c, Roles_and_Responsibilities__c, Years_of_Experience__c FROM JobAdvertisement__c WHERE Status__c = 'Active'];
    }

    @AuraEnabled
    public static String applyJob(
        Id jobId,
        String applicantName,
        String contactNumber,
        String emailId,
        Decimal experience

    ) {

        try {

            Application__c app =
                new Application__c();

            app.Job_ID_Text__c = jobId;

            app.JobAdvertisement__c = jobId;

            app.Applicant_Name__c =
                applicantName;

            app.Contact_Number__c =
                contactNumber;

            app.Email_ID__c =
                emailId;

            app.Years_of_Experience__c =
                experience;

            app.Status__c = 'Active';

            app.Stage__c = 'Applied';

            app.Is_Archived__c = false;

            insert app;

            System.enqueueJob(
                new JobNotificationQueueable(
                    app.Id
                )
            );

            return 'SUCCESS';

        } catch(Exception ex) {

            throw new AuraHandledException(
                ex.getMessage()
            );
        }
    }


    @AuraEnabled(cacheable=true)
    public static Map<String,
    List<Application__c>>
    getApplications(String emailId) {

        List<Application__c> apps = [

            SELECT Id,
                   Applicant_Name__c,
                   Email_ID__c,
                   Status__c,
                   Stage__c,
                   JobAdvertisement__r.Job_Title__c
            FROM Application__c
            WHERE Email_ID__c = :emailId
            AND Is_Archived__c = false
            ORDER BY CreatedDate DESC
        ];

        Set<String> closedStatuses =
            new Set<String>();

        for(Application_Status_Config__mdt md :
            [

                SELECT DeveloperName,
                       Is_Closed__c
                FROM Application_Status_Config__mdt
            ]) {

            if(md.Is_Closed__c) {

                closedStatuses.add(
                    md.DeveloperName
                );
            }
        }

        List<Application__c>
        activeApps =
        new List<Application__c>();

        List<Application__c>
        inactiveApps =
        new List<Application__c>();

        for(Application__c app : apps) {

            if(closedStatuses.contains(
                app.Status__c
            )) {

                inactiveApps.add(app);

            } else {

                activeApps.add(app);
            }
        }

        Map<String,
        List<Application__c>>
        resultMap =
        new Map<String,
        List<Application__c>>();

        resultMap.put(
            'active',
            activeApps
        );

        resultMap.put(
            'inactive',
            inactiveApps
        );

        return resultMap;
    }

}
