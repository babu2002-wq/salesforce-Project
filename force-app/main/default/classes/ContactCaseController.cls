public with sharing class ContactCaseController {

    @AuraEnabled
    public static Id saveContactAndCase(
        Contact conInput,
        String street,
        String city,
        String state,
        String postalCode,
        Case caseInput
    ) {
        // STEP 1: Find contact by email
        List<Contact> existingList = [
            SELECT Id 
            FROM Contact 
            WHERE Email = :conInput.Email
            LIMIT 1
        ];

        Contact finalContact;

        if (!existingList.isEmpty()) {
            // FOUND → reuse
            finalContact = existingList[0];
        } 
        else {
            // NOT FOUND → create new
            insert conInput;
            finalContact = conInput;
        }

        // STEP 2: Update address
        Contact updateCon = new Contact(
            Id = finalContact.Id,
            MailingStreet     = street,
            MailingCity       = city,
            MailingState      = state,
            MailingPostalCode = postalCode
        );
        update updateCon;

        // STEP 3: Create Case
        caseInput.ContactId = finalContact.Id;
        insert caseInput;

        return caseInput.Id;
    }
}