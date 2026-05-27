public with sharing class BoatLoader {
    @AuraEnabled(cacheable=true)
    public static List<BoatType__c> getBoatTypes(){
        List<BoatType__c> boatTypes=[Select Id,Name from BoatType__c];
        return boatTypes;
    }

    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoats(){
        List<Boat__c> boats=[Select Id,Name,Price__c,Length__c,Geolocation__Latitude__s,Geolocation__Longitude__s,BoatType__r.Name from Boat__c];
        return boats;
    }
    
    @AuraEnabled(cacheable=true)
    public static Boat__c getBoatDetails(String boatDetailId){
        Boat__c boats=[Select Id,Name,Price__c,Length__c,BoatType__r.Name from Boat__c  WHERE Id = :boatDetailId
        LIMIT 1];
        return boats;
    }


    @AuraEnabled(cacheable=true)
    public static List<Boat__c> getBoatsByType(String boatTypeId){
        List<Boat__c> boatsgallery=[Select Id,Name,Price__c,Length__c,Geolocation__Latitude__s,Geolocation__Longitude__s,BoatType__r.Name from Boat__c where BoatType__c=:boatTypeId];
        return boatsgallery;
    }

    @AuraEnabled
    public static void updateBoats(List<Boat__c> boats) {
        try {
            update boats;
        } catch (Exception e) {
            throw new AuraHandledException('Failed to update boats: ' + e.getMessage());
        }
    }
}