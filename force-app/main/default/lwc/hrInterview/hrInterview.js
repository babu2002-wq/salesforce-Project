import { LightningElement,wire } from 'lwc';
import getApplications from '@salesforce/apex/hrInterviewPanel.getApplications';


const COLUMNS = [
    { label: 'Applicant Name', fieldName: 'Applicant_Name__c' },
    { label: 'Stage', fieldName: 'Stage__c' }
];
export default class HrInterview extends LightningElement {
    applications;
    columns = COLUMNS;
    @wire(getApplications)
        wiredJobs({ data, error }) {
            if (data) {
                this.applications = data;
                console.log('Applications:', data);
            } else if (error) {
                console.error(error);
            }
        }
}