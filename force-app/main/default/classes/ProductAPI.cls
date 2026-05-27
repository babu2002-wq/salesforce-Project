@RestResource(urlMapping='/v1/products/*')
global with sharing class ProductAPI {

    @HttpPost
    global static void createProduct() {

        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {

            String body = req.requestBody.toString();

            ProductRequest productReq =
                (ProductRequest) JSON.deserialize(
                    body,
                    ProductRequest.class
                );

            Product2 product =
                ProductService.createProduct(productReq);

            ApiResponse response =
                new ApiResponse(
                    true,
                    'Product Created Successfully',
                    product.Id
                );

            res.statusCode = 201;
            res.responseBody =
                Blob.valueOf(JSON.serialize(response));

        } catch (Exception ex) {

            ApiResponse response =
                new ApiResponse(
                    false,
                    ex.getMessage(),
                    null
                );

            res.statusCode = 500;
            res.responseBody =
                Blob.valueOf(JSON.serialize(response));
        }
    }

    
    @HttpPatch
    global static void patchProduct() {

        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        try {

            String productId =
                req.requestURI.substringAfterLast('/');


            Product2 pro = [
                SELECT Id
                FROM Product2
                WHERE Id = :productId
                LIMIT 1
            ];


            Map<String, Object> params =
                (Map<String, Object>)
                JSON.deserializeUntyped(
                    req.requestBody.toString()
                );


            for(String fieldName : params.keySet()) {

                pro.put(
                    fieldName,
                    params.get(fieldName)
                );
            }


            update pro;

            ApiResponse response =
                new ApiResponse(
                    true,
                    'Product Updated Successfully',
                    pro.Id
                );

            res.statusCode = 200;

            res.responseBody =
                Blob.valueOf(
                    JSON.serialize(response)
                );

        } catch(Exception ex) {

            ApiResponse response =
                new ApiResponse(
                    false,
                    ex.getMessage(),
                    null
                );

            res.statusCode = 500;

            res.responseBody =
                Blob.valueOf(
                    JSON.serialize(response)
                );
        }
    }
}