import { LightningElement, wire, track } from 'lwc';
import getLeads from '@salesforce/apex/AgentLeadController.getLeads';
import { refreshApex } from '@salesforce/apex';

export default class ParentLeadList extends LightningElement {
    @track leads = [];
    editingLeadId = null;
    wiredLeadsResult;

    columns = [
        { label: 'Last Name', fieldName: 'LastName' },
        { label: 'Email', fieldName: 'Email' },
        { label: 'Phone', fieldName: 'Phone' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Edit',
                name: 'edit',
                variant: 'brand'
            }
        }
    ];

    @wire(getLeads)
    wiredLeads(result) {
        this.wiredLeadsResult = result;
        if (result.data) {
            this.leads = result.data;
        }
    }

    handleRowAction(event) {
        this.editingLeadId = event.detail.row.Id; // 🔥 creates child
    }

    handleModalClose() {
        this.editingLeadId = null; // 🔥 destroys child
    }

    handleUpdateSuccess() {
        this.editingLeadId = null;
        refreshApex(this.wiredLeadsResult);
    }
}