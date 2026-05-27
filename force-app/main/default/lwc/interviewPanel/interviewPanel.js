import { LightningElement,wire,api } from 'lwc';
import updateApplicationStatus from '@salesforce/apex/ApplicationProcess.updateApplicationStatus';
import getApplications from '@salesforce/apex/ApplicationProcess.getallApplications';
import getStatus from '@salesforce/apex/ApplicationProcess.getApplicationstatus';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class InterviewPanel extends LightningElement {
    applications=[]; // Fetch application records in connectedCallback or use Apex @wire
    @api applicationId;
    @api isPassed;
    applicationDetails;

    @wire(getApplications)
    wiredJobs({ data, error }) {
        if (data) {
            this.applications = data;
            console.log('Applications:', data);
        } else if (error) {
            console.error(error);
        }
    }

    

    handlePass(event) {
        const applicationId = event.target.dataset.id;
        this.updateStatus(applicationId, true);
        this.fetchApplicationDetails(applicationId);
    }

    handleReject(event) {
        const applicationId = event.target.dataset.id;
        this.updateStatus(applicationId, false);
        this.fetchApplicationDetails(applicationId);
    }

    updateStatus(applicationId, isPassed) {
        updateApplicationStatus({ applicationId, isPassed })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Application status updated successfully',
                        variant: 'success',
                    })
                );
                // Refresh or fetch updated applications list
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating status',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    fetchApplicationDetails(applicationId) {
        if (!applicationId) {
            console.error('Application ID is not provided');
            return;
        }
        getStatus({ applicationId })
            .then((result) => {
                this.applicationDetails = result;
                console.log('Fetched Application Details:', result);
            })
            .catch((error) => {
                console.error('Error fetching application details:', error);
                //this.showToast('Error', 'Failed to fetch application details.', 'error');
            });
    }
}