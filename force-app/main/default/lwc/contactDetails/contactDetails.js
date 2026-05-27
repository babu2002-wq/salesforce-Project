import { LightningElement, track, api } from 'lwc';

export default class ContactDetails extends LightningElement {

    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';

    handleChange(event) {
        this[event.target.dataset.field] = event.target.value;
    }

    @api getValues() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone
        };
    }

    @api validate() {
        const inputs = this.template.querySelectorAll('lightning-input');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.reportValidity()) {
                isValid = false;
            }
        });
        return isValid;
    }
}