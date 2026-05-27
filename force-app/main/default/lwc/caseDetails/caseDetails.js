import { LightningElement, track, api } from 'lwc';

export default class CaseDetails extends LightningElement {

    @track subject = '';
    @track description = '';
    @track priority = '';

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    handleChange(event) {
        this[event.target.dataset.field] =
            event.detail?.value ?? event.target.value;
    }

    @api getValues() {
        return {
            subject: this.subject,
            description: this.description,
            priority: this.priority
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