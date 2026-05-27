import { LightningElement, track, wire } from 'lwc';
import getQuestions from '@salesforce/apex/ExamController.getQuestions';
import submitExamAttempt from '@salesforce/apex/ExamController.submitExamAttempt';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getLoggedInContactId from '@salesforce/apex/ExamController.getLoggedInContactId';
import { getFocusedTabInfo, setTabLabel, disableTabClose } from 'lightning/platformWorkspaceApi';

export default class ExamApp extends LightningElement {
    examId;
    contactId;

    @track questions = []; 
    @track currentIndex = 0;
    @track loaded = false;
    submitted = false;

    selectedValues = null; 

    connectedCallback() {
        getFocusedTabInfo().then(tabInfo => {
            disableTabClose({ tabId: tabInfo.tabId, disabled: true });
        });
    }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.examId = currentPageReference.state.c__examId;
        }
    }

    @wire(getLoggedInContactId)
    wiredContactId({ error, data }) {
        if (data) {
            this.contactId = data;
        } else if (error) {
            console.error('Error fetching contact Id', error);
        }
    }

    // Load questions
    @wire(getQuestions, { examId: '$examId' })
    wiredQuestions({ error, data }) {
        if (data) {
            this.questions = data.map((q, index) => ({
                questionId: q.questionId,
                questionText: q.questionText,
                type: q.type,
                options: (q.options || []).map(o => ({
                    optionId: o.optionId,
                    label: o.optionText,
                    checked: false // used in template
                })),
                status: index === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED',
                selected: [],
                number: index + 1,
                computedClass: this.getButtonClass(index === 0 ? 'NOT_ANSWERED' : 'NOT_VISITED')
            }));
            this.loaded = true;

            // ✅ Only reset if we actually have at least 1 question
            if (this.questions.length > 0) {
                this.resetInputState();
            }
        } else if (error) {
            this.loaded = false;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Failed to load questions',
                variant: 'error'
            }));
            console.error(error);
        }
    }

    // ====== Getters ======
    get currentQuestion() {
        return this.questions[this.currentIndex] || {};
    }
    get currentIndexPlusOne() {
        return this.currentIndex + 1;
    }
    get isSingle() {
        return this.currentQuestion.type === 'Single Choice';
    }
    get isMultiple() {
        return this.currentQuestion.type === 'Multiple Choice';
    }
    get radioOptions() {
        return (this.currentQuestion.options || []).map(o => ({
            label: o.label,
            value: o.optionId
        }));
    }
    get questionTitle() {
        return `Question No. ${this.currentIndex + 1}`;
    }

    // ====== Helpers ======
    getButtonClass(status) {
        switch (status) {
            case 'ANSWERED': return 'nav-btn answered';
            case 'NOT_ANSWERED': return 'nav-btn not-answered';
            case 'MARKED': return 'nav-btn marked';
            default: return 'nav-btn not-visited';
        }
    }
    updateComputedClass(index) {
        this.questions[index].computedClass = this.getButtonClass(this.questions[index].status);
    }

    resetInputState() {
        // ✅ Safety check
        if (!this.questions || this.questions.length === 0) {
            return;
        }
        const q = this.questions[this.currentIndex];
        if (!q) {
            return;
        }

        const selected = new Set(q.selected || []);

        // radio
        this.selectedValues = (selected.size === 1) ? Array.from(selected)[0] : null;

        // checkboxes
        if (q.options && Array.isArray(q.options)) {
            q.options = q.options.map(o => ({
                ...o,
                checked: selected.has(o.optionId)
            }));
        }

        this.questions = [...this.questions]; // force re-render
    }

    // ====== Event Handlers ======
    handleNavigate(event) {
        const idx = parseInt(event.target.dataset.index, 10);
        if (!isNaN(idx)) {
            this.currentIndex = idx;
            if (this.questions[idx].status === 'NOT_VISITED') {
                this.questions[idx].status = 'NOT_ANSWERED';
                this.updateComputedClass(idx);
            }
            this.resetInputState();
        }
    }

    handleRadioChange(event) {
        const chosen = event.detail.value;
        const q = this.questions[this.currentIndex];

        q.selected = [chosen];
        q.status = 'ANSWERED';

        // update option states
        q.options = q.options.map(o => ({
            ...o,
            checked: o.optionId === chosen
        }));

        this.selectedValues = chosen;
        this.questions = [...this.questions];
        this.updateComputedClass(this.currentIndex);
    }

    handleCheckboxChange(event) {
        const id = event.target.dataset.id;
        const checked = event.target.checked;
        const q = this.questions[this.currentIndex];

        // update selected list
        let sel = [...q.selected];
        if (checked) {
            if (!sel.includes(id)) sel.push(id);
        } else {
            sel = sel.filter(x => x !== id);
        }
        q.selected = sel;

        // update the option checked flag
        q.options = q.options.map(o =>
            o.optionId === id ? { ...o, checked } : o
        );

        q.status = sel.length > 0 ? 'ANSWERED' : 'NOT_ANSWERED';
        this.questions = [...this.questions];
        this.updateComputedClass(this.currentIndex);
    }

    handleSaveNext() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            if (this.questions[this.currentIndex].status === 'NOT_VISITED') {
                this.questions[this.currentIndex].status = 'NOT_ANSWERED';
                this.updateComputedClass(this.currentIndex);
            }
            this.resetInputState();
        }
    }

    handleBack() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.resetInputState();
        }
    }

    handleMarkForReview() {
        this.questions[this.currentIndex].status = 'MARKED';
        this.updateComputedClass(this.currentIndex);
        this.handleSaveNext();
    }

    handleClearResponse() {
        const q = this.questions[this.currentIndex];
        q.selected = [];
        q.options = q.options.map(o => ({ ...o, checked: false }));
        this.selectedValues = null;
        q.status = 'NOT_ANSWERED';
        this.questions = [...this.questions];
        this.updateComputedClass(this.currentIndex);
    }

    // ====== Submit ======
    handleSubmit() {
        this.submitted = true;

        getFocusedTabInfo().then(tabInfo => {
            disableTabClose({ tabId: tabInfo.tabId, disabled: false });
            setTabLabel({ tabId: tabInfo.tabId, label: 'Exam Finished' });
        });
        
        const submissions = this.questions.map(q => ({
            questionId: q.questionId,
            selectedOptionIds: q.selected || []
        }));
        submitExamAttempt({
            contactId: this.contactId,
            examId: this.examId,
            submissions
        })
            .then(resp => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Exam Submitted',
                    message: `Score: ${resp.score} | Percentage: ${resp.percentage}%`,
                    variant: 'success'
                }));
            })
            .catch(err => {
                const msg = err?.body?.message || 'Error submitting exam';
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: msg,
                    variant: 'error'
                }));
                console.error(err);
            });
    }
}