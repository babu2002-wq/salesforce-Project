@RestResource(urlMapping='/orders/*')
global with sharing class OrderAPI {

    @HttpPost
    global static void createOrder() {

        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {

            OrderRequestWrapper request =
                (OrderRequestWrapper)JSON.deserialize(
                    req.requestBody.toString(),
                    OrderRequestWrapper.class
                );

            OrderResponseWrapper response =
                OrderService.createSalesOrder(request);

            res.statusCode = 200;
            res.addHeader('Content-Type','application/json');
            res.responseBody =
                Blob.valueOf(JSON.serialize(response));

        }
        catch(Exception ex){

            res.statusCode = 500;
            res.responseBody =
                Blob.valueOf(
                    '{"success":false,"message":"'+
                    ex.getMessage()+
                    '"}'
                );
        }
    }
}