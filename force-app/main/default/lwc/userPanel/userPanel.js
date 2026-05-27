import { LightningElement,wire,api } from 'lwc';
import createApplication from '@salesforce/apex/JobApplication.createApplication';
import getJobAdvertisements from '@salesforce/apex/JobAdvertisement.getJobAdvertisements';
import Name from '@salesforce/schema/Application__c.Applicant_Name__c';
import Phone from '@salesforce/schema/Application__c.Contact_Number__c';
import Email from '@salesforce/schema/Application__c.Email_ID__c';
import YOE from '@salesforce/schema/Application__c.Years_of_Experience__c';

export default class UserPanel extends LightningElement {
    jobAdvertisements;
    selectedJob = null;
    formData = {
        name: Name,
        contact: Phone,
        email:Email,
        experience: YOE
    };

    @wire(getJobAdvertisements)
    wiredJobs({ data, error }) {
        if (data) {
            this.jobAdvertisements = data;
            console.log('Fetched Jobs:', data);
        } else if (error) {
            console.error(error);
        }
    }

    

    handleApply(event) {
        this.selectedJob = event.target.dataset.id;
    }

    handleInputChange(event) {
        this.formData[event.target.dataset.field] = event.target.value;
    }

    submitApplication() {
        if (this.selectedJob) {
            createApplication({
                jobId:this.selectedJob,
                applicantName: this.formData.name,
                contact: this.formData.contact,
                email: this.formData.email,
                experience: this.formData.experience
            })
                .then(() => {
                    alert('Application Submitted Successfully!');
                    
                    this.resetForm();
                })
                .catch((error) => {
                    console.error('Error creating application:', error);
                });
        } else {
            alert('No job selected!');
        }
    }

    handleJobClick(event) {
        const jobId = event.target.dataset.id;
        console.log(jobId);

        // Toggle the selected state for the clicked job
        this.jobAdvertisements = this.jobAdvertisements.map(job => ({
            ...job,
            isSelected: job.Id === jobId ? !job.isSelected : false // Reset edit mode when toggling details
        }));
    }

    handleCancelDetails(event) {
        const jobId = event.target.dataset.id;

        // Close the details section for the clicked job
        this.jobAdvertisements = this.jobAdvertisements.map(job => ({
            ...job,
            isSelected: job.Id === jobId ? false : job.isSelected 
        }));
    }

}