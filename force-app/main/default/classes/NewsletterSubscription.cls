public with sharing class NewsletterSubscription {

    @AuraEnabled
    public static void saveNewsletterPreference(Id contactId, String firstName, String lastName, String email, Boolean isSubscribed) {
        try {
            Contact con;

            if (contactId != null) {
                // Logged-in: update own Contact
                con = [SELECT Id, FirstName, LastName, Email, Is_Newsletter_Subscribed__c 
                       FROM Contact WHERE Id = :contactId LIMIT 1];
                
                con.FirstName = firstName;
                con.LastName = lastName;
                con.Email = email;
                con.Is_Newsletter_Subscribed__c = isSubscribed;
                
                update con;
            } else {
                // Guest: prevent duplicates
                List<Contact> existing = [SELECT Id FROM Contact WHERE Email = :email LIMIT 1];
                if (!existing.isEmpty()) {
                    throw new AuraHandledException('This email is already registered. Please log in to manage your newsletter subscription.');
                }
                
                con = new Contact(
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                    Is_Newsletter_Subscribed__c = isSubscribed,
                    AccountId = '001dM00002YnJ8fQAF' // ← Replace with real Account Id for newsletter contacts
                );
                insert con;
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}