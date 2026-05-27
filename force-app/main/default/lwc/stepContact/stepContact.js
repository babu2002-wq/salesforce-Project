import { LightningElement, api } from 'lwc';

export default class StepContact extends LightningElement {
    @api contact = {};
    @api employment = {};

    uploadedFileId;
    fileError = false;

    get disableNext() {
        return !(
            this.contact.FirstName &&
            this.contact.LastName &&
            this.contact.Email &&
            this.uploadedFileId
        );
    }

    handleContact(event) {
        const field = event.target.dataset.field;
        this.contact[field] = event.target.value;
        event.target.reportValidity();
    }


    handleUpload(event) {
        this.uploadedFileId = event.detail.files[0].documentId;
        this.fileError = false;
    }

    next() {
        if (!this.uploadedFileId) {
            this.fileError = true;
            return;
        }

        this.dispatchEvent(new CustomEvent('next', {
            detail: {
                type: 'contact',
                data: this.contact,
                fileId: this.uploadedFileId
            }
        }));
    }

    previous() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    @api
    reset() {
        // Reset local tracked state
        this.contact = {};
        this.employment = {};
        this.uploadedFileId = undefined;
        this.fileError = false;

        // Clear UI inputs and upload state
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea').forEach(el => {
            try {
                if (typeof el.value !== 'undefined') el.value = null;
                if (typeof el.checked !== 'undefined') el.checked = false;
            } catch (e) { /* no-op */ }
        });
        const refForm = this.template.querySelector('lightning-record-edit-form');
        if (refForm && typeof refForm.reset === 'function') {
            try { refForm.reset(); } catch (e) { /* no-op */ }
        }
    }
}