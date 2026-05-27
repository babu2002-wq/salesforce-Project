import { LightningElement, api } from 'lwc';

export default class StepAccount extends LightningElement {
    @api account = {};

    get disableNext() {
        return !(this.account.Name && this.account.Industry);
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        this.account[field] = event.target.value;
        event.target.reportValidity();
    }

    next() {
        this.dispatchEvent(new CustomEvent('next', {
            detail: { type: 'account', data: this.account }
        }));
    }

    @api
    reset() {
        // Clear local state and any inputs
        this.account = {};
        // If using record-edit-form or inputs, reset their UI values
        this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-textarea').forEach(el => {
            try {
                if (typeof el.value !== 'undefined') el.value = null;
                if (typeof el.checked !== 'undefined') el.checked = false;
                if (typeof el.disabled !== 'undefined') el.disabled = false;
            } catch (e) {
                // no-op
            }
        });
        const refForm = this.template.querySelector('lightning-record-edit-form');
        if (refForm && typeof refForm.reset === 'function') {
            try { refForm.reset(); } catch (e) { /* no-op */ }
        }
    }
}