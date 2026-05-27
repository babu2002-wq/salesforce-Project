import { LightningElement, wire } from 'lwc';
import start from '@salesforce/schema/Leave__c.Start_Date__c';
import end from '@salesforce/schema/Leave__c.End_Date__c';
import reas from '@salesforce/schema/Leave__c.Reason_for_leave__c';
import leatype from '@salesforce/schema/Leave__c.Leave_Type__c';
import leave from '@salesforce/apex/ApplyLeavePage.leaverequest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import email from '@salesforce/apex/ApplyLeavePage.getEmployeeEmail';
import empemail from '@salesforce/schema/Leave__c.Employee_Email__c';



export default class ApplyLeave extends LightningElement {

    employeeEmail;

    employeeId = sessionStorage.getItem('candidateId');

    @wire(email, { employeeId: '$employeeId' })
    wiredEmail({ error, data }) {
        if (data) {
            this.employeeEmail = data;
        } else if (error) {
            console.error('Error fetching email: ', error);
        }
    }

    leavedetail = {
        Start: start,
        End: end,
        Reas: reas,
        Leatype: leatype,
        EmpEmail: empemail
    };

    handlestart(event) {
        this.leavedetail.Start = event.target.value;
    }

    handleend(event) {
        this.leavedetail.End = event.target.value;
    }

    handleleave(event) {
        this.leavedetail.Leatype = event.target.value;
    }

    handlereason(event) {
        this.leavedetail.Reas = event.target.value;
    }

    options = [
        { label: 'Casual Leave', value: 'Casual Leave' },
        { label: 'Unpain Leave', value: 'Unpaid Leave' },
        { label: 'Halfday Leave', value: 'Halfday Leave' },
        { label: 'Short Leave', value: 'Short Leave' }
    ];


    handleSubmit() {
        leave({
            start: this.leavedetail.Start,
            enddat: this.leavedetail.End,
            leavereason: this.leavedetail.Reas,
            leavetype: this.leavedetail.Leatype,
            emplemail: this.leavedetail.EmpEmail,
            employeeId: this.employeeId
        })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Leave record created successfully!',
                        variant: 'success',
                    })
                );
                const cancelEvent = new CustomEvent('cancel');
                this.dispatchEvent(cancelEvent);
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error creating leave record: ' + error.body.message,
                        variant: 'error',
                    })
                );
            });
    }

    handleCancel() {
        const cancelEvent = new CustomEvent('cancel');
        this.dispatchEvent(cancelEvent);
    }
}