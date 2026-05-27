import { LightningElement,api,wire } from 'lwc';
import adminprofile from '@salesforce/apex/admin.profile';
import { NavigationMixin } from 'lightning/navigation';

export default class Adminpro extends NavigationMixin(LightningElement) {

    @api employId;
    adminpr;
    

    
    connectedCallback(){
        this.employId = sessionStorage.getItem('candidateId');
        console.log('EmployId:', this.employId);
    }

    @wire(adminprofile, { employeeId: '$employId' })
    wiredEmployee({ data, error }) {
        // Log the employeeId
       
       if (data) {
           console.log('Employee data:', data);
           this.adminpr = data;
           this.error = undefined;
       }else if (error) {
           this.error = error;
           this.adminpr = undefined;
       }
   }

   handleLogout(){
    this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
            attributes: {
            url: '/lightning/n/HR_System_Login' 
        }
    });
   }
}