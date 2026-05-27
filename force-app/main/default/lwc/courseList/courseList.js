import { LightningElement, wire, track } from 'lwc';
import getCourses from '@salesforce/apex/LearningController.getCourses';

export default class CourseList extends LightningElement {

    @track courses = [];
    page = 1;
    pageSize = 10;

    @wire(getCourses)
    wiredCourses({ data }) {
        if (data) {
            // 🔥 ADD DISPLAY FIELD HERE
            this.courses = data.map(course => ({
                ...course,
                percentLabel: `${course.percent}% Completed`
            }));
        }
    }

    get pagedCourses() {
        const start = (this.page - 1) * this.pageSize;
        return this.courses.slice(start, start + this.pageSize);
    }

    nextPage() {
        if ((this.page * this.pageSize) < this.courses.length) {
            this.page++;
        }
    }

    prevPage() {
        if (this.page > 1) {
            this.page--;
        }
    }

    openCourse(event) {
        this.dispatchEvent(new CustomEvent('courseclick', {
            detail: event.currentTarget.dataset.id
        }));
    }
}