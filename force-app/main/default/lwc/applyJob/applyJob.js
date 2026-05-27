import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ApplicationForm extends LightningElement {
    @api recordId; // This is JobAdvertisement__c Id
    @track isModalOpen = false;

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleSuccess(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Application submitted!',
                variant: 'success'
            })
        );
        this.closeModal();
    }
}