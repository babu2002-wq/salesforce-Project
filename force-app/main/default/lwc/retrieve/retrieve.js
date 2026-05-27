import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getEmployeeForUser from '@salesforce/apex/EmployeeController.getEmployeeForUser';

export default class MeRedirect extends NavigationMixin(LightningElement) {
    connectedCallback() {
        getEmployeeForUser()
            .then(result => {
                console.log(result);
                if (result?.Id) {
                    this[NavigationMixin.Navigate]({
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result.Id,
                            objectApiName: 'Employee__c',
                            actionName: 'view'
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Redirect error:', error);
            });
    }
}