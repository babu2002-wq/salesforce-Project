import { LightningElement ,api} from 'lwc';

export default class ChangeStatus extends LightningElement {
    @api recordId;
    handleSuccess(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Status updated successfully.',
                variant: 'success'
            })
        );
    }
}