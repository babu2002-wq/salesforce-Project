public with sharing class registerPage {
    @AuraEnabled
    public static void register(String user, 
                              String pass, 
                              String emailid, 
                              String Nam, 
                              String Add,
                              String Depart, 
                              String DOb,
                              String phon,
                              String userty) {
        // Check if username already exists
        
        Date dobDate = Date.valueOf(DOb);
        //Integer existing = [SELECT COUNT() FROM Employee__c WHERE Username__c = :username];
        //if (existing > 0) {
          //  throw new AuraHandledException('Username already exists.');
        //}
        
        Employee__c newEmployee = new Employee__c();
            newEmployee.Username__c = user;
            newEmployee.Password__c = pass; // Replace with hashed password
            newEmployee.Email__c = emailid;
            newEmployee.Name = Nam;
            newEmployee.Phone_No__c=phon;
            newEmployee.User_Type__c=userty;

            if (!String.isBlank(Add)){
              newEmployee.Address__c=Add;
            }

            if (!String.isBlank(DOb)){
              newEmployee.DOB__c=dobDate;
            }

            if (!String.isBlank(Depart)){
              newEmployee.Department__c=Depart;
            }


            
            insert newEmployee;
            //return newEmployee.Id;
    }

}