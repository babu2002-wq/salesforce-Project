import { LightningElement, wire,track } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatLoader.getBoatTypes';
import { publish, MessageContext } from 'lightning/messageService';
import BOATCHANNEL from '@salesforce/messageChannel/MyMessageChannel__c';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatTypeFilter extends NavigationMixin(LightningElement) {

    selectedType = '';
    boatTypeOptions = [];

    @wire(MessageContext) messageContext;
    @wire(getBoatTypes)
    wiredboats({ error, data }) {
        if(data){
            let options=data.map(bt=>({
                label:bt.Name,
                value:bt.Id
            }));
            this.boatTypeOptions=[
                { label: 'All Types', value: 'All' },
                ...options]
        }
        else if (error) {
            console.log(error);
        }
    }

    handleChange(event) {
        this.selectedType = event.detail.value;
        const payload = {
            boatTypeId: this.selectedType
        };
        publish(this.messageContext, BOATCHANNEL, payload);
    }

    handleNewBoat() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Boat__c',
                actionName: 'new'
            }
        });
    }

}