import { LightningElement, api } from 'lwc';
import trackProduct from '@salesforce/apex/RecentlyViewedController.trackProduct';

export default class ProductTracker extends LightningElement {

    @api recordId;

    connectedCallback() {
        this.track();
    }

    async track() {
        if (!this.recordId) return;

        try {
            await trackProduct({ productId: this.recordId });
        } catch (e) {
            console.error('Tracking error:', e);
        }
    }
}