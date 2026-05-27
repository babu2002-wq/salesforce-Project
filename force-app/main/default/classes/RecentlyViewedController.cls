public with sharing class RecentlyViewedController {

    @AuraEnabled
    public static void trackProduct(String productId) {

        if (String.isBlank(productId)) return;

        Id userId = UserInfo.getUserId();

        // Remove duplicate
        List<Recently_Viewed_Product__c> existing = [
            SELECT Id FROM Recently_Viewed_Product__c
            WHERE User__c = :userId
            AND Product_Id__c = :productId
            LIMIT 1
        ];

        if (!existing.isEmpty()) {
            delete existing;
        }

        // Insert new record
        Recently_Viewed_Product__c record = new Recently_Viewed_Product__c(
            User__c = userId,
            Product_Id__c = productId,
            Viewed_On__c = System.now()
        );

        insert record;

        // Keep max 10
        List<Recently_Viewed_Product__c> allRecords = [
            SELECT Id FROM Recently_Viewed_Product__c
            WHERE User__c = :userId
            ORDER BY Viewed_On__c DESC
        ];

        if (allRecords.size() > 10) {
            List<Recently_Viewed_Product__c> toDelete = new List<Recently_Viewed_Product__c>();

for (Integer i = 10; i < allRecords.size(); i++) {
    toDelete.add(allRecords[i]);
}

if (!toDelete.isEmpty()) {
    delete toDelete;
}
        }
    }

    @AuraEnabled
public static List<String> getViewedProducts() {

    Id userId = UserInfo.getUserId();

    List<Recently_Viewed_Product__c> records = [
        SELECT Product_Id__c
        FROM Recently_Viewed_Product__c
        WHERE User__c = :userId
        ORDER BY Viewed_On__c DESC
        LIMIT 10
    ];

    List<String> ids = new List<String>();

    for (Recently_Viewed_Product__c r : records) {
        ids.add(r.Product_Id__c);
    }

    return ids;
}
}