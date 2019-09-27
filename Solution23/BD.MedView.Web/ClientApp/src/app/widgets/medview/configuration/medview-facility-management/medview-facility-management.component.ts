import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ResourceService } from 'container-framework';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { MasterFacilityModalComponent } from '../mvd-facilitymgmt-modal/mvd-masterfacility-modal.component';
import { FacilityMappingModalComponent } from '../mvd-facilitymgmt-modal/mvd-facilitymapping-modal.component';
import { FacilityManagementService } from '../../../services/mvd-facility-management.service';
import { FacilityManagementTransformationService } from '../../../services/mvd-facility-management-transformation.service';
import { AuthorizationService } from "../../../../services/authorization.service";
import { DisableDatasourceModalComponent } from './mvd-disabledatasource-dialog.component';
import { ProviderFacilitiesDataService } from './provider-facilities-data.service';
import { MvdConstants } from '../../../shared/mvd-constants';
import mvdListIcons from '../../../shared/list-component/mvd-list-icons';

@Component({
    selector: 'medview-facility-management',
    templateUrl: './medview-facility-management.component.html',
    styleUrls: ['./medview-facility-management.component.scss']
})
export class MedviewFacilityManagementComponent implements OnInit {

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    @Output() onSourceEnabledChanged = new EventEmitter();

    resources: any;
    masterFacilitiesData: any[] = [];
    subscription: Subscription;
    dataSourcesEnabled: any[] = [];
    dataSourcesEnabledModel: any[] = [];
    public modalRef: BsModalRef;

    defaultStringKeyTypeId = 2;
    defaultParentId = 1;
    applyChangesEnabled = false;

    emptyFacilities: any[] = [];

    emptyRows: number = 11;

    public config = {
        animated: true,
        keyboard: true,
        backdrop: true,
        ignoreBackdropClick: false,
        class: 'gray size-modal-facility'
    };

    constructor(
        private resourcesService: ResourceService,
        private modalService: BsModalService,
        private facilityManagementService: FacilityManagementService,
        private facilityManagementTransformationService: FacilityManagementTransformationService,
        private authorizationService: AuthorizationService,
        private providerFacilitiesService: ProviderFacilitiesDataService
        )
    {
    }

    ngOnInit(): void {
        this.resources = this.getResources();
        this.loadData();
    }

    closeDialog() {
        this.modalRef.hide();
    }

    onEditMasterFacilityClick(facility: any) {

        this.modalRef = this.modalService.show(MasterFacilityModalComponent, this.config);
        this.modalRef.content.initializeForm(facility);
        this.modalRef.content.onCancelDialog.pipe(take(1)).subscribe(this.closeDialog.bind(this));
        this.modalRef.content.onSave.pipe(take(1)).subscribe(this.saveNewMasterFacility.bind(this));
        this.modalRef.content.onDelete.pipe(take(1)).subscribe(this.deleteMasterFacility.bind(this));
    }

    deleteMasterFacility(event: any) {
        this.facilityManagementService.deleteMasterFacility(event.idToDelete).subscribe((response: any) => {
            this.loadFacilities(this.dataSourcesEnabled);
            this.closeDialog();
        });
    }

    saveNewMasterFacility(event: any) {
        let isRepeated = this.masterFacilitiesData.some(facility => facility.masterFacilityName === event.values[0].value);
        if (isRepeated) {
            this.modalRef.content.showErrorMasterFacility();
            this.modalRef.content.onSave.pipe(take(1)).subscribe(this.saveNewMasterFacility.bind(this));
        }
        else {
            const name = (event.values[0].value || '').trim();
            if (event.id) {
                let facilityEdit = this.masterFacilitiesData.find(facility => facility.id === event.id);
                if (facilityEdit) {
                    this.facilityManagementService
                        .updateMasterFacility(event.id, { Name: name, ParentId: this.defaultParentId, Id: event.id })
                        .subscribe((response: any) => {
                            this.loadFacilities(this.dataSourcesEnabled);
                            this.authorizationService.authContextRefresh();
                            this.closeDialog();
                        });
                }
            }
            else {
                this.facilityManagementService
                    .createMasterFacility(this.getNewMasterFacilityParams(name))
                    .subscribe((response: any) => {
                        this.loadFacilities(this.dataSourcesEnabled);
                        this.closeDialog();
                    });
            }
        }
    }

    newMasterFacility() {
        this.modalRef = this.modalService.show(MasterFacilityModalComponent, this.config);
        this.modalRef.content.initializeForm();
        this.modalRef.content.onCancelDialog.pipe(take(1)).subscribe(this.closeDialog.bind(this));
        this.modalRef.content.onSave.pipe(take(1)).subscribe(this.saveNewMasterFacility.bind(this));
    }

    onFacilityMappingClick(datasource: any, masterFacility: any) {
        this.modalRef = this.modalService.show(FacilityMappingModalComponent, this.config);
        this.modalRef.content.initializeForm({
            masterFacilityId: masterFacility.id,
            masterFacilityName: masterFacility.masterFacilityName,
            dataSourceName: datasource.source,
            datasource: datasource
        });

        if (datasource.sourceValue.toLowerCase() === MvdConstants.MEDMINED_PROVIDER_NAME
            || datasource.sourceValue.toLowerCase() === MvdConstants.DISPENSING_PROVIDER_NAME
            || datasource.sourceValue.toLowerCase() === MvdConstants.CATO_PROVIDER_NAME
        ) {
            this.modalRef.content.setSourceFacilities(
                this.providerFacilitiesService.getFacilities$(this.appCode, this.widgetId, datasource.sourceValue.toLowerCase())
           );
        }
        this.modalRef.content.onCancelDialog.pipe(take(1)).subscribe(this.closeDialog.bind(this));
        this.modalRef.content.onSave.pipe(take(1)).subscribe(this.saveFacilityMapping.bind(this));
        this.modalRef.content.onDelete.pipe(take(1)).subscribe(this.onDeleteMapping.bind(this));
    }

    onDeleteMapping(event: any) {
        let masterFacility = this.masterFacilitiesData
            .find(facility => facility.id === event.masterFacilityId);
        if (masterFacility) {
            this.facilityManagementService
                .deleteFacilityMapping(event.synonym.synonymId)
                .subscribe((response: any) => {
                    console.log(response);
                    this.loadFacilities(this.dataSourcesEnabled);
                    this.closeDialog();
                    this.onSourceEnabledChanged.emit();
                });
        }
    }

    saveFacilityMapping(event: any) {
        let masterFacility = this.masterFacilitiesData.find(facility => facility.id === event.id.masterFacilityId);
        console.log(event, masterFacility);
        if (masterFacility) {
            let name = (event.values.find(item => item.fieldName === "sourceFacilityName").value || '').trim();
            let key = (event.values.find(item => item.fieldName === "sourceFacilityID").value || '').trim();
            if (event.id.synonym.synonymId === 0) {
                this.facilityManagementService
                    .createFacilityMapping({
                        id: event.id.synonym.synonymId,
                        providerId: event.id.synonym.providerId,
                        elementId: event.id.masterFacilityId,
                        name,
                        key
                    })
                    .subscribe((response: any) => {
                        this.loadFacilities(this.dataSourcesEnabled);
                        this.closeDialog();
                        this.onSourceEnabledChanged.emit();
                    });
            }
            else {
                this.facilityManagementService
                    .updateFacilityMapping(event.id.synonym.synonymId,
                    this.getFacilityMappingParams(event.id.synonym, name, key))
                    .subscribe((response: any) => {
                        this.loadFacilities(this.dataSourcesEnabled);
                        this.closeDialog();
                    });
            }
        }
    }

    onApplyChanges() {
        let sourcesToEnable = [];
        let sourcesToDisable = [];
        for (let source of this.dataSourcesEnabledModel) {
            let currentSetting = this.dataSourcesEnabled.find(x => x.id === source.id);
            if (currentSetting) {
                let hasChange = currentSetting.checked !== source.checked;
                if (hasChange) {
                    if (source.checked) {
                        sourcesToEnable.push(source);
                    } else {
                        sourcesToDisable.push(source);
                    }
                }
            }
        }

        for (let source of sourcesToEnable) {
            this.enableDataSource(source.value);
        }

        if (sourcesToDisable.length) {
            this.modalRef = this.modalService.show(DisableDatasourceModalComponent, this.config);
            this.modalRef.content.initializeForm(sourcesToDisable);
            this.modalRef.content.onCancelDialog.pipe(take(1)).subscribe(this.cancelDisableDataSource.bind(this));
            this.modalRef.content.onDelete.pipe(take(1)).subscribe(this.disableDataSources.bind(this));
        }
    }

    cancelDisableDataSource(sources: any[]) {
        this.loadData();
        this.closeDialog();
    }

    disableDataSources(sources: any[]) {
        for (let source of sources) {
            this.disableDataSource(source.id);
            this.closeDialog();
        }
        this.applyChangesEnabled = false;
    }

    onSourcesEnabledChange($event) {
        for (let source of this.dataSourcesEnabledModel) {
            let currentSetting = this.dataSourcesEnabled.find(x => x.id === source.id);
            if (currentSetting) {
                this.applyChangesEnabled = currentSetting.checked !== source.checked;
                if (this.applyChangesEnabled) {
                    break;
                }
            }
        }
    }

    private enableDataSource(name: string) {
        this.facilityManagementService
            .enabledDataSource({ Name: name, KeyTypeId: this.defaultStringKeyTypeId })
            .subscribe((response: any) => {
                console.log('enabled: ', response);
                this.loadData();
                this.applyChangesEnabled = false;
                this.onSourceEnabledChanged.emit();
            });
    }

    private disableDataSource(sourceId) {
        this.facilityManagementService
            .disabledDataSource(sourceId)
            .subscribe((response: any) => {
                console.log('disabled: ', response);
                this.applyChangesEnabled = false;
                this.loadData();
                this.onSourceEnabledChanged.emit();
            });

    }

    private getFacilityMappingParams(synonym: any, name: string, key: any) {
        return {
            id: synonym.synonymId,
            providerId: synonym.providerId,
            elementId: synonym.elementId,
            name,
            key
        }
    }

    private getNewMasterFacilityParams(name: string) {
        return {
            name,
            parentId: this.defaultParentId
        }
    }

    private loadFacilities(sourcesEnabled: any[]) {
        this.facilityManagementService.getMasterFacilities().subscribe((response) => {
            if (response) {
                this.masterFacilitiesData = response
                    .map((item: any) => this.facilityManagementTransformationService
                        .transform(item, sourcesEnabled.filter(e => e.checked)));

                this.emptyFacilities = new Array(this.masterFacilitiesData.length < this.emptyRows ? this.emptyRows - this.masterFacilitiesData.length : 0);
                console.log('FacilityManagementComponent: Master facilities received:', this.masterFacilitiesData);
            }
        });
    }

    private loadData() {
        let enabledSource$ = this.facilityManagementService.getEnabledDataSources();
        let suportedSource$ = this.facilityManagementService.getSupportedDataSources();

        forkJoin(enabledSource$, suportedSource$).subscribe((responses: any[]) => {
            let [enabledSourcesResponse = [], supportedSourcesResponse = []] = responses;
            enabledSourcesResponse = enabledSourcesResponse
                .filter(sourceItem => sourceItem.name != "BD.MedView.Facility");
            this.dataSourcesEnabled = supportedSourcesResponse
                .map((element) => {
                    let provider = enabledSourcesResponse.find(x => x.name === element.name);
                    let providerId = provider ? provider.id : 0;
                    return {
                        id: providerId,
                        name: this.facilityManagementTransformationService.getProviderDisplayName(element.name),
                        value: element.name,
                        checked: enabledSourcesResponse
                            .some(sourceItem => sourceItem.name === element.name)
                    }
                });
            this.dataSourcesEnabledModel = JSON.parse(JSON.stringify(this.dataSourcesEnabled));
            this.loadFacilities(this.dataSourcesEnabled);
            this.applyChangesEnabled = false;
        });
    }

    private getResources() {
        return {
            masterFacilities: this.resourcesService.resource('masterFacilities'),
            facilityMapping: this.resourcesService.resource('facilityMapping'),
            createNewMasterFacility: this.resourcesService.resource('createNewMasterFacility'),
            masterFacilityName: this.resourcesService.resource('masterFacilityName'),
            facilityId: this.resourcesService.resource('facilityId'),
            dataSource: this.resourcesService.resource('dataSource'),
            sourceFacilityName: this.resourcesService.resource('sourceFacilityName'),
            edit: this.resourcesService.resource('edit'),
            dataSourcesEnabled: this.resourcesService.resource('dataSourcesEnabled'),
            applyChanges: this.resourcesService.resource('applyChanges'),
            noDataToDisplay: this.resourcesService.resource('noDataToDisplay')
        };
    }
    
}
