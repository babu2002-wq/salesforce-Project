import { LightningElement, wire } from 'lwc';
import registrations from '@salesforce/apex/Registrations.getRegistrations';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Registrations extends LightningElement {
    Registrations;
    selectedAttendee = null;
    

    @wire(registrations)
    wiredRegistrations({ data, error }) {
        if (data) {
            this.Registrations = data;
        }
        else if (error) {
            console.error('Error fetching email: ', error);
        }
    }

    handleRegClick(event) {
        const regId = event.target.dataset.id;
        this.Registrations = this.Registrations.map(reg => ({
            ...reg,
            isSelected: reg.Id === regId ? !reg.isSelected : false
        }));

    }

    handleCancelDetails(event) {
        const regId = event.target.dataset.id;
        this.Registrations = this.Registrations.map(reg => ({
            ...reg,
            isSelected: reg.Id === regId ? false : reg.isSelected
        }));
    }

    handleSuccess() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Attendee registered successfully!',
                variant: 'success'
            })
        );
    }


}