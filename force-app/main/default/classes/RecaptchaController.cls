public with sharing class RecaptchaController {

    @AuraEnabled
    public static Boolean verifyCaptcha(String token) {

        HttpRequest req = new HttpRequest();
        req.setMethod('POST');
        req.setEndpoint(
            'callout:Google_Recaptcha/recaptcha/api/siteverify'
        );

        req.setHeader(
            'Content-Type',
            'application/x-www-form-urlencoded'
        );

        req.setBody(
            'secret=' + EncodingUtil.urlEncode(
                System.Label.Recaptcha_Secret_Key, 'UTF-8'
            ) +
            '&response=' + EncodingUtil.urlEncode(token, 'UTF-8')
        );

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
            Map<String, Object> result =
                (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (Boolean) result.get('success');
        }
        return false;
    }
}