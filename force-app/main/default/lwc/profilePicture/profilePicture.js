import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateContactPicture from '@salesforce/apex/ImageController.updateContactPicture';
import getContactPicture from '@salesforce/apex/ImageController.getContactPicture';

export default class ContactProfilePicture extends LightningElement {
    @api recordId;
    @track profilePictureUrl;

    // Load existing profile picture when component loads
    @wire(getContactPicture, { contactId: '$recordId' })
    wiredPicture({ error, data }) {
        if (data) {
            this.profilePictureUrl = data;
        } else if (error) {
            console.error('Error loading contact picture', error);
        }
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        if (uploadedFiles.length > 0) {
            const docId = uploadedFiles[0].documentId;

            updateContactPicture({ contactId: this.recordId, contentDocumentId: docId })
                .then(url => {
                    this.profilePictureUrl = url;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Profile picture updated!',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                    console.error(error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Failed to update picture',
                            variant: 'error'
                        })
                    );
                });
        }
    }
}