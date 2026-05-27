public with sharing class RelatedProductsController {

    @AuraEnabled(cacheable=true)
    public static List<ProductWrapper> getRelatedProducts(Id productId) {

        if (productId == null) {
            return new List<ProductWrapper>();
        }

        List<ProductWrapper> results = new List<ProductWrapper>();

        // 1️⃣ Get related product links
        List<Product_Related__c> relations = [
            SELECT Related_Product__c
            FROM Product_Related__c
            WHERE Parent_Product__c = :productId
        ];

        if (relations.isEmpty()) return results;

        // 2️⃣ Collect related product Ids
        Set<Id> relatedProductIds = new Set<Id>();
        for (Product_Related__c rel : relations) {
            if (rel.Related_Product__c != null) {
                relatedProductIds.add(rel.Related_Product__c);
            }
        }

        if (relatedProductIds.isEmpty()) return results;

        // 3️⃣ Get Products
        Map<Id, Product2> productMap = new Map<Id, Product2>([
            SELECT Id, Name
            FROM Product2
            WHERE Id IN :relatedProductIds
            AND IsActive = true
        ]);

        /*
        --------------------------------------
        GET PRODUCT PRICES
        --------------------------------------
        */

        Id standardPricebookId = [SELECT Id FROM Pricebook2 WHERE IsStandard = true LIMIT 1].Id;

        Map<Id, Decimal> productPriceMap = new Map<Id, Decimal>();

        for (PricebookEntry pbe : [
            SELECT Product2Id, UnitPrice
            FROM PricebookEntry
            WHERE Product2Id IN :relatedProductIds
            AND Pricebook2Id = :standardPricebookId
            AND IsActive = true
        ]) {
            productPriceMap.put(pbe.Product2Id, pbe.UnitPrice);
        }

        /*
        --------------------------------------
        GET NETWORK ID (FOR CMS IMAGE)
        --------------------------------------
        */

        Id networkId = Network.getNetworkId();
        if (networkId == null) {
            try {
                networkId = [SELECT Id FROM Network WHERE Status = 'Live' LIMIT 1]?.Id;
            } catch (Exception e) {
                networkId = null;
            }
        }

        /*
        --------------------------------------
        GET PRODUCT MEDIA
        --------------------------------------
        */

        Map<Id, String> productToContentKey = new Map<Id, String>();

        for (ProductMedia pm : [
            SELECT ProductId, ElectronicMediaId
            FROM ProductMedia
            WHERE ProductId IN :relatedProductIds
            AND ElectronicMediaId != null
            ORDER BY CreatedDate DESC
        ]) {

            if (!productToContentKey.containsKey(pm.ProductId)) {
                productToContentKey.put(pm.ProductId, String.valueOf(pm.ElectronicMediaId));
            }
        }

        /*
        --------------------------------------
        FETCH CMS IMAGE URL
        --------------------------------------
        */

        Map<Id, String> imageUrlByProduct = new Map<Id, String>();

        if(networkId != null){

            for (Id prodId : productToContentKey.keySet()) {

                String contentKey = productToContentKey.get(prodId);

                Map<String, ConnectApi.ManagedContentNodeValue> contentNodes =
                    getContent(contentKey, networkId);

                if (contentNodes != null && contentNodes.containsKey('source')) {

                    ConnectApi.ManagedContentMediaSourceNodeValue sourceNode =
                        (ConnectApi.ManagedContentMediaSourceNodeValue) contentNodes.get('source');

                    String url = sourceNode.unauthenticatedUrl;

                    if (String.isBlank(url)) {
                        url = sourceNode.url;
                    }

                    if (String.isNotBlank(url)) {
                        imageUrlByProduct.put(prodId, url);
                    }
                }
            }
        }

        /*
        --------------------------------------
        BUILD FINAL RESULT
        --------------------------------------
        */

        for (Id relId : relatedProductIds) {

            Product2 p = productMap.get(relId);
            if (p == null) continue;

            Decimal price = productPriceMap.get(relId);
            String imgUrl = imageUrlByProduct.get(relId);

            results.add(new ProductWrapper(
                p.Id,
                p.Name,
                price,
                imgUrl
            ));
        }

        return results;
    }

    /*
    --------------------------------------
    CMS IMAGE HELPER
    --------------------------------------
    */

    private static Map<String, ConnectApi.ManagedContentNodeValue> getContent(
        String contentId,
        Id networkId
    ) {

        try {

            ConnectApi.ManagedContentVersionCollection coll =
                ConnectApi.ManagedContent.getManagedContentByContentKeys(
                    networkId,
                    new List<String>{contentId},
                    0,
                    1,
                    UserInfo.getLocale(),
                    'cms_image',
                    false
                );

            if (coll != null && coll.items != null && !coll.items.isEmpty()) {
                return coll.items[0].contentNodes;
            }

        } catch (Exception e) {

            System.debug('CMS Error: ' + e.getMessage());
        }

        return new Map<String, ConnectApi.ManagedContentNodeValue>();
    }

    /*
    --------------------------------------
    PROMOTION FETCH (MULTIPLE SUPPORTED)
    --------------------------------------
    */

    @AuraEnabled(cacheable=true)
    public static Map<Id, List<String>> getProductPromotions(List<Id> productIds) {

        Map<Id, List<String>> productPromotionMap = new Map<Id, List<String>>();

        if(productIds == null || productIds.isEmpty()){
            return productPromotionMap;
        }

        List<PromotionTarget> targets = [
            SELECT Promotion.DisplayName, TargetId
            FROM PromotionTarget
            WHERE TargetId IN :productIds
            AND Promotion.IsActive = true
        ];

        for(PromotionTarget pt : targets){

            if(!productPromotionMap.containsKey(pt.TargetId)){
                productPromotionMap.put(pt.TargetId, new List<String>());
            }

            productPromotionMap.get(pt.TargetId).add(pt.Promotion.DisplayName);
        }

        return productPromotionMap;
    }

    /*
    --------------------------------------
    WRAPPER
    --------------------------------------
    */

    public class ProductWrapper {

        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public Decimal price;
        @AuraEnabled public String imageUrl;

        public ProductWrapper(Id i, String n, Decimal p, String img) {

            this.id = i;
            this.name = n;
            this.price = p;
            this.imageUrl = img;
        }
    }
}