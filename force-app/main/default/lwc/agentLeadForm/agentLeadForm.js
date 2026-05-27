import { LightningElement, track, wire } from 'lwc';
import searchCampuses from '@salesforce/apex/AgentLeadController.searchCampus';
import getCourseOfferingsByCampus from '@salesforce/apex/AgentLeadController.getCourseOfferingsByCampus';
import createLead from '@salesforce/apex/AgentLeadController.createLead';
import getLeads from '@salesforce/apex/AgentLeadController.getLeads';
import getLeadById from '@salesforce/apex/AgentLeadController.getLeadById';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const DEBOUNCE_DELAY = 300;

export default class AgentLeadForm extends LightningElement {

    /* ---------- FORM STATE ---------- */
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';
    @track notes = '';

    @track campusSearchText = '';
    @track campusResults = [];
    @track selectedCampusId = null;

    @track courseOptions = [];
    @track selectedCourseId = null;
    @track courseDisabled = true;

    /* ---------- EDIT STATE ---------- */
    @track leads = [];
    @track showEditModal = false;

    isEditMode = false; // CHANGED: Added @track
    editingLeadId = null;

    wiredLeadsResult;
    searchTimer;

    columns = [
        { label: 'Last Name', fieldName: 'LastName' },
        { label: 'Email', fieldName: 'Email' },
        { label: 'Phone', fieldName: 'Phone' },
        {
            type: 'button',
            typeAttributes: {
                label: 'Edit',
                name: 'edit',
                variant: 'brand'
            }
        }
    ];

    /* ---------- LOAD LEADS ---------- */
    @wire(getLeads)
    wiredLeads(result) {
        this.wiredLeadsResult = result;
        if (result.data) {
            this.leads = result.data;
        } else if (result.error) {
            this.showToast('Error', result.error.body?.message, 'error');
        }
    }

    /* ---------- VALIDATION ---------- */
    validateForm() {
        let isValid = true;
        const inputs = this.template.querySelectorAll(
            'lightning-input, lightning-combobox, lightning-textarea'
        );
        inputs.forEach(i => {
            i.setCustomValidity('');
            if (!i.reportValidity()) isValid = false;
        });
        return isValid;
    }

    /* ---------- INPUT HANDLERS ---------- */
    handleChange(event) {
        const field = event.target.dataset.field;
        if (field) this[field] = event.target.value;
    }

    handleEmailChange(event) {
        this.email = event.target.value;
    }

    /* ---------- CAMPUS SEARCH ---------- */
    handleCampusSearch(event) {
        this.campusSearchText = event.target.value;
        clearTimeout(this.searchTimer);

        this.searchTimer = setTimeout(() => {
            if (this.campusSearchText.length >= 1) {
                searchCampuses({ searchText: this.campusSearchText })
                    .then(res => this.campusResults = res)
                    .catch(err => this.showToast('Error', err.body?.message, 'error'));
            } else {
                this.campusResults = [];
            }
        }, DEBOUNCE_DELAY);
    }

    selectCampus(event) {
        const id = event.currentTarget.dataset.id;
        const campus = this.campusResults.find(c => c.Id === id);
        if (!campus) return;

        this.selectedCampusId = id;
        this.campusSearchText = campus.Name;
        this.campusResults = [];

        this.loadCourses(id);
    }

    loadCourses(campusId) {
        getCourseOfferingsByCampus({ campusId })
            .then(res => {
                this.courseOptions = res.map(r => ({
                    label: r.Course__r ? `${r.Course__r.Name} — ${r.Name}` : r.Name,
                    value: r.Id
                }));
                this.courseDisabled = this.courseOptions.length === 0;
            })
            .catch(() => {
                this.courseOptions = [];
                this.courseDisabled = true;
            });
    }

    handleCourseChange(event) {
        this.selectedCourseId = event.detail.value;
    }

    /* ---------- DATATABLE ---------- */
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        if (action.name === 'edit') {
            this.openEditModal(row.Id);
        }
    }

    /* ---------- OPEN EDIT MODAL ---------- */
    openEditModal(leadId) {
        // CRITICAL: Reset form before loading edit data
        this.resetForm();
        
        this.isEditMode = true;
        this.editingLeadId = leadId;
        this.showEditModal = true;

        getLeadById({ leadId })
            .then(lead => {
                console.log("Fresh Lead", lead);
                this.firstName = lead.FirstName || '';
                this.lastName = lead.LastName || '';
                this.email = lead.Email || '';
                this.phone = lead.Phone || '';
                this.notes = lead.Description || '';

                this.selectedCampusId = lead.Preferred_Campus__c;
                this.campusSearchText = lead.Preferred_Campus__r?.Name || '';

                if (this.selectedCampusId) {
                    this.loadCourses(this.selectedCampusId);
                }

                this.selectedCourseId = lead.Preferred_Course__c;
            })
            .catch((error) => {
                console.error('Error loading lead:', error);
                this.showToast('Error', 'Failed to load lead details', 'error');
                this.closeModal();
            });
    }

    /* ---------- SAVE / UPDATE ---------- */
    saveLead() {
        if (!this.validateForm()) return;

        const leadObj = {
            Id: this.isEditMode ? this.editingLeadId : null,
            FirstName: this.firstName,
            LastName: this.lastName,
            Email: this.email,
            Phone: this.phone,
            Description: this.notes,
            Company: 'Individual'
        };

        if (this.selectedCampusId) leadObj.Preferred_Campus__c = this.selectedCampusId;
        if (this.selectedCourseId) leadObj.Preferred_Course__c = this.selectedCourseId;

        createLead({ inputLead: leadObj })
            .then(() => {
                this.showToast(
                    'Success',
                    this.isEditMode ? 'Lead updated successfully' : 'Lead created successfully',
                    'success'
                );

                this.closeModal();
                
                // Refresh the leads list
                return refreshApex(this.wiredLeadsResult);
            })
            .then(() => {
                // Reset form after successful save
                this.resetForm();
            })
            .catch(error => {
                console.error('Save error:', error);
                this.showToast('Error', 
                    error.body?.message || error.message || 'An error occurred while saving', 
                    'error'
                );
            });
    }

    closeModal() {
        this.showEditModal = false;
        this.isEditMode = false;
        this.editingLeadId = null;
        this.resetForm(); // Reset form when closing modal
    }

    /* ---------- RESET ---------- */
    resetForm() {
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.phone = '';
        this.notes = '';
        this.campusSearchText = '';
        this.campusResults = [];
        this.selectedCampusId = null;
        this.courseOptions = [];
        this.selectedCourseId = null;
        this.courseDisabled = true;
        this.isEditMode = false; // Ensure edit mode is reset
        this.editingLeadId = null; // Clear editing ID
    }

    /* ---------- TOAST ---------- */
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}