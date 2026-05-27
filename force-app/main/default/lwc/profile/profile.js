import { LightningElement,wire,api } from 'lwc';
import pro from '@salesforce/apex/ProfilePage.displayProfile';
import Address from '@salesforce/schema/Employee__c.Address__c';
import Username from '@salesforce/schema/Employee__c.Username__c';
import Name from '@salesforce/schema/Employee__c.Name';
import Phone from '@salesforce/schema/Employee__c.Phone_No__c';
import Department from '@salesforce/schema/Employee__c.Department__c';
import DOB from '@salesforce/schema/Employee__c.DOB__c';
import Email from '@salesforce/schema/Employee__c.Email__c';
import Field from '@salesforce/schema/AccountHistory.Field';
import {getRecord,getFieldValue} from 'lightning/uiRecordApi';

export default class Profile extends LightningElement {

    @api employId;
    employee;
    error;
    formattedAddress = 'NA';
    

    // Use connectedCallback to get the sessionStorage item after the component is connected
    connectedCallback() {
        this.employId = sessionStorage.getItem('candidateId');
        console.log('EmployId:', this.employId);
    }

    // Correct usage of the @wire decorator with a method to handle both data and error
    @wire(pro, { EmployeeId: '$employId' })
    wiredEmployee({ data, error }) {
        // Log the employeeId
       
       if (data) {
           this.employee = data;

           const address = data.Address__c;
            if (!address || address.trim() === '' || address === '[object Object]') {
                this.formattedAddress = 'NA';
            } else {
                this.formattedAddress = address;
            }

            this.error = undefined;
           this.error = undefined;
       } else if (error) {
           this.error = error;
           this.employee = undefined;
       }
   }
    
}