import { LightningElement, wire, track } from 'lwc';
import getAllBoats from '@salesforce/apex/BoatLoader.getBoats';
import updateBoats from '@salesforce/apex/BoatLoader.updateBoats';
import { refreshApex } from '@salesforce/apex';

export default class BoatEditor extends LightningElement {
    @track boats = [];
    @track draftValues = [];
    wiredBoatsResult;

    // Define columns for datatable
    columns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Type', fieldName: 'BoatTypeName', editable: true },
        { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
        { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
        { label: 'Latitude', fieldName: 'Geolocation__Latitude__s', type: 'number', editable: true },
        { label: 'Longitude', fieldName: 'Geolocation__Longitude__s', type: 'number', editable: true }
    ];

    @wire(getAllBoats)
    wiredBoats(result) {
        this.wiredBoatsResult = result;
        const { data, error } = result;
        if (data) {
            this.boats = data.map(boat => ({
                ...boat,
                BoatTypeName: boat.BoatType__r ? boat.BoatType__r.Name : ''
            }));
        } else if (error) {
            console.error('Error fetching boats:', error);
        }
    }



    // Save all edits
    handleSave(event) {
        const updatedFields = event.detail.draftValues;

        updateBoats({ boats: updatedFields })
            .then(() => {
                this.draftValues = [];
                return refreshApex(this.wiredBoatsResult);
            })
            .catch(error => {
                console.error('Error updating boats: ', error);
            });
    }
}