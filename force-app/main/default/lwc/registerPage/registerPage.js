import { LightningElement, track } from 'lwc';

export default class EmployeeRegistration extends LightningElement {
    @track passwordValue = '';

    handlePasswordChange(event) {
        this.passwordValue = event.target.value;
    }

    handleSubmit(event) {
        // Validate all fields before submission
        const allValid = [
            ...this.template.querySelectorAll('lightning-input-field'),
            this.template.querySelector('lightning-input[type="password"]')
        ].reduce((validSoFar, inputField) => {
            inputField.reportValidity();
            return validSoFar && inputField.checkValidity();
        }, true);

        if (!allValid) {
            event.preventDefault();
            return;
        }

        // Add password to fields and submit
        const fields = event.detail.fields;
        fields.Password__c = this.passwordValue;
    }

    handleSuccess(event) {
        // Show success message
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Employee registered successfully',
                variant: 'success'
            })
        );
    }

    handleCancel() {
        // Handle cancel action
    }
}