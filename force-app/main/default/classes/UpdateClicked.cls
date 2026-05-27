global class UpdateClicked implements Schedulable {
    global void execute(SchedulableContext context) {
        DateTime sevenDaysAgo = System.now().addDays(-7);
        
        List<Employee__c> employeesToUpdate = [SELECT Id FROM Employee__c 
                                                WHERE Last_Clicked_Date__c < :sevenDaysAgo OR Last_Clicked_Date__c = null];

        for (Employee__c employee : employeesToUpdate) {
            employee.Is_Clicked__c = false; // Set Is_Clicked__c to true if not clicked for 7 days
        }

        if (!employeesToUpdate.isEmpty()) {
            update employeesToUpdate;
        }
    }
}