import { LightningElement, track } from 'lwc';
import clockIn from '@salesforce/apex/AttendanceController.clockIn';
import clockOut from '@salesforce/apex/AttendanceController.clockOut';
import getLatestAttendance from '@salesforce/apex/AttendanceController.getLatestAttendance';

export default class AttendanceTracker extends LightningElement {
    @track attendanceId;
    @track clockInTime;
    @track clockOutTime;
    @track totalHours;
    @track isClockedIn = false;

    connectedCallback() {
        this.loadLatestAttendance();
    }


    get clockLabel() {
        return this.isClockedIn ? 'Clock Out' : 'Clock In';
    }

    async handleClockButtonClick() {
        try {
            let result;
            if (this.isClockedIn) {
                // Clock Out
                result = await clockOut({ attendanceId: this.attendanceId });
            } else {
                // Clock In
                result = await clockIn();
            }

            this.attendanceId = result.Id;
            this.clockInTime = result.Clock_In_Time__c;
            this.clockOutTime = result.Clock_Out_Time__c;
            this.totalHours = result.Total_Hours__c;
            this.isClockedIn = this.clockOutTime ? false : true;
        } catch (error) {
            console.error('Error in Clock In/Out:', error);
        }
    }

    loadLatestAttendance() {
        getLatestAttendance()
            .then(result => {
                if (result) {
                    this.attendanceId = result.Id;
                    this.clockInTime = result.Clock_In_Time__c;
                    console.log('Clock In Time: ' + result.Clock_In_Time__c);

                    this.clockOutTime = result.Clock_Out_Time__c;
                    console.log('Clock Out Time: ' + result.Clock_Out_Time__c);

                    this.totalHours = result.Total_Hours__c;
                    this.isClockedIn = result.Clock_Out_Time__c == null;
                } else {
                    this.attendanceId = null;
                    this.clockInTime = null;
                    this.clockOutTime = null;
                    this.totalHours = null;
                    this.isClockedIn = false;
                }
            })
            .catch(error => {
                console.error('Error loading attendance:');
                console.dir(error);

                // Try to get plain JSON
                try {
                    console.error('JSON stringified error:', JSON.stringify(error));
                } catch (e) {
                    console.error('Error stringifying:', e);
                }

                // Log the raw body
                if (error && error.body) {
                    console.error('Error body:', error.body);
                }

                // If there is a message
                if (error && error.body && error.body.message) {
                    console.error('Error message:', error.body.message);
                }

                // If there are pageErrors
                if (error && error.body && error.body.pageErrors) {
                    console.error('Page Errors:', error.body.pageErrors);
                }

                // If there are fieldErrors
                if (error && error.body && error.body.fieldErrors) {
                    console.error('Field Errors:', error.body.fieldErrors);
                }

                // If there is statusText
                if (error && error.statusText) {
                    console.error('Status Text:', error.statusText);
                }
            });

    }
}