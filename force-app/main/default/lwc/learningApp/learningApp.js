import { LightningElement, track } from 'lwc';

export default class LearningApp extends LightningElement {

    @track showCourses = true;
    @track showTopics = false;
    @track showMaterials = false;

    selectedCourseId;
    selectedTopicId;

    handleCourseClick(event) {
        this.selectedCourseId = event.detail;
        this.showCourses = false;
        this.showTopics = true;
    }

    handleTopicClick(event) {
        this.selectedTopicId = event.detail;
        this.showTopics = false;
        this.showMaterials = true;
    }

    goBackToCourses() {
        this.showCourses = true;
        this.showTopics = false;
    }

    goBackToTopics() {
        this.showTopics = true;
        this.showMaterials = false;
    }
}