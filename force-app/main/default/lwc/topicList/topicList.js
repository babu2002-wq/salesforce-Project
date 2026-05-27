import { LightningElement, api, wire } from 'lwc';
import getTopics from '@salesforce/apex/LearningController.getTopics';

export default class TopicList extends LightningElement {

    @api courseId;
    topics = [];

    @wire(getTopics, { courseId: '$courseId' })
    wiredTopics({ data }) {
        if (data) this.topics = data;
    }

    openTopic(event) {
        this.dispatchEvent(new CustomEvent('topicclick', {
            detail: event.currentTarget.dataset.id
        }));
    }

    goBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }
}