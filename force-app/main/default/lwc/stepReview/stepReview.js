import { LightningElement, api } from 'lwc';

export default class StepReview extends LightningElement {
    @api account;
    @api contact;
    @api employment;
    @api opportunity;

    previous() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    submit() {
        this.dispatchEvent(new CustomEvent('submit'));
    }

    @api
    reset() {
        // Clear public inputs shown in review
        this.account = undefined;
        this.contact = undefined;
        this.employment = undefined;
        this.opportunity = undefined;
    }
}