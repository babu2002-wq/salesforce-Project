import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RoleSelector extends NavigationMixin(LightningElement) {
    selectedRole = '';

    roleOptions = [
        { label: 'Manager', value: 'Manager' },
        { label: 'Attendees', value: 'Attendees' }
    ];

    handleChange(event) {
        this.selectedRole = event.detail.value;
    }

    handleNavigation() {
        if (!this.selectedRole) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select a role',
                    variant: 'error'
                })
            );
            return;
        }

        const pageMap = {
            'Manager': '/lightning/n/Event_Manager',
            'Attendees': '/lightning/n/Event_Attendee'
        };

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: pageMap[this.selectedRole]
            }
        });
    }
}