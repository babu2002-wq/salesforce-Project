import { LightningElement, wire } from 'lwc';
import getLoggedInContactId from '@salesforce/apex/ExamController.getLoggedInContactId';

export default class CoursePage extends LightningElement {
    contactId;
    _attendanceMarked = false;

    @wire(getLoggedInContactId)
    wiredContactId({ error, data }) {
        if (data) {
            this.contactId = data;
            console.log('✅ ContactId from Apex:', this.contactId);
            this.markAttendance(); // ✅ call once we actually have it
        } else if (error) {
            console.error('⚠️ Error fetching ContactId:', error.body?.message || error);
        }
    }

    renderedCallback() {
        // don’t start flow here anymore – only leave for debugging
        console.log('🔄 renderedCallback fired, contactId =', this.contactId);
    }

    markAttendance() {
        if (this._attendanceMarked || !this.contactId) {
            console.log('⚠️ Skipping attendance, already marked or no contactId');
            return;
        }

        this._attendanceMarked = true;

        const flow = this.template.querySelector('lightning-flow');
        if (flow) {
            console.log('🎯 Starting Flow for ContactId:', this.contactId);
            flow.startFlow('Mark_Attendance', [
                { name: 'ContactId', type: 'String', value: this.contactId }
            ]);
        } else {
            console.warn('⚠️ lightning-flow not found in template');
        }
    }
}