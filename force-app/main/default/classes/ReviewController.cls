public with sharing class ReviewController {

    // 🔥 Save Review + Return Updated Stats
    @AuraEnabled
    public static Map<String, Object> saveReviewAndGetStats(
        Id productId, 
        Integer rating, 
        String name, 
        String summary, 
        String review
    ) {
        // Insert Review
        Product_Review__c r = new Product_Review__c(
            Product__c = productId,
            Rating__c = rating,
            Name = name,
            Summary__c = summary,
            Review__c = review
        );
        insert r;

        // Return updated stats
        return getReviewStats(productId);
    }

    // 🔥 Reusable Method (Used by Rating Component via LMS)
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getReviewStats(Id productId) {

        AggregateResult result = [
            SELECT AVG(Rating__c) avgRating, COUNT(Id) total
            FROM Product_Review__c
            WHERE Product__c = :productId
        ];

        Decimal avg = (Decimal) result.get('avgRating');
        Integer count = (Integer) result.get('total');

        // ✅ Null Safety
        if (avg == null) {
            avg = 0;
        }

        if (count == null) {
            count = 0;
        }

        return new Map<String, Object>{
            'average' => avg,
            'count' => count
        };
    }
}