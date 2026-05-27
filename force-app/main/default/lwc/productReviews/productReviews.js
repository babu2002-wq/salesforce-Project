import { LightningElement, api, wire, track } from 'lwc';
import getReviews from '@salesforce/apex/ProductReviewController.getReviews';

// LMS
import { subscribe, MessageContext } from 'lightning/messageService';
import REVIEW_CHANNEL from '@salesforce/messageChannel/ReviewMessageChannel__c';
import { refreshApex } from '@salesforce/apex';

export default class ProductReviews extends LightningElement {

    @api productId;
    @track reviews = [];

    subscription = null;

    @wire(MessageContext)
    messageContext;

    // 🔥 Fetch reviews
    @wire(getReviews, { productId: '$productId' })
    wiredReviews(result) {
        this.wiredResult = result; // 🔥 store for refresh
        if (result.data) {
            this.reviews = result.data;
        } else if (result.error) {
            console.error('Review fetch error', result.error);
        }
    }

    // 🔥 SUBSCRIBE LMS
    connectedCallback() {
        this.subscribeToChannel();
    }

    subscribeToChannel() {
        if (this.subscription) return;

        this.subscription = subscribe(
            this.messageContext,
            REVIEW_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {

        // ✅ Only refresh if same product
        if (message.productId === this.productId) {
            this.refreshReviews();
        }
    }

    // 🔥 REFRESH METHOD
    refreshReviews() {
        refreshApex(this.wiredResult);
    }

    // ⭐ stars
    get formattedReviews() {
        return this.reviews.map(r => ({
            ...r,
            stars: Array.from({ length: 5 }, (_, i) => ({
                id: `${r.id}-${i}`,
                filled: i < r.rating
            }))
        }));
    }
}