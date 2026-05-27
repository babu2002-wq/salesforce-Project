import { LightningElement, wire, track } from 'lwc';
import getPendingLeaves from '@salesforce/apex/Leaveapproval.getPendingLeaves';
import updateLeaveStatus from '@salesforce/apex/Leaveapproval.updateLeaveStatus';

export default class LeavePanel extends LightningElement {
    @track pendingLeaves = [];
    @track selectedLeave;
    @track rejectionReason = '';
    @track showRejectReason = false;
    error;

    // Fetch pending leave requests
    @wire(getPendingLeaves)
    wiredPendingLeaves({ error, data }) {
        if (data) {
            this.pendingLeaves = data;
            console.log('Pending leaves data:', JSON.stringify(data));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.pendingLeaves = [];
            console.error('Error loading pending leaves:', error);
        }
    }

    handleSelect(event) {
        const leaveId = event.target.dataset.id;
        this.selectedLeave = this.pendingLeaves.find(leave => leave.Id === leaveId);
        this.showRejectReason = false;
        this.rejectionReason = '';
    }

    handleApprove() {
        this.updateLeaveStatus('Approved');
    }

    handleReject() {
        if (!this.showRejectReason) {
            this.showRejectReason = true;
        } else {
            if (this.rejectionReason.trim() === '') {
                alert('Please provide a reason for rejection.');
                return;
            }
            this.updateLeaveStatus('Rejected');
            this.showRejectReason = false;
        }
    }


    handleRejectionReasonChange(event) {
        this.rejectionReason = event.target.value;
    }

    updateLeaveStatus(status) {
        updateLeaveStatus({
            leaveId: this.selectedLeave.Id,
            status: status,
            rejectionReason: this.rejectionReason
        })
            .then(() => {
                this.pendingLeaves = this.pendingLeaves.filter(leave => leave.Id !== this.selectedLeave.Id);
                this.selectedLeave = null;
                this.showRejectReason = false;
            })
            .catch(error => {
                console.error('Error updating leave status:', error);
            });
    }
}