public class OpportunityLineItemController {

    /*======================= WRAPPER CLASSES =======================*/

    public class AccountWrapper {
        @AuraEnabled public Id accountId{get; set;}
        @AuraEnabled public String accountName{get; set;}
        @AuraEnabled public List<OpportunityWrapper> opportunities{get; set;}
    }

    public class OpportunityWrapper {
        @AuraEnabled public Id oppId{get; set;}
        @AuraEnabled public String oppName{get; set;}
        @AuraEnabled public Decimal amount{get; set;}
        @AuraEnabled public List<LineItemWrapper> lineItems{get; set;}
    }

    public class LineItemWrapper {
        @AuraEnabled public Id lineItemId{get; set;}
        @AuraEnabled public String productName{get; set;}
        @AuraEnabled public Decimal quantity{get; set;}
        @AuraEnabled public Decimal totalPrice{get; set;}
    }

    /*======================= APEX METHOD =======================*/

    @AuraEnabled(cacheable=true)
    public static List<AccountWrapper> getAccountHierarchy() {

    List<AccountWrapper> accList = new List<AccountWrapper>();

    // 1️⃣ Query accounts + opportunities (1-level)
    List<Account> accounts = [
        SELECT Id, Name,
               (SELECT Id, Name, Amount FROM Opportunities)
        FROM Account
        ORDER BY Name 
        LIMIT 50
    ];

    // Gather all Opp IDs
    Set<Id> oppIds = new Set<Id>();
    for (Account acc : accounts) {
        for (Opportunity o : acc.Opportunities) {
            oppIds.add(o.Id);
        }
    }

    // 2️⃣ Query line items separately
    Map<Id, List<OpportunityLineItem>> oliMap =
        new Map<Id, List<OpportunityLineItem>>();

    for (OpportunityLineItem oli : [
        SELECT Id, Quantity, TotalPrice,
               PricebookEntry.Product2.Name,
               OpportunityId
        FROM OpportunityLineItem
        WHERE OpportunityId IN :oppIds
    ]) {
        if (!oliMap.containsKey(oli.OpportunityId)) {
            oliMap.put(oli.OpportunityId, new List<OpportunityLineItem>());
        }
        oliMap.get(oli.OpportunityId).add(oli);
    }

    // 3️⃣ Build wrappers
    for (Account acc : accounts) {

        AccountWrapper aw = new AccountWrapper();
        aw.accountId = acc.Id;
        aw.accountName = acc.Name;
        aw.opportunities = new List<OpportunityWrapper>();

        for (Opportunity o : acc.Opportunities) {

            OpportunityWrapper ow = new OpportunityWrapper();
            ow.oppId = o.Id;
            ow.oppName = o.Name;
            ow.amount = o.Amount;
            ow.lineItems = new List<LineItemWrapper>();

            if (oliMap.containsKey(o.Id)) {
                for (OpportunityLineItem oli : oliMap.get(o.Id)) {
                    LineItemWrapper lw = new LineItemWrapper();
                    lw.lineItemId = oli.Id;
                    lw.productName = oli.PricebookEntry.Product2.Name;
                    lw.quantity = oli.Quantity;
                    lw.totalPrice = oli.TotalPrice;
                    ow.lineItems.add(lw);
                }
            }

            aw.opportunities.add(ow);
        }
        accList.add(aw);
    }

    return accList;
}

}