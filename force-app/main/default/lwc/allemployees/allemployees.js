import { LightningElement, wire } from 'lwc';
import allemp from '@salesforce/apex/allEmployees.getEmployees';
import { updateRecord } from 'lightning/uiRecordApi';
import IS_CLICKED_FIELD from '@salesforce/schema/Employee__c.IS_Clicked__c';
import LAST_CLICKED_DATE_FIELD from '@salesforce/schema/Employee__c.Last_Clicked_Date__c';


export default class Allemployees extends LightningElement {
    employees;

    @wire(allemp)
    wiredEmployees({ error, data }) {
        if (data) {
            this.employees = data.map(employee => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const clonedEmployee = { ...employee };

                
                const registeredRecently = new Date(clonedEmployee.CreatedDate) >= sevenDaysAgo;
                clonedEmployee.cssClass = clonedEmployee.IS_Clicked__c ? 'clicked' : (registeredRecently ? 'recent' : 'older');
                return clonedEmployee;
            });
        } else if (error) {
            this.employees = undefined;
            console.error('Error retrieving employees: ', error);
        }
    }

    handleEmployeeClick(event) {
        const employeeId = event.target.dataset.id;
        const fields = {};
        fields['Id'] = employeeId;
        fields[IS_CLICKED_FIELD.fieldApiName] = true;
        fields[LAST_CLICKED_DATE_FIELD.fieldApiName] = new Date().toISOString(); 

        const recordInput = { fields };

        
        updateRecord(recordInput)
            .then(() => {
                console.log('Employee updated successfully');
                this.employees = this.employees.map(employee => {
                    const clonedEmployee = { ...employee };
                    if (employee.Id === employeeId) {
                        clonedEmployee.cssClass = 'clicked';
                        clonedEmployee.Last_Clicked_Date__c = new Date().toISOString();
                        console.log(`Employee ${employee.Name} is now clicked.`);
                    }
                    return clonedEmployee;
                });
            })
            .catch(error => {
                console.error('Error updating record', error);
            });
    }
}