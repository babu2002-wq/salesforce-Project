import { LightningElement,api } from 'lwc';
import rev from '@salesforce/apex/ReviewPage.updateReview';
import get from '@salesforce/apex/ReviewPage.getReview';

export default class Review extends LightningElement {

    @api employId;
    error;
    reviewData;
    showReviewField=false; 
    isRejected = false; 
    review = '';
    rejectionReason = ''; 
     
    showReasonField = false;

    connectedCallback() {
        this.employId = sessionStorage.getItem('candidateId');
        this.loadReview();
    }

    handleUpdate(){
        this.showReviewField=true;
    }

    handleReviewChange(event) {
        this.review = event.target.value;
    }
    
    handleRejectionReasonChange(event) {
        this.rejectionReason = event.target.value;
    }

    handleReject() {
        this.isRejected = true;
        this.showReasonField = true;
    }

    handleSubmit() {
        const rejectionReason = this.rejectionReason || null;
        rev({ employeeId: this.employId, revi:this.review, isReject:this.isRejected, rejectReason:rejectionReason })
            .then(() => {
                this.error = null;
                alert('Review updated successfully!');
                this.showReviewField=false;
                this.loadReview();
            })
            .catch(error => {
                this.error = error;
            });
    }

    loadReview() {
        get({ employeeId: this.employId })
            .then(result => {
                this.reviewData = result;
                this.review = result.Name;
            })
            .catch(error => {
                this.reviewData = false;
            });
    }
}