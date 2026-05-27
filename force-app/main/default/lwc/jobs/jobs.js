import { LightningElement, wire } from 'lwc';
import getJobAdvertisement from '@salesforce/apex/JobAdvertisement.getJobAdvertisements';
import { NavigationMixin } from 'lightning/navigation';


export default class Jobs extends LightningElement {

    jobAdvertisements;
    @wire(getJobAdvertisement)
    wiredJobAdvertisements({ data, error }) {
        if (data) {
            this.jobAdvertisements = data;
        } else if (error) {
            console.error('Error fetching job advertisements', error);
        }
    }


    handleJobClick(event) {

        const jobId = event.currentTarget.dataset.id;
        window.location.href = `/s/detail/${jobId}`;

    }
}