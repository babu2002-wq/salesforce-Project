global class MonthlyCommissionBatch implements Database.Batchable<SObject>, Database.Stateful {

    List<Commission_Rule__mdt> slabs;

    // Load CMDT slabs once to avoid repeated SOQL
    public MonthlyCommissionBatch() {
        slabs = [
            SELECT Min_Amount__c, Max_Amount__c, Commission_Percentage__c
            FROM Commission_Rule__mdt
            ORDER BY Min_Amount__c ASC
        ];
    }

    global Database.QueryLocator start(Database.BatchableContext bc) {
        Date today = Date.today();
        Date firstThisMonth = today.toStartOfMonth();
        Date firstLastMonth = firstThisMonth.addMonths(-1);
        Date lastLastMonth = firstThisMonth.addDays(-1);

        return Database.getQueryLocator([
            SELECT Id, Amount, OwnerId, StageName, CloseDate
            FROM Opportunity
            WHERE StageName = 'Closed Won'
            AND CloseDate >= :firstLastMonth
            AND CloseDate <= :lastLastMonth
        ]);
    }

    global void execute(Database.BatchableContext bc, List<Opportunity> oppList) {
        List<Commission__c> records = new List<Commission__c>();

        for (Opportunity opp : oppList) {
            Decimal percent = getSlabPercent(opp.Amount);
            Decimal commission = opp.Amount * (percent / 100);

            records.add(new Commission__c(
                Opportunity__c = opp.Id,
                User__c = opp.OwnerId,
                Commission_Percentage__c = percent,
                Commission_Amount__c = commission,
                Commission_Month__c = Date.today().toStartOfMonth().addMonths(-1)
            ));
        }

        if (!records.isEmpty()) {
            insert records;
        }
    }

    private Decimal getSlabPercent(Decimal amount) {
        for (Commission_Rule__mdt slab : slabs) {
            if (amount >= slab.Min_Amount__c && amount <= slab.Max_Amount__c) {
                return slab.Commission_Percentage__c;
            }
        }
        return 0;
    }

    global void finish(Database.BatchableContext bc) {
        System.debug('Commission Batch Completed Successfully.');
    }
}