import { LightningElement, wire } from 'lwc';
import SELECTEDCHANNEL from '@salesforce/messageChannel/boatSelectedChannel__c';
import { MessageContext, subscribe, unsubscribe } from 'lightning/messageService';
import getBoats from '@salesforce/apex/BoatLoader.getBoatDetails';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatDetail extends NavigationMixin(LightningElement) {
    boatId;
    boat;
    subscription = null;

    @wire(MessageContext) messageContext;
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            SELECTEDCHANNEL,
            (message) => this.handlemessage(message)
        )

    }

    handlemessage(message) {
        this.boatId = message.boatId;
        getBoats({ boatDetailId: this.boatId })
            .then(result => {
                this.boat = result;
            })
            .catch(error => {
                console.log(error);
            })

    }

    viewBoatDetails() {
        if (this.boatId) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.boatId,
                    objectApiName: 'Boat__c',
                    actionName: 'view'
                }
            });
        }
    }



    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }



}