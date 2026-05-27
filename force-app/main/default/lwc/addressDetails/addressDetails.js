import { LightningElement, track, api } from 'lwc';

export default class AddressDetails extends LightningElement {

    @track street = '';
    @track city = '';
    @track state = '';
    @track postalCode = '';

    handleChange(event) {
        this[event.target.dataset.field] = event.target.value;
    }

    @api getValues() {
        return {
            street: this.street,
            city: this.city,
            state: this.state,
            postalCode: this.postalCode
        };
    }
}