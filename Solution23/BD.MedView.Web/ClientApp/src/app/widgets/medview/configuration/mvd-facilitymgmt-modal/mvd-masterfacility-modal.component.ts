import { Component, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable, timer } from 'rxjs';

import { ResourceService } from 'container-framework';

import { MvdFacilitymgmtModalComponent } from './mvd-facilitymgmt-modal.component';

import * as models from '../../../shared/mvd-models';

@Component({
    selector: 'medview-masterfacility-modal',
    templateUrl: './mvd-masterfacility-modal.component.html',
    styleUrls: ['./mvd-masterfacility-modal.component.scss']
})
export class MasterFacilityModalComponent {

    formOptions: models.ModalFormValues;
    facility: any;
    currentStep = 0;

    @ViewChild('mainForm') mainForm: MvdFacilitymgmtModalComponent;

    @Output() onCancelDialog = new EventEmitter();
    @Output() onSave = new EventEmitter();
    @Output() onDelete = new EventEmitter();

    myResources: any;

    private setResources() {
        this.myResources = {
            titleEditForm: this.resourceService.resource('editMasterFacility'),
            titleCreateForm: this.resourceService.resource('createNewMasterFacility'),
            saveBtnText: this.resourceService.resource('save'),
            cancelBtnText: this.resourceService.resource('cancel'),
            deleteBtnText: this.resourceService.resource('delete'),
            masterFacilityLbl: this.resourceService.resource('masterFacilityName'),
            deleteMasterFacility: this.resourceService.resource('deleteMasterFacility'),
            confirmDelete: this.resourceService.resource('areYouSure'),
            deleteText: this.resourceService.resource('masterFacilityDeleteConfirmationMessage'),
            cannotUndone: this.resourceService.resource('actionCannotBeUndone'),
            yesBtn: this.resourceService.resource('yes'),
            noBtn: this.resourceService.resource('no'),
            okBtn: this.resourceService.resource('ok'),
            alreadyExists: this.resourceService.resource('masterFacilityAlreadyExists'),
            alreadyExistsInfo: this.resourceService.resource('masterFacilityAlreadyExistsMessage'),
        };
    }

    constructor(private resourceService: ResourceService) {
        this.setResources();
    }

    initializeForm(facility: any) {
        this.facility = facility;
        if (this.facility) {
            this.formOptions = {
                id: this.facility.id,
                titleForm: this.myResources.titleEditForm,
                editForm: true,
                actionsFormsLabels: {
                    saveOptionLabel: this.myResources.saveBtnText,
                    cancelOptionLabel: this.myResources.cancelBtnText,
                    deleteOptionLabel: this.myResources.deleteBtnText,
                },
                questions: [
                    {
                        label: this.myResources.masterFacilityLbl,
                        fieldName: 'masterFacilityName',
                        required: true,
                        value: this.facility.masterFacilityName
                    },
                ]
            };
        }
        else {
            this.formOptions = {
                id: '',//this.facility.id,
                titleForm: this.myResources.titleCreateForm,
                editForm: false,
                actionsFormsLabels: {
                    saveOptionLabel: this.myResources.saveBtnText,
                    cancelOptionLabel: this.myResources.cancelBtnText,
                },
                questions: [
                    {
                        label: this.myResources.masterFacilityLbl,
                        fieldName: 'masterFacilityName',
                        required: true,
                        value: ''
                    },
                ]
            };
        }
        this.mainForm.displayForm(this.formOptions);
    }

    onCancelClick(event: any) {
        this.onCancelDialog.emit(event);
    }

    onCancelDeletion() {
        console.log("Cancel delete", this.formOptions);
        this.currentStep = 0;
        timer(0).subscribe(t => {
            this.mainForm.displayForm(this.formOptions);
        });
    }

    onDeleteClick(event: any) {
        this.currentStep = 1;
    }

    onFirstConfirmDeletion() {
        this.currentStep = 2;
    }

    onSaveClick(event: any) {
        this.onSave.emit(event);
    }

    onConfirmDeletion() {
        this.onDelete.emit({
            idToDelete: this.facility.id
        });
    }

    showErrorMasterFacility() {
        this.currentStep = 3;
    }

    onDismissMessage() {
        this.currentStep = 0;
        timer(0).subscribe(t => {
            this.mainForm.displayForm(this.formOptions);
        });
    }
}
