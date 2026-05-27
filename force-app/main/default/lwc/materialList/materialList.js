import { LightningElement, api, wire } from 'lwc';
import getMaterials from '@salesforce/apex/LearningController.getMaterials';
import markMaterialCompleted from '@salesforce/apex/LearningController.markMaterialCompleted';
import { NavigationMixin } from 'lightning/navigation';

export default class MaterialList extends NavigationMixin(LightningElement) {

    @api topicId;
    materials = [];

    @wire(getMaterials, { topicId: '$topicId' })
    wiredMaterials({ data }) {
        if (data) this.materials = data;
    }

    viewFile(event) {
        const docId = event.currentTarget.dataset.docid;

        // AUTO MARK COMPLETED
        markMaterialCompleted({ materialId: this.findMaterialId(docId) });

        // OPEN FILE
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: docId
            }
        });
    }

    findMaterialId(docId) {
        for (let mat of this.materials) {
            for (let f of mat.files) {
                if (f.documentId === docId) {
                    return mat.id;
                }
            }
        }
        return null;
    }

    goBack() {
        this.dispatchEvent(new CustomEvent('back'));
    }
}