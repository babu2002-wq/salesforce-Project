import { MessageContext, publish, subscribe } from 'lightning/messageService';
import { LightningElement, wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatLoader.getBoats';
import BOATCHANNEL from '@salesforce/messageChannel/MyMessageChannel__c';
import SELECTEDCHANNEL from '@salesforce/messageChannel/boatSelectedChannel__c';
import getBoatsByType from '@salesforce/apex/BoatLoader.getBoatsByType';

export default class BoatsGallery extends LightningElement {
    boats = [];
    subscription = null;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            BOATCHANNEL,
            (message) => this.handleMessage(message)
        )
    }

    handleMessage(message) {
        if (message.boatTypeId === 'All') {
            getBoats()
                .then(result => {
                    this.boats = result;
                    console.log("Boat Details:", result);
                })
                .catch(error => {
                    console.log(error)
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else if (message.boatTypeId !== 'All') {
            getBoatsByType({ boatTypeId: message.boatTypeId })
                .then(result => {
                    this.boats = result;
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            // No type selected → clear the list
            this.boats = [];
        }
    }

    handleBoatSelect(event){
        const boatId = event.target.dataset.id;
        const boatName = event.target.dataset.name;
        const boatLat = parseFloat(event.target.dataset.lat);
        const longitude = parseFloat(event.target.dataset.lon);
        const price = event.target.dataset.pri;
        const boatType = event.target.dataset.type;
        const boatLength = event.target.dataset.len;

        const payload = {
            boatId: boatId,
            boatName: boatName,
            latitude: boatLat,
            longitude: longitude,
            boatPrice: price,
            boatType: boatType,
            boatlength: boatLength
        };
        publish(this.messageContext,SELECTEDCHANNEL,payload);

    }

}