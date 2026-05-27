import { LightningElement, wire, track } from 'lwc';
import getExamsForLoggedInUser from '@salesforce/apex/ExamController.getExamsForLoggedInUser';
import { NavigationMixin } from 'lightning/navigation';


export default class ExamList extends NavigationMixin(LightningElement) {
    @track exams = [];
    columns = [
        { label: 'Exam Name', fieldName: 'Name' },
        { label: 'Start Date', fieldName: 'Start_Date__c', type: 'date' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Start Exam',
                name: 'start_exam',
                variant: 'brand'
            }
        }
    ];

    @wire(getExamsForLoggedInUser)
    wiredExams({ error, data }) {
        if (data) {
            this.exams = data;
        } else if (error) {
            console.error('Error fetching exams: ', error);
        }
    }

    handleRowAction(event) {
        const examId = event.detail.row.Id;
        console.log('examId: ', examId);
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Semester_Exam'
            },
            state: {
                c__examId: examId
            }
        }, true);
    }
}