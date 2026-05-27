public with sharing class StripePaymentService {

    /*
     * CREATE PAYMENT INTENT
     */
    @AuraEnabled
    public static String createPaymentIntent(String paymentMethodId, String amount, String currencyIsoCodeLC) {

        try {

            Decimal amountDecimal = Decimal.valueOf(amount);
            Long stripeAmount = (Long)(amountDecimal * 100);
            // ✅ Validate input
            if (String.isBlank(paymentMethodId)) {
                throw new AuraHandledException('Missing payment method');
            }

            if (amountDecimal == null || amountDecimal <= 0) {
                throw new AuraHandledException('Invalid amount');
            }

            if (String.isBlank(currencyIsoCodeLC)) {
                currencyIsoCodeLC = 'usd';
            }

            // 💰 Convert to smallest unit (₹ -> paise, $ -> cents)
            

            Map<String, String> params = new Map<String, String>();
            params.put('amount', String.valueOf(stripeAmount));
            params.put('currency', currencyIsoCodeLC.toLowerCase());

            // 🔥 IMPORTANT: attach payment method but DO NOT confirm here
            params.put('payment_method', paymentMethodId);
            params.put('confirmation_method', 'automatic');

            // ❌ DO NOT confirm in Apex (Stripe.js will handle it)
            // params.put('confirm', 'true');

            HttpResponse res = doPost('/v1/payment_intents', params);

            if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {

                Map<String, Object> responseMap =
                    (Map<String, Object>) JSON.deserializeUntyped(res.getBody());

                // ✅ Return ONLY client_secret
                return (String) responseMap.get('client_secret');
            }

            throw new AuraHandledException('Stripe Error: ' + res.getBody());

        } catch (Exception e) {
            throw new AuraHandledException('PaymentIntent Error: ' + e.getMessage());
        }
    }

    /*
     * CAPTURE PAYMENT (optional - only if using manual capture)
     */
    @AuraEnabled
    public static String capturePayment(String paymentIntentId) {

        if (String.isBlank(paymentIntentId)) {
            throw new AuraHandledException('Missing PaymentIntentId');
        }

        HttpResponse res = doPost(
            '/v1/payment_intents/' + paymentIntentId + '/capture',
            new Map<String, String>()
        );

        if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
            return res.getBody();
        }

        throw new AuraHandledException('Capture failed: ' + res.getBody());
    }

    /*
     * REFUND PAYMENT
     */
    @AuraEnabled
    public static String refundPayment(String paymentIntentId, Decimal amount) {

        if (String.isBlank(paymentIntentId)) {
            throw new AuraHandledException('Missing PaymentIntentId');
        }

        if (amount == null || amount <= 0) {
            throw new AuraHandledException('Invalid refund amount');
        }

        Integer stripeAmount = (amount * 100).setScale(0).intValue();

        Map<String, String> params = new Map<String, String>();
        params.put('payment_intent', paymentIntentId);
        params.put('amount', String.valueOf(stripeAmount));

        HttpResponse res = doPost('/v1/refunds', params);

        if (res.getStatusCode() >= 200 && res.getStatusCode() < 300) {
            return res.getBody();
        }

        throw new AuraHandledException('Refund failed: ' + res.getBody());
    }

    /*
     * COMMON HTTP METHOD (Named Credential)
     */
    private static HttpResponse doPost(String path, Map<String, String> params) {

        HttpRequest req = new HttpRequest();

        // ✅ Named Credential (Stripe_API)
        req.setEndpoint('callout:Stripe_API' + path);

        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');

        req.setBody(encodeParams(params));

        Http http = new Http();
        return http.send(req);
    }

    /*
     * ENCODE PARAMS
     */
    private static String encodeParams(Map<String, String> params) {

        List<String> parts = new List<String>();

        for (String key : params.keySet()) {
            parts.add(
                EncodingUtil.urlEncode(key, 'UTF-8') + '=' +
                EncodingUtil.urlEncode(params.get(key), 'UTF-8')
            );
        }

        return String.join(parts, '&');
    }
}