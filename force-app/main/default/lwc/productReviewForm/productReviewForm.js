import { LightningElement, api, track, wire } from 'lwc';
import Toast from 'lightning/toast';
import saveReviewAndGetStats from '@salesforce/apex/ReviewController.saveReviewAndGetStats';

// LMS
import { publish, MessageContext } from 'lightning/messageService';
import REVIEW_CHANNEL from '@salesforce/messageChannel/ReviewMessageChannel__c';

export default class ProductReviewForm extends LightningElement {
    @api productId;

    @track name = '';
    @track summary = '';
    @track review = '';

    @track selectedRating = 0;
    @track hoverRating = 0;
    @track isSubmitting = false;
    @track showModal = false;

    @wire(MessageContext)
    messageContext;

    // ⭐ Stars
    get starList() {
        const active = this.hoverRating || this.selectedRating;

        return [1, 2, 3, 4, 5].map(star => ({
            value: star,
            class: star <= active ? 'star filled' : 'star'
        }));
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    handleStarClick(event) {
        this.selectedRating = Number(event.target.dataset.value);
    }

    handleMouseOver(event) {
        this.hoverRating = Number(event.target.dataset.value);
    }

    handleMouseOut() {
        this.hoverRating = 0;
    }

    openModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    async handleSubmit() {
        if (!this.name) {
            Toast.show({
                label: 'Error',
                message: 'Name is required',
                variant: 'error'
            }, this);
            return;
        }

        if (!this.selectedRating) {
            Toast.show({
                label: 'Error',
                message: 'Please select rating',
                variant: 'error'
            }, this);
            return;
        }

        this.isSubmitting = true;

        try {
            const result = await saveReviewAndGetStats({
                productId: this.productId,
                rating: this.selectedRating,
                name: this.name,
                summary: this.summary,
                review: this.review
            });

            Toast.show({
                label: 'Success',
                message: 'Review added successfully',
                variant: 'success'
            }, this);

            // 🔥 LMS update
            publish(this.messageContext, REVIEW_CHANNEL, {
                productId: this.productId,
                average: result.average,
                count: result.count
            });

            this.closeModal();

            this.handleClear();

        } catch (error) {
            console.error(error);

            Toast.show({
                label: 'Error',
                message: 'Failed to submit review',
                variant: 'error'
            }, this);

        } finally {
            this.isSubmitting = false;
        }
    }

    handleClear() {
        this.name = '';
        this.summary = '';
        this.review = '';
        this.selectedRating = 0;
        this.hoverRating = 0;
    }
}