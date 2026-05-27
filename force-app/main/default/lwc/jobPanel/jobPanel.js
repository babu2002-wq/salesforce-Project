import { LightningElement,wire } from 'lwc';
import getJobAdvertisement from '@salesforce/apex/JobAdvertisement.getJobAdvertisements';
import { refreshApex } from '@salesforce/apex';

export default class JobPanel extends LightningElement {
    jobAdvertisements;

    @wire(getJobAdvertisement)
    wiredJobAdvertisements({ data, error }) {
        if (data) {
            this.jobAdvertisements = data.map(job => ({
                ...job,
                isSelected: false, // To toggle details visibility
                isEditing: false // To toggle edit mode
            }));
        } else if (error) {
            console.error('Error fetching job advertisements', error);
        }
    }

    handleJobClick(event) {
        const jobId = event.target.dataset.id;

        // Toggle the selected state for the clicked job
        this.jobAdvertisements = this.jobAdvertisements.map(job => ({
            ...job,
            isSelected: job.Id === jobId ? !job.isSelected : false,
            isEditing: false // Reset edit mode when toggling details
        }));
    }

    handleEdit(event) {
        const jobId = event.target.dataset.id;

        // Enable edit mode for the selected job
        this.jobAdvertisements = this.jobAdvertisements.map(job => ({
            ...job,
            isEditing: job.Id === jobId // Set edit mode true for the clicked job
        }));
    }

    handleSaveSuccess() {
        // Refresh data after saving
        this.jobAdvertisements = this.jobAdvertisements.map(job => ({
            ...job,
            isEditing: false // Turn off edit mode for all jobs
        }));
        return refreshApex(this.jobAdvertisements);
        
    }

    handleCancelEdit() {
        // Exit edit mode for all jobs
        this.jobAdvertisements = this.jobAdvertisements.map(job => ({
            ...job,
            isEditing: false
        }));
    }

    handleCancelDetails(event) {
        const jobId = event.target.dataset.id;

        // Close the details section for the clicked job
        this.jobAdvertisements = this.jobAdvertisements.map(job => ({
            ...job,
            isSelected: job.Id === jobId ? false : job.isSelected,
            isEditing: false // Ensure edit mode is also reset
        }));
    }
}