import { LightningElement, wire,api } from 'lwc';
import recentemp from '@salesforce/apex/Recent.getRecentEmployees';

export default class RecentEmployee extends LightningElement {
    employees;
    error;
    @api viewAllClicked=false;

    
    @wire(recentemp)
    wiredEmployees({ error, data }) {
        if (data) {
            //console.log('Data received: ', data); 
            this.employees = data;
            this.error = undefined;
        } else if (error) {
            console.error('Error retrieving employees: ', error); 
            this.employees = undefined;
            this.error = error;
        }
    }

    handleViewAllClick() {
        this.viewAllClicked = true;
    }

    handleCancel(){
        this.viewAllClicked = false;
    }
}