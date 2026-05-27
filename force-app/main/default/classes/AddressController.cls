public with sharing class AddressController {

    // ✅ Get Supported Countries
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getCountries() {

        List<Map<String, String>> countries = new List<Map<String, String>>();

        // 🔥 Get supported countries from Custom Metadata
        Set<String> supportedCountries = new Set<String>();

        for (Supported_Country__mdt rec : [
            SELECT Country_Code__c FROM Supported_Country__mdt
        ]) {
            supportedCountries.add(rec.Country_Code__c);
        }

        // 🔥 Get countries from standard picklist
        for (Schema.PicklistEntry entry : Account.BillingCountryCode.getDescribe().getPicklistValues()) {

            if (entry.isActive() && supportedCountries.contains(entry.getValue())) {

                countries.add(new Map<String, String>{
                    'label' => entry.getLabel(),   // e.g. India
                    'value' => entry.getValue()   // e.g. IN
                });
            }
        }

        return countries;
    }


    // ✅ Get States based on selected Country
    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getStates(String countryCode) {

        List<Map<String, String>> states = new List<Map<String, String>>();

        for (Schema.PicklistEntry entry : Account.BillingStateCode.getDescribe().getPicklistValues()) {

            // 🔥 Matches IN → IN-KA, US → US-CA
            if (entry.isActive() && entry.getValue().startsWith(countryCode)) {

                states.add(new Map<String, String>{
                    'label' => entry.getLabel(),     // e.g. Karnataka
                    'value' => entry.getValue()      // e.g. IN-KA
                });
            }
        }

        return states;
    }
}