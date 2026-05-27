import { LightningElement, api } from 'lwc';

export default class StepOpportunity extends LightningElement {
    @api opportunity = {};

    get disableNext() {
        return !(this.opportunity.Name && this.opportunity.Amount);
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        this.opportunity[field] = event.target.value;
        event.target.reportValidity();
    }

    next() {
        this.dispatchEvent(new CustomEvent('next', {
            detail: { type: 'opportunity', data: this.opportunity }
        }));
    }

    previous() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    @api
    reset() {
        // Clear local state and inputs
        this.opportunity = {};
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