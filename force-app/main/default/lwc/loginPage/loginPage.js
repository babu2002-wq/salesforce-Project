import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import login from '@salesforce/apex/loginPage.login'
import Username from '@salesforce/schema/User.Username';

export default class LoginPage extends NavigationMixin(LightningElement) {
    username = '';
    password = '';
    error;

    handleusername(event) {
        this.username = event.target.value;
    }

    handlepassword(event) {
        this.password = event.target.value;
    }

    handlelogin() {
        login({ username: this.username, password: this.password })
            .then(result => {

                sessionStorage.setItem('candidateId', result.Id);

                if (result.User_Type__c === 'Employee') {
                    this[NavigationMixin.Navigate]({
                        type: 'standard__namedPage',
                        attributes: {
                            pageName: 'home'
                        }
                    });

                }

                if (result.User_Type__c === 'Admin') {
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/lightning/n/Admin_Home'
                        }
                    });
                }

                if (result.User_Type__c === 'Interviewer') {
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/lightning/n/Interviewer_Panel'
                        }
                    });
                }


            })


    }

    handleregister(e) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/lightning/n/Register'
            }
        });
    }


}