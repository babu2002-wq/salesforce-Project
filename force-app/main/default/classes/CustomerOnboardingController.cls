public with sharing class CustomerOnboardingController {
    
    @AuraEnabled
    public static void saveAllData(
        Map<String, Object> accountData,
        Map<String, Object> contactData,  // Fixed parameter name
        Map<String, Object> opportunityData,
        String fileId  // Changed from Id to String
    ) {
        try {
            // 1. Create Account
            Account acc = new Account();
            acc.Name = (String)accountData.get('Name');
            if(accountData.containsKey('Phone')) {
                acc.Phone = (String)accountData.get('Phone');
            }
            
            insert acc;
            System.debug('Account created: ' + acc.Id);
            
            // 2. Create Contact
            Contact con = new Contact();
            con.FirstName = (String)contactData.get('FirstName');
            con.LastName = (String)contactData.get('LastName');
            con.Email = (String)contactData.get('Email');
            con.AccountId = acc.Id;
            
            insert con;
            System.debug('Contact created: ' + con.Id);
            
            // 3. Create Opportunity
            Opportunity opp = new Opportunity();
            opp.Name = (String)opportunityData.get('Name');
            opp.AccountId = acc.Id;
            
            // Handle Amount field - convert from String/Number to Decimal
            Object amountObj = opportunityData.get('Amount');
            if(amountObj != null) {
                if(amountObj instanceof String) {
                    opp.Amount = Decimal.valueOf((String)amountObj);
                } else if(amountObj instanceof Decimal) {
                    opp.Amount = (Decimal)amountObj;
                } else if(amountObj instanceof Integer) {
                    opp.Amount = Decimal.valueOf((Integer)amountObj);
                } else if(amountObj instanceof Double) {
                    opp.Amount = Decimal.valueOf((Double)amountObj);
                }
            }

            if(opportunityData.containsKey('CloseDate')) {
                String closeDateStr = (String)opportunityData.get('CloseDate');
                if(String.isNotBlank(closeDateStr)) {
                    opp.CloseDate = Date.valueOf(closeDateStr);
                }
            }
            
            // Set StageName if provided
            if(opportunityData.containsKey('StageName')) {
                opp.StageName = (String)opportunityData.get('StageName');
            }
            
            
            insert opp;
            System.debug('Opportunity created: ' + opp.Id);
            
            // 4. Link uploaded file to Contact
            if(String.isNotBlank(fileId)) {
                try {
                    ContentDocumentLink cdl = new ContentDocumentLink();
                    cdl.ContentDocumentId = fileId;
                    cdl.LinkedEntityId = con.Id;
                    cdl.ShareType = 'V'; // Viewer permission
                    cdl.Visibility = 'AllUsers'; // Make it visible to all users
                    
                    insert cdl;
                    System.debug('File linked: ' + fileId);
                } catch(Exception fileError) {
                    // Log file linking error but don't fail the whole transaction
                    System.debug('Error linking file: ' + fileError.getMessage());
                }
            }
            
            // Return success message with IDs
            
        } catch(Exception e) {
            System.debug('Error in saveAllData: ' + e.getMessage());
            System.debug('Stack trace: ' + e.getStackTraceString());
            
            // Convert to AuraHandledException for proper LWC error handling
            throw new AuraHandledException(
                'Error saving customer data: ' + e.getMessage() + 
                '. Please check that all required fields are filled correctly.'
            );
        }
    }
    
}