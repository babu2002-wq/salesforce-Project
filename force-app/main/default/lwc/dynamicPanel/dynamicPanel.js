import { LightningElement } from 'lwc';

export default class DynamicPanel extends LightningElement {
    isInterviewPanel = true;
    isUserPanel = true;

    switchToInterviewer() {
        this.resetPanels();
        this.isInterviewPanel = true;
    }

    switchToUser() {
        this.resetPanels();
        this.isUserPanel = true;
    }

    resetPanels() {
        this.isInterviewPanel = false;
        this.isUserPanel = false;
    }
}