import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HomePageExams extends NavigationMixin(LightningElement) {
    navigateToExams() {
        // Opens the tab in the same Lightning app workspace
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'My_Exams'
            }
        }, true); // <-- true means open in the same page reference (no reload)
    }
}