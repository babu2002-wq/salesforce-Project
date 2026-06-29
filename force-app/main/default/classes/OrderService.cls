public with sharing class OrderService {

    public static OrderResponseWrapper createSalesOrder(
        OrderRequestWrapper request){

        OrderResponseWrapper response =
            new OrderResponseWrapper();

        Account acc;

        List<Account> accounts = [

            SELECT Id, Name

            FROM Account

            WHERE Name = :request.accountName

            LIMIT 1

        ];

        if(accounts.isEmpty()){

            acc = new Account();

            acc.Name = request.accountName;

            insert acc;

        }

        else{

            acc = accounts[0];

        }

        Pricebook2 stdPb = [

            SELECT Id

            FROM Pricebook2

            WHERE IsStandard = true

            LIMIT 1

        ];

        Order ord = new Order();

        ord.AccountId = acc.Id;

        ord.EffectiveDate = Date.today();

        ord.Status = 'Draft';

        ord.Pricebook2Id = stdPb.Id;

        insert ord;

        List<OrderItem> orderItems =
            new List<OrderItem>();

        for(OrderRequestWrapper.ProductWrapper p :
            request.products){

            Product2 prod;

            List<Product2> products = [

                SELECT Id

                FROM Product2

                WHERE ProductCode=:p.productCode

                LIMIT 1

            ];

            if(products.isEmpty()){

                prod = new Product2();

                prod.Name = p.productName;

                prod.ProductCode = p.productCode;

                prod.IsActive = true;

                insert prod;

            }

            else{

                prod = products[0];

            }

            PricebookEntry pbe;

            List<PricebookEntry> entries = [

                SELECT Id

                FROM PricebookEntry

                WHERE Product2Id=:prod.Id
                AND Pricebook2Id=:stdPb.Id

                LIMIT 1

            ];

            if(entries.isEmpty()){

                pbe = new PricebookEntry();

                pbe.Pricebook2Id = stdPb.Id;

                pbe.Product2Id = prod.Id;

                pbe.UnitPrice = p.unitPrice;

                pbe.IsActive = true;

                insert pbe;

            }

            else{

                pbe = entries[0];

            }

            OrderItem oi = new OrderItem();

            oi.OrderId = ord.Id;

            oi.PricebookEntryId = pbe.Id;

            oi.Quantity = p.quantity;

            oi.UnitPrice = p.unitPrice;

            orderItems.add(oi);

        }

        insert orderItems;

        response.success = true;

        response.orderId = ord.Id;

        response.orderNumber = ord.OrderNumber;

        response.message = 'Order Created Successfully';

        return response;

    }

}