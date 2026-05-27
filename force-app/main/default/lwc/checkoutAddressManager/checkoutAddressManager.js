import { LightningElement, wire, track } from 'lwc';
import { CheckoutAddressAdapter } from 'commerce/checkoutApi';

export default class CheckoutAddressManager extends LightningElement {

    @track addresses = [];
    @track selectedAddressId;
    @track showModal = false;
    @track editingAddress;

    @wire(CheckoutAddressAdapter)
    wiredAddresses({ data, error }) {
        if (data) {
            console.log("addresses:", data);
            this.selectedAddressId = data.selectedAddressId;

            this.addresses = (data.addressList || []).map(addr => ({
                ...addr,
                isSelected: addr.id === data.selectedAddressId,
                showEdit: addr.id === data.selectedAddressId
            }));
        }

        if (error) {
            console.error('Address Adapter Error:', error);
        }
    }

    get hasAddresses() {
        return this.addresses && this.addresses.length > 0;
    }

    handleSelect(event) {
        this.selectedAddressId = event.target.value;

        this.addresses = this.addresses.map(addr => ({
            ...addr,
            isSelected: addr.id === this.selectedAddressId,
            showEdit: addr.id === this.selectedAddressId
        }));
    }

    handleEdit(event) {
        const id = event.currentTarget.dataset.id;
        this.editingAddress = this.addresses.find(a => a.id === id);
        this.showModal = true;
    }

    handleNew() {
        this.editingAddress = null;
        this.showModal = true;
    }

    handleClose() {
        this.showModal = false;
    }

    handleSaved() {
        this.showModal = false;
        // No manual refresh needed — adapter auto re-runs
    }
}