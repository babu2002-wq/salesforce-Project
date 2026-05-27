import { LightningElement, api, track, wire } from 'lwc';
import getCountries from '@salesforce/apex/AddressController.getCountries';

import { dispatchAction } from 'commerce/actionApi';
import {
    createCheckoutAddressesCreateAction,
    createCheckoutAddressesUpdateAction
} from 'commerce/actionApi';

// ✅ UI API imports (IMPORTANT)
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class CheckoutAddressModal extends LightningElement {

    @api addressData;

    @track form = {
        id: null,
        firstName: '',
        middleName: '',
        lastName: '',
        companyName: '',
        street: '',
        city: '',
        provinceCode: '',
        postalCode: '',
        countryCode: '',
        isDefault: false
    };

    @track countryOptions = [];
    @track stateOptions = [];

    picklistData;

    // ✅ Get Countries (your filtered list)
    @wire(getCountries)
    wiredCountries({ data, error }) {
        if (data) {
            this.countryOptions = data;

            if (!this.form.countryCode && data.length > 0) {
                this.form.countryCode = data[0].value;
            }
        } else if (error) {
            console.error('Country fetch error', error);
        }
    }

    // ✅ Get Object Info
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo;

    // ✅ Get Picklist Metadata (THIS IS THE MAGIC)
    @wire(getPicklistValuesByRecordType, {
        objectApiName: ACCOUNT_OBJECT,
        recordTypeId: '$objectInfo.data.defaultRecordTypeId'
    })
    wiredPicklist({ data, error }) {
        if (data) {
            this.picklistData = data;

            // load states if country already selected
            if (this.form.countryCode) {
                this.setStates();
            }
        } else if (error) {
            console.error('Picklist error', error);
        }
    }

    connectedCallback() {
        if (this.addressData) {
            this.form = {
                id: this.addressData.id,
                firstName: this.addressData.firstName,
                middleName: this.addressData.middleName,
                lastName: this.addressData.lastName,
                companyName: this.addressData.companyName,
                street: this.addressData.street,
                city: this.addressData.city,
                provinceCode: this.addressData.region,
                postalCode: this.addressData.postalCode,
                countryCode: this.addressData.country || '',
                isDefault: this.addressData.isDefault
            };
        }
    }

    // 🔥 CORE LOGIC (DEPENDENT PICKLIST HANDLING)
    setStates() {

        if (!this.picklistData || !this.form.countryCode) return;

        const countryField = this.picklistData.picklistFieldValues.BillingCountryCode;
        const stateField = this.picklistData.picklistFieldValues.BillingStateCode;

        // find index of selected country
        const countryIndex = countryField.values.findIndex(
            c => c.value === this.form.countryCode
        );

        // filter states based on validFor
        this.stateOptions = stateField.values
            .filter(state => state.validFor.includes(countryIndex))
            .map(state => ({
                label: state.label,
                value: state.value
            }));
    }

    get modalTitle() {
        return this.form.id ? 'Edit Address' : 'New Address';
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this.form = {
            ...this.form,
            [field]: event.target.value
        };
    }

    handleCountryChange(event) {
        this.form = {
            ...this.form,
            countryCode: event.detail.value,
            provinceCode: ''
        };

        this.stateOptions = [];
        this.setStates(); // 🔥 correct mapping
    }

    handleStateChange(event) {
        this.form = {
            ...this.form,
            provinceCode: event.detail.value
        };
    }

    handleCheckbox(event) {
        this.form = {
            ...this.form,
            isDefault: event.target.checked
        };
    }

    async handleSave() {

        const payload = {
            firstName: this.form.firstName,
            middleName: this.form.middleName,
            lastName: this.form.lastName,
            companyName: this.form.companyName,
            street: this.form.street,
            city: this.form.city,
            postalCode: this.form.postalCode,
            region: this.form.provinceCode,
            country: this.form.countryCode,
            isDefault: this.form.isDefault,
            addressType: 'Shipping'
        };

        try {
            if (this.form.id) {
                await dispatchAction(
                    this,
                    createCheckoutAddressesUpdateAction({
                        addressId: this.form.id,
                        ...payload
                    })
                );
            } else {
                await dispatchAction(
                    this,
                    createCheckoutAddressesCreateAction(payload)
                );
            }

            this.dispatchEvent(new CustomEvent('saved'));

        } catch (error) {
            console.error('Save Address Error:', error);
        }
    }

    close() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}