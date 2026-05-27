import { LightningElement, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID_FIELD from '@salesforce/schema/User.ContactId';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import SUBSCRIBED_FIELD from '@salesforce/schema/Contact.Is_Newsletter_Subscribed__c';

import saveNewsletterPreference from '@salesforce/apex/NewsletterSubscription.saveNewsletterPreference';

const USER_FIELDS = [CONTACT_ID_FIELD];

export default class NewsletterSignup extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track isSubscribed = true;
    @track hasSubmitted = false;           // true = form hidden forever, show only confirmation
    @track confirmationMessage = '';       // only updated after successful save or update
    @track errorMessage = '';              // for validation or Apex errors
    @track isLoading = false;
    @track lastAction = 'submit';          // 'submit' or 'update' - determines message wording
    @track displayIconName = 'utility:info';   // shown only after button action completes
    @track displayIconVariant = 'info';        // shown only after button action completes
    @track contactId;
    @track isLoggedIn = false;

    // Get current user's Contact Id
    @wire(getRecord, { recordId: USER_ID, fields: USER_FIELDS })
    wiredUser({ error, data }) {
        if (data) {
            this.contactId = getFieldValue(data, CONTACT_ID_FIELD);
            this.isLoggedIn = !!this.contactId;
        } else if (error) {
            console.error('Error fetching user:', error);
        }
    }

    // Pre-fill from Contact
    @wire(getRecord, {
        recordId: '$contactId',
        fields: [FIRST_NAME_FIELD, LAST_NAME_FIELD, EMAIL_FIELD, SUBSCRIBED_FIELD]
    })
    wiredContact({ error, data }) {
        if (data) {
            this.firstName = getFieldValue(data, FIRST_NAME_FIELD) || '';
            this.lastName = getFieldValue(data, LAST_NAME_FIELD) || '';
            this.email = getFieldValue(data, EMAIL_FIELD) || '';
            this.isSubscribed = getFieldValue(data, SUBSCRIBED_FIELD) || false;

            // If already has data → show confirmation view directly (no form again)
            if (this.email) {
                this.hasSubmitted = true;
                this.updateConfirmationMessage();
            }
        } else if (error) {
            console.error('Error fetching contact:', error);
        }
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    handleCheckboxChange(event) {
        this.isSubscribed = event.target.checked;
        // Do NOT change icon/message here. They change only after submit/update saves.
    }

    updateConfirmationMessage() {
        const isSub = this.isSubscribed;
        const isUpdate = this.lastAction === 'update';

        // Icon decided strictly after action
        this.displayIconName = isSub ? 'utility:success' : (isUpdate ? 'utility:info' : 'utility:warning');
        this.displayIconVariant = isSub ? 'success' : (isUpdate ? 'info' : 'warning');

        // Message copy depending on action + checkbox
        if (this.lastAction === 'submit') {
            this.confirmationMessage = isSub
                ? 'Thank you! You are now subscribed to our newsletter.'
                : 'Please select the checkbox to subscribe.';
        } else {
            // update action after first submit
            this.confirmationMessage = isSub
                ? 'Your newsletter subscription has been updated.'
                : 'You have unsubscribed from the newsletter.';
        }
    }

    async handleSubmit() {
        // Treat button label differences via lastAction flag set by specific handlers
        // Validation only applies before first submission
        if (!this.hasSubmitted && (!this.firstName || !this.lastName || !this.email)) {
            this.errorMessage = 'Please fill all required fields.';
            return;
        }

        this.errorMessage = '';
        this.isLoading = true;

        try {
            await saveNewsletterPreference({
                contactId: this.contactId,
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                isSubscribed: this.isSubscribed
            });

            // Only after successful save → update message.
            // On first submit, hide the form permanently and move to confirmation view.
            this.hasSubmitted = true;
            this.updateConfirmationMessage();

        } catch (error) {
            let msg = error.body?.message || 'An error occurred. Please try again.';
            if (msg.includes('already registered')) {
                msg = 'This email is already registered. Please log in to manage your subscription.';
            }
            this.errorMessage = msg;
        } finally {
            this.isLoading = false;
        }
    }

    // Displayed icon is controlled only after an action completes
    get iconName() {
        return this.displayIconName;
    }

    get iconVariant() {
        return this.displayIconVariant;
    }

    // Separate handler to explicitly mark an update action from the confirmation view
    async handleUpdate() {
        this.lastAction = 'update';
        await this.handleSubmit();
    }

    // For initial subscribe action from the form (pre-submission)
    async handleInitialSubmit() {
        this.lastAction = 'submit';
        await this.handleSubmit();
    }
}