import { LightningElement, track,wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import SELECTEDCHANNEL from '@salesforce/messageChannel/boatSelectedChannel__c';

export default class BoatMap extends LightningElement {
    @track mapMarkers;
    subscription = null;

    // Required for LMS
    static delegatesFocus = true;
    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(
            this.messageContext,
            SELECTEDCHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        console.log('Received message:', JSON.stringify(message));
        if (message.latitude && message.longitude) {
            this.mapMarkers = [
                {
                    location: {
                        Latitude: message.latitude,
                        Longitude: message.longitude
                    },
                    title: message.boatName,
                    description: `Type: ${message.boatType}`
                }
            ];
        } else {
            this.mapMarkers = null;
        }
    }
}