import { LightningElement,api } from 'lwc';

export default class Leaves extends LightningElement {

    
    @api showForm = false;

    showLeaveForm(){
        this.showForm = true;
    }

    handleCancel(){
        this.showForm=false;
    }

    }