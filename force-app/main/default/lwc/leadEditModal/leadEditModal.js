import { LightningElement, api, track } from 'lwc';
import getLeadById from '@salesforce/apex/AgentLeadController.getLeadById';
import updateLead from '@salesforce/apex/AgentLeadController.createLead';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LeadEditModal extends LightningElement {
    @api leadId;

    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track notes = '';

    connectedCallback() {
        this.loadLead();
    }

    loadLead() {
        getLeadById({ leadId: this.leadId })
            .then(lead => {
                this.firstName = lead.FirstName || '';
                this.lastName = lead.LastName || '';
                this.email = lead.Email || '';
                this.phone = lead.Phone || '';
                this.notes = lead.Description || '';
            });
    }

    handleChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    updateLead() {
        const leadObj = {
            Id: this.leadId,
            FirstName: this.firstName,
            LastName: this.lastName,
            Email: this.email,
            Phone: this.phone,
            Description: this.notes,
            Company: 'Individual'
        };

        updateLead({ inputLead: leadObj })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Lead updated successfully',
                        variant: 'success'
                    })
                );

                this.dispatchEvent(new CustomEvent('success'));
            });
    }

    close() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}