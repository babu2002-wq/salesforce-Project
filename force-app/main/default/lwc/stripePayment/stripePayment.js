import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createPaymentIntent from '@salesforce/apex/StripePaymentService.createPaymentIntent';

// ✅ Correct adapter
import { CheckoutInformationAdapter } from 'commerce/checkoutApi';

export default class StripePayment extends LightningElement {

    @track errorMsg = '';
    @track isProcessing = false;

    stripe;
    cardElement;
    stripeLoaded = false;

    checkoutId;
    totalAmount;

    // ✅ Correct way to get checkout data
    @wire(CheckoutInformationAdapter)
    checkoutInfo({ data, error }) {
        if (data) {
            console.log('✅ Checkout Data:', JSON.stringify(data));

            this.checkoutId = data.checkoutId;

            // 🔥 Dynamic amount extraction (handles all cases)
            this.totalAmount =
                data?.orderSummary?.grandTotalAmount ||
                data?.cartSummary?.grandTotalAmount ||
                data?.grandTotalAmount;

            console.log('💰 Total Amount:', this.totalAmount);
        }

        if (error) {
            console.error('❌ Checkout error:', error);
        }
    }

    renderedCallback() {
        if (this.stripeLoaded) return;
        this.stripeLoaded = true;
        this.loadStripeScript();
    }

    loadStripeScript() {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;

        script.onload = () => {
            console.log('✅ Stripe.js loaded');
            this.initializeStripe();
        };

        script.onerror = () => {
            this.errorMsg = 'Failed to load Stripe.js';
        };

        document.head.appendChild(script);
    }

    initializeStripe() {

        this.stripe = window.Stripe('pk_test_51T68grE94y5ZC6PomYFLP1Gw1JPQvNMoEwtLwbvxrgxq8nlGzwKJje2CVIKkP56MoYYaBCc7KhXhWVv0wY3MqZDT00sUEaSoFO');

        const elements = this.stripe.elements();
        this.cardElement = elements.create('card');

        setTimeout(() => {
            const container = this.template.querySelector('.card-container');

            if (container) {
                this.cardElement.mount(container);
                console.log('✅ Card mounted');
            } else {
                console.error('❌ Card container not found');
            }
        }, 0);
    }

    async handlePayment() {

        console.log('🔥 Pay button clicked');

        if (!this.stripe || !this.cardElement) {
            this.showToast('Error', 'Stripe not ready', 'error');
            return;
        }

        if (!this.totalAmount) {
            this.showToast('Error', 'Amount not available', 'error');
            return;
        }

        this.isProcessing = true;

        try {

            // 🔥 STEP 1: Create PaymentMethod
            const { paymentMethod, error } =
                await this.stripe.createPaymentMethod({
                    type: 'card',
                    card: this.cardElement,
                    billing_details: {
                        name: 'Test Customer'
                    }
                });

            if (error) {
                console.error('❌ Stripe error:', error);
                this.showToast('Error', error.message, 'error');
                return;
            }

            console.log('✅ PaymentMethod:', paymentMethod.id);

            // 🔥 STEP 2: Call Apex
            const clientSecret = await createPaymentIntent({
                paymentMethodId: paymentMethod.id,
                amount: this.totalAmount,
                currencyIsoCodeLC: 'usd' // change if needed
            });

            console.log('✅ Client Secret:', clientSecret);

            // 🔥 STEP 3: Confirm payment
            const result = await this.stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethod.id
            });

            if (result.error) {
                console.error('❌ Payment failed:', result.error);
                this.showToast('Payment Failed', result.error.message, 'error');
                return;
            }

            if (result.paymentIntent.status === 'succeeded') {
                console.log('🎉 Payment Success:', result.paymentIntent);

                this.showToast(
                    'Success',
                    'Payment Successful 🎉',
                    'success'
                );
            }

        } catch (err) {

            console.error('🔥 ERROR:', err);

            this.showToast(
                'Error',
                err.body?.message || err.message,
                'error'
            );

        } finally {
            this.isProcessing = false;
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}