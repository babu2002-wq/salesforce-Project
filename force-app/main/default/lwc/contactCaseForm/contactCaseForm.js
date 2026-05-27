import { LightningElement } from 'lwc';
import saveContactAndCase from '@salesforce/apex/ContactCaseController.saveContactAndCase';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import verifyCaptcha from '@salesforce/apex/RecaptchaController.verifyCaptcha';
import { loadScript } from 'lightning/platformResourceLoader';


export default class ContactCaseForm extends LightningElement {

    siteKey = '6LftICssAAAAAOyEBmkIRtWGNyNOlWD4omha6BF9';
    captchaRendered = false;
    widgetId;

    renderedCallback() {
        if (this.captchaRendered) {
            return;
        }
        this.captchaRendered = true;

        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            this.widgetId = window.grecaptcha.render(
                this.template.querySelector('.captcha'),
                {
                    sitekey: this.siteKey
                }
            );
        };

        document.body.appendChild(script);
    }

    async handleSubmit() {
        const token = window.grecaptcha.getResponse(this.widgetId);

        if (!token) {
            this.showToast('Error', 'Please verify you are not a robot', 'error');
            return;
        }

        const isValid = await verifyCaptcha({ token });

        if (!isValid) {
            this.showToast('Error', 'Captcha verification failed', 'error');
            return;
        }

        const contactCmp = this.template.querySelector('c-contact-details');
        const addressCmp = this.template.querySelector('c-address-details');
        const caseCmp = this.template.querySelector('c-case-details');

        if (!contactCmp.validate() || !caseCmp.validate()) {
            return; // stop if required fields missing
        }

        const contactData = contactCmp.getValues();
        const addressData = addressCmp.getValues();
        const caseData = caseCmp.getValues();

        try {
            const caseId = await saveContactAndCase({
                conInput: {
                    FirstName: contactData.firstName,
                    LastName: contactData.lastName,
                    Email: contactData.email,
                    Phone: contactData.phone
                },
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                postalCode: addressData.postalCode,
                caseInput: {
                    Subject: caseData.subject,
                    Description: caseData.description,
                    Priority: caseData.priority
                }
            });

            this.showToast('Success', 'Case Created Successfully', 'success');

        } catch (error) {
            this.showToast('Error', error.body ? error.body.message : error.message, 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}