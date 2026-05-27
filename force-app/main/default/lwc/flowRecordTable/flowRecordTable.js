import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FlowRecordTable extends LightningElement {
    @api records;              // Contact[] coming directly from Flow
    @api updatedRecords = [];  // Output back to Flow as Contact[]

    @track draftValues = [];

    // Define columns for Contact
    columns = [
        { label: 'First Name', fieldName: 'FirstName', editable: true },
        { label: 'Last Name', fieldName: 'LastName', editable: true },
        { label: 'Email', fieldName: 'Email', type: 'email', editable: true },
        { label: 'Phone', fieldName: 'Phone', editable: true }
    ];

    // Handle inline edits
    handleSave(event) {
        this.draftValues = event.detail.draftValues;

        // Merge edits into records
        const merged = this.records.map(record => {
            const draft = this.draftValues.find(d => d.Id === record.Id);
            return draft ? { ...record, ...draft } : record;
        });

        // Send merged Contact[] back to Flow
        this.updatedRecords = merged;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Contacts updated locally. Flow will capture changes.',
                variant: 'success'
            })
        );

        // Clear draft values
        this.draftValues = [];
    }
}