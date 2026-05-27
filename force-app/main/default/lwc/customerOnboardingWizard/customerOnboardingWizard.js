import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveAllData from '@salesforce/apex/CustomerOnboardingController.saveAllData';

export default class CustomerOnboardingWizard extends LightningElement {
    activeTab = '1';

    @track account = {};
    @track contact = {};
    @track opportunity = {};
    @track employment = {};

    get disableTab2() { return this.activeTab !== '1'; }
    get disableTab3() { return this.activeTab !== '2'; }
    get disableTab4() { return this.activeTab !== '3'; }

    handleNext(event) {
        Object.assign(this[event.detail.type], event.detail.data);

        if (event.detail.fileId) {
            this.contact.uploadedFileId = event.detail.fileId;
        }

        this.activeTab = String(Number(this.activeTab) + 1);
    }

    handlePrevious() {
        this.activeTab = String(Number(this.activeTab) - 1);
    }

    handleSubmit() {
        saveAllData({
            accountData: this.account,
            contactData: this.contact,
            employmentData: this.employment,
            opportunityData: this.opportunity,
            fileId: this.contact?.uploadedFileId
        })
        .then(() => {
            // success toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Customer Onboarding Completed Successfully',
                    variant: 'success',
                    mode: 'dismissable'
                })
            );
            // reset wizard after success
            this.resetWizard();
        })
        .catch(error => {
            // error toast
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error submitting onboarding',
                    message: (error && (error.body?.message || error.message)) || 'An unknown error occurred',
                    variant: 'error',
                    mode: 'sticky'
                })
            );
        });
    }
    // Reset the entire wizard state and all child steps
    resetWizard() {
        // reset local aggregated state
        this.account = {};
        this.contact = {};
        this.opportunity = {};
        this.employment = {};
        this.activeTab = '1';

        // attempt to call reset() on each child step if exposed
        const childSelectors = [
            'c-step-account',
            'c-step-contact',
            'c-step-opportunity',
            'c-step-review'
        ];
        childSelectors.forEach(sel => {
            const cmp = this.template.querySelector(sel);
            if (cmp && typeof cmp.reset === 'function') {
                try {
                    cmp.reset();
                } catch (e) {
                    // no-op: child may not implement reset yet
                }
            }
        });
    }
}