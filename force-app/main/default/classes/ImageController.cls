public with sharing class ImageController {

    @AuraEnabled
    public static String updateContactPicture(Id contactId, Id contentDocumentId) {
        if (contactId == null || contentDocumentId == null) {
            throw new AuraHandledException('ContactId or DocumentId cannot be null');
        }

        // Get the latest ContentVersion for this ContentDocument
        ContentVersion cv = [
            SELECT Id, ContentDocumentId, FileExtension
            FROM ContentVersion
            WHERE ContentDocumentId = :contentDocumentId
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];

        // ✅ Restrict file type to JPG/JPEG
        if (!(cv.FileExtension.equalsIgnoreCase('jpg') || cv.FileExtension.equalsIgnoreCase('jpeg'))) {
            throw new AuraHandledException('Only JPG or JPEG files are allowed.');
        }

        // ✅ Use the new method for domain URL in API v58+
        String baseUrl = System.Url.getOrgDomainUrl().toExternalForm();
        String downloadUrl = baseUrl + '/sfc/servlet.shepherd/document/download/' + cv.ContentDocumentId;

        // Update Contact with URL
        Contact c = [SELECT Id FROM Contact WHERE Id = :contactId LIMIT 1];
        c.Profile_Picture_URL__c = downloadUrl;
        update c;

        return downloadUrl;
    }

    @AuraEnabled(cacheable=true)
    public static String getContactPicture(Id contactId) {
        if (contactId == null) return null;

        Contact c = [SELECT Profile_Picture_URL__c FROM Contact WHERE Id = :contactId LIMIT 1];
        return c.Profile_Picture_URL__c;
    }
}