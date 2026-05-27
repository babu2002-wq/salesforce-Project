public with sharing class ProductReviewController {

    @AuraEnabled
    public static String submitReview(Id productId, String nickname, Integer rating, String summary, String reviewText) {
        try {
            Product_Review__c rev = new Product_Review__c(
                Product__c   = productId,
                Name  = nickname,
                Rating__c    = rating,
                Summary__c   = summary,
                Review__c    = reviewText
            );
            insert rev;
            return 'Thank you! Your review has been posted.';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getReviews(Id productId) {

        List<Map<String, Object>> result = new List<Map<String, Object>>();

        for (Product_Review__c rev : [
            SELECT Id, Name, Rating__c, Review__c, Summary__c, CreatedDate
            FROM Product_Review__c
            WHERE Product__c = :productId
            ORDER BY CreatedDate DESC
        ]) {
            result.add(new Map<String, Object>{
                'id' => rev.Id,
                'name' => rev.Name,
                'rating' => rev.Rating__c,
                'comment' => rev.Review__c,
                'title' => rev.Summary__c,
                'date' => String.valueOf(rev.CreatedDate.date())
            });
        }

        return result;
    }
}