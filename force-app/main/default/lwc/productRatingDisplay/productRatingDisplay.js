import { LightningElement, api, wire } from 'lwc';

// LMS
import { subscribe, MessageContext } from 'lightning/messageService';
import REVIEW_CHANNEL from '@salesforce/messageChannel/ReviewMessageChannel__c';

// Apex
import getReviewStats from '@salesforce/apex/ReviewController.getReviewStats';

export default class ProductRatingDisplay extends LightningElement {
    @api productId;

    averageRating = 0;
    totalReviews = 0;

    subscription;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.loadRating();       // Initial load
        this.subscribeToChannel(); // Listen for updates
    }

    // 🔥 LMS Subscription
    subscribeToChannel() {
        if (this.subscription) return;

        this.subscription = subscribe(
            this.messageContext,
            REVIEW_CHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    // 🔥 When review is submitted
    handleMessage(message) {
        if (message.productId === this.productId) {

            // ✅ BEST: use direct data if available
            if (message.average !== undefined) {
                this.averageRating = message.average;
                this.totalReviews = message.count;
            } else {
                // fallback → call Apex
                this.loadRating();
            }
        }
    }

    // 🔁 Apex Call
    async loadRating() {
        try {
            const result = await getReviewStats({ productId: this.productId });

            this.averageRating = result.average;
            this.totalReviews = result.count;

        } catch (error) {
            console.error('Error loading rating', error);
        }
    }

    // ⭐ Star Logic (Full + Half Stars)
    get starList() {
        const stars = [];
        const full = Math.floor(this.averageRating);
        const decimal = this.averageRating % 1;

        for (let i = 1; i <= 5; i++) {
            let cls = 'star empty';

            if (i <= full) {
                cls = 'star filled';
            } else if (i === full + 1 && decimal >= 0.3) {
                cls = 'star half';
            }

            stars.push({
                index: i,
                class: cls
            });
        }

        return stars;
    }

    get formattedRating() {
        if (this.averageRating == null) {
            return '0';
        }

        const rounded = Number(this.averageRating).toFixed(1);

        return rounded.endsWith('.0') ? rounded.slice(0, -2) : rounded;
    }
}