import { LightningElement, wire, track } from 'lwc';
import createCheckoutSession from '@salesforce/apex/StripePaymentAdapter.createCheckoutSession';
import { CheckoutInformationAdapter } from 'commerce/checkoutApi';

export default class StripeCheckout extends LightningElement {

    @track orderId;
    @track orderTotal;
    @track isLoading = false;

    @wire(CheckoutInformationAdapter)
    checkoutInformation({ data, error }) {
        if (data) {
            console.log('Checkout Data:', data);

            // Grand total from Checkout Store
            this.orderTotal = data?.checkoutSummary?.grandTotalAmount?.value;

            // Order reference (after order creation step)
            this.orderId = data?.checkoutSummary?.orderReferenceNumber;
        }

        if (error) {
            console.error('Checkout Adapter Error:', error);
        }
    }

    async handlePayment() {

        if (!this.orderTotal) {
            alert('Order total not available.');
            return;
        }

        try {
            this.isLoading = true;

            const sessionUrl = await createCheckoutSession({
                orderId: this.orderId,
                amount: this.orderTotal
            });

            window.location.href = sessionUrl;

        } catch (err) {
            console.error('Stripe Error:', err);
            this.isLoading = false;
        }
    }
}