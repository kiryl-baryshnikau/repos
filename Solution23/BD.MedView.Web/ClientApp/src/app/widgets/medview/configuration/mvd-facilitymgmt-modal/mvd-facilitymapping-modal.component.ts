import { Component, Output, EventEmitter, ViewChild, Input } from '@angular/core';

import { Observable, timer, of } from 'rxjs';

import { ResourceService } from 'container-framework';
import { MvdFacilitymgmtModalComponent } from './mvd-facilitymgmt-modal.component';

import * as models from '../../../shared/mvd-models';
import { SelectItem } from 'primeng/api';
import { MvdConstants } from '../../../shared/mvd-constants';

@Component({
    selector: 'medview-facilitymapping-modal',
    templateUrl: './mvd-facilitymapping-modal.component.html',
    styleUrls: ['./mvd-facilitymapping-modal.component.scss']
})
export class FacilityMappingModalComponent {
    @Input('sourceFacilities')
    sourceFacilities$: Observable<SelectItem[]>

    formOptions: models.ModalFormValues;
    masterFacilityId: any;
    masterFacilityName: string;
    sourceName: string;

    dataSource: any;

    currentStep = 0;

    @ViewChild('mainForm') mainForm: MvdFacilitymgmtModalComponent;

    @Output() onCancelDialog = new EventEmitter();
    @Output() onSave = new EventEmitter();
    @Output() onDelete = new EventEmitter();

    myResources: any;

    private setResources() {
        this.myResources = {
            titleForm: this.resourceService.resource('editFacilityMapping'),
            saveBtnText: this.resourceService.resource('save'),
            cancelBtnText: this.resourceService.resource('cancel'),
            deleteBtnText: this.resourceService.resource('delete'),
            facilityId: this.resourceService.resource('facilityId'),
            sourceFacilityName: this.resourceService.resource('sourceFacilityName'),
            deleteFacility: this.resourceService.resource('deleteThisFacilityMapping'),
            yesBtn: this.resourceService.resource('yes'),
            noBtn: this.resourceService.resource('no')
        };
    }

    constructor(private resourceService: ResourceService) {
        this.setResources();
    }

    initializeForm(data: any) {
        this.masterFacilityId = data.masterFacilityId;
        this.masterFacilityName = data.masterFacilityName;
        this.sourceName = data.dataSourceName;
        this.dataSource = data.datasource;
        if (data.datasource.sourceValue.toLowerCase() === MvdConstants.MEDMINED_PROVIDER_NAME
            || data.datasource.sourceValue.toLowerCase() === MvdConstants.DISPENSING_PROVIDER_NAME
            || data.datasource.sourceValue.toLowerCase() === MvdConstants.CATO_PROVIDER_NAME
        ) {
            this.displaySelectFacility = true;
            this.initializeSelectFacility(data);
        }
        else {
            this.displaySelectFacility = false;
            if (data.datasource.name && data.datasource.facilityId) {
                this.formOptions = {
                    id: {
                        masterFacilityId: this.masterFacilityId,
                        dataSourceName: this.sourceName,
                        synonym: this.dataSource
                    },
                    titleForm: this.myResources.titleForm,
                    subTitleForm: `${this.masterFacilityName} - ${this.sourceName}`,
                    editForm: true,
                    actionsFormsLabels: {
                        saveOptionLabel: this.myResources.saveBtnText,
                        cancelOptionLabel: this.myResources.cancelBtnText,
                        deleteOptionLabel: this.myResources.deleteBtnText,
                    },
                    questions: [
                        {
                            label: this.myResources.sourceFacilityName,
                            fieldName: 'sourceFacilityName',
                            required: true,
                            value: data.datasource.name
                        },
                        {
                            label: this.myResources.facilityId,
                            fieldName: 'sourceFacilityID',
                            required: true,
                            value: data.datasource.facilityId
                        },
                    ]
                };
            }
            else {
                this.formOptions = {
                    id: {
                        masterFacilityId: this.masterFacilityId,
                        dataSourceName: this.sourceName,
                        synonym: this.dataSource
                    },
                    titleForm: this.myResources.titleForm,
                    subTitleForm: `${this.masterFacilityName} - ${this.sourceName}`,
                    editForm: false,
                    actionsFormsLabels: {
                        saveOptionLabel: this.myResources.saveBtnText,
                        cancelOptionLabel: this.myResources.cancelBtnText,
                    },
                    questions: [
                        {
                            label: this.myResources.sourceFacilityName,
                            fieldName: 'sourceFacilityName',
                            required: true,
                            value: ''
                        },
                        {
                            label: this.myResources.facilityId,
                            fieldName: 'sourceFacilityID',
                            required: true,
                            value: ''
                        },
                    ]
                };
            }

            this.mainForm.displayForm(this.formOptions);
        }
    }

    setSourceFacilities(sourceData: Observable<SelectItem[]>) {
        this.sourceFacilities$ = sourceData;
    }

    formOptions$: Observable<models.ModalFormValues>;
    displaySelectFacility: boolean = false;

    private initializeSelectFacility(data: any) {
        this.formOptions$ = of(this.getSelectFacilityConfig(data));
    }

    private getSelectFacilityConfig(data: any): models.ModalFormValues {
        let formConfig: models.ModalFormValues;
        let editForm: boolean;
        if (data.datasource.name && data.datasource.facilityId) {
            editForm = true;
        }
        else {
            editForm = false;
        }

        formConfig = {
            id: {
                masterFacilityId: this.masterFacilityId,
                dataSourceName: this.sourceName,
                synonym: this.dataSource
            },
            titleForm: this.myResources.titleForm,
            subTitleForm: `${this.masterFacilityName} - ${this.sourceName}`,
            editForm,
            actionsFormsLabels: {
                saveOptionLabel: this.myResources.saveBtnText,
                cancelOptionLabel: this.myResources.cancelBtnText,
                deleteOptionLabel: (editForm ? this.myResources.deleteBtnText : null),
            },
            questions: [
                {
                    label: this.myResources.sourceFacilityName,
                    fieldName: 'facilityname',
                    required: true,
                    value: (editForm ? { id: data.datasource.facilityId, name: data.datasource.name }: null)
                }
            ]
        };

        return formConfig;
    }

    onConfirmDeletion() {
        this.onDelete.emit({
            masterFacilityId: this.masterFacilityId,
            dataSourceName: this.sourceName,
            synonym: this.dataSource
        });
    }

    onCancelClick(event: any) {
        this.onCancelDialog.emit(event);
    }

    onCancelDeletion() {
        this.currentStep = 0;
        timer(0).subscribe(t => {
            if (this.mainForm) {
                this.mainForm.displayForm(this.formOptions);
            }
        });
    }

    onDeleteClick(event: any) {
        this.currentStep = 1;
    }

    onSaveClick(event: any) {
        this.onSave.emit(event);
    }

    onSaveClickFromSelection(event: any) {
        let saveObj = {
            id: event.id,
            values: [
                {
                    fieldName: "sourceFacilityName",
                    value: event.values.name
                },
                {
                    fieldName: "sourceFacilityID",
                    value: event.values.id
                }
            ]
        };
        this.onSave.emit(saveObj);
    }
}
