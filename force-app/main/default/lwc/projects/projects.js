import { LightningElement,api} from 'lwc';
import projects from '@salesforce/apex/ProjectPage.AllProjects';
import empprojects from '@salesforce/apex/ProjectPage.getEmployeeProject';
import updprojects from '@salesforce/apex/ProjectPage.updateproject';



export default class Projects extends LightningElement {
    showProjectDropdown = false;
    @api employId;
    employeeProject;
    


    connectedCallback() {
        this.employId = sessionStorage.getItem('candidateId');
        this.loadAvailableProjects();
        this.loadEmployeeProject();
    }

    showDropdown(){
        this.showProjectDropdown=true;
    }

    handleProjectSelection(event){
        this.selectedProject = event.detail.value;
    }


    loadAvailableProjects() {
        projects()
            .then(result => {
                this.projectOptions = result.map(project => {
                    return { label: project.Name, value: project.Id };
                });
            })
            .catch(error => {
                this.errorMessage = 'Error loading available projects';
            });
    }


    loadEmployeeProject() {
        empprojects({ employeeId: this.employId })
            .then(result => {
                this.employeeProject = result;  // Assign the current project
            })
            .catch(error => {
                this.employeeProject = false;
            });
    }


    handleUpdateProject() {
        updprojects({ employeeId: this.employId, projectId: this.selectedProject })
                .then(() => {
                    this.successMessage = 'Project successfully assigned!';
                    this.errorMessage = '';
                    this.showProjectDropdown = false;
                    this.loadEmployeeProject();  // Refresh the displayed project after update
                })
                .catch(error => {
                    this.errorMessage = 'Error assigning project';
                });
    } 

    handlecancel(){
        this.showProjectDropdown=false;
    }

}