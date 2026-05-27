public with sharing class StripePaymentController {

    @AuraEnabled
    public static Id saveCardToken(String token){

        PaymentGateway gateway = [
            SELECT Id
            FROM PaymentGateway
            WHERE PaymentGatewayName = 'Stripe'
            LIMIT 1
        ];

        CardPaymentMethod card = new CardPaymentMethod();

        card.CardHolderName = 'Stripe Customer';
        card.CardType = 'Visa';
        card.GatewayToken = token;
        card.Status = 'Active';
        card.ProcessingMode = 'External';
        card.PaymentGatewayId = gateway.Id;

        insert card;

        return card.Id;
    }

}