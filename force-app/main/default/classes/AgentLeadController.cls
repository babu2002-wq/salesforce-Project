public with sharing class AgentLeadController {
    @AuraEnabled(cacheable=true)
    public static List<Campus__c> searchCampus(String searchText) {
        return [
            SELECT Id, Name, Region__c 
            FROM Campus__c
            WHERE Name LIKE :('%' + searchText + '%')
            LIMIT 20
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Course_Offering__c> getCourseOfferingsByCampus(String campusId) {
        return [
            SELECT Id, Name, Fee__c,
                   Course__r.Name
            FROM Course_Offering__c
            WHERE Campus__c = :campusId
            ORDER BY Course__r.Name
        ];
    }

    @AuraEnabled
    public static Id createLead(Lead inputLead) {
        // Basic server-side validation
        if (inputLead == null) {
            throw new AuraHandledException('Lead data is required.');
        }
        if (String.isBlank(inputLead.LastName)) {
            throw new AuraHandledException('Last Name is required.');
        }
        if (String.isBlank(inputLead.Email)) {
            throw new AuraHandledException('Email is required.');
        }

        // Set default Company if blank (Lead requires Company for Business? depends on org)
        if (String.isBlank(inputLead.Company)) {
            inputLead.Company = 'Individual';
        }

        try {
            if (inputLead.Id == null){
                insert inputLead;
            }
            else {
               update inputLead;
            }
            return inputLead.Id;
        } catch (DmlException ex) {
            // bubble a user-friendly message
            throw new AuraHandledException('Failed to create Lead: ' + ex.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Lead findDuplicateByEmail(String email) {
        if (String.isBlank(email)) return null;
        List<Lead> l = [
            SELECT Id, FirstName, LastName, Email, Company, Preferred_Campus__c, Preferred_Course__c
            FROM Lead
            WHERE Email = :email
            LIMIT 1
        ];
        return l.isEmpty() ? null : l[0];
    }

    @AuraEnabled(cacheable=true)
    public static List<Lead> getLeads() {
       return [
           SELECT Id, FirstName, LastName, Email, Phone,
               Preferred_Campus__c, Preferred_Campus__r.Name,
               Preferred_Course__c
           FROM Lead
           ORDER BY CreatedDate DESC
           LIMIT 50
        ];
   }


   @AuraEnabled
   public static Lead getLeadById(Id leadId) {
      return [
          SELECT Id, FirstName, LastName, Email, Phone, Description,
               Preferred_Campus__c, Preferred_Campus__r.Name,
               Preferred_Course__c
          FROM Lead
          WHERE Id = :leadId
      ];
    }
}