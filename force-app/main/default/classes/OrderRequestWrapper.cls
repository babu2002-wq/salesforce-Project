public class OrderRequestWrapper {

    public String opportunityId;
    public String opportunityName;
    public String accountId;
    public String accountName;
    public Decimal totalAmount;
    public Date closeDate;

    public List<ProductWrapper> products;

    public class ProductWrapper{

        public String productCode;
        public String productName;
        public Decimal quantity;
        public Decimal unitPrice;
    }

}