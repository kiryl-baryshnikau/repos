import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ResourceService } from 'container-framework';
import { TreeNode } from 'primeng/api';

import { MvdConstants } from '../../../shared/mvd-constants';
import { IvPrepModels } from '../../../shared/mvd-models';
import { IvPrepTransformationService } from './../mvd-iv-prep-transformation.service';
import * as _ from 'lodash';


@Component({
    selector: 'iv-prep-settings',
    templateUrl: './iv-prep-settings.component.html',
    styleUrls: ['./iv-prep-settings.component.scss']
})
export class IvPrepSettingsComponent implements OnInit {

    @Output() cancelDialog = new EventEmitter<void>();
    @Output() applyDialog = new EventEmitter<IvPrepModels.IvPrepGeneralSettings>();

    unitOptions: TreeNode[];
    selectedUnits: TreeNode[] = [];
    prepSiteOptions: TreeNode[];
    selectedPrepSites: TreeNode[] = [];
    resources: any;
    isControlTouched: boolean;

    private ivPrepSettings: IvPrepModels.IvPrepGeneralSettings = {
        prepSiteSettings: [],
        unitsSettings: []
    };
    facilityNodeType = 'facilityNode';
    unitNodeType = 'unitNode';

    constructor(private resourcesService: ResourceService
        , private transformationService: IvPrepTransformationService) { }

    ngOnInit() {
        this.resources = this.getResources();
    }

    loadData(ivPrepData: any, userSettings: any) {

        this.isControlTouched = false;
        console.log(ivPrepData, userSettings);
        if (!ivPrepData && !userSettings) {
            console.log('IvPrepSettingsComponent: loadData(): No IV Prep data or usersettings were found');
            return;
        }

        const { prepSitesResponse
            , facilitiesResponse
            , unitsResponse } = ivPrepData;
        const { authorizationConfig, userPreferences } = userSettings;

        if (!prepSitesResponse || !facilitiesResponse || !unitsResponse ||
            !authorizationConfig || !userPreferences) {
            console.log('IvPrepSettingsComponent: loadData(): No IV Prep data or usersettings were found');
            return;
        }

        this.prepSiteOptions = this.getPrepSiteOptions(prepSitesResponse.Prepsites);
        this.unitOptions = this.getUnitOptions(unitsResponse, authorizationConfig, userPreferences);

        const ivPrepSettings = this.getIvPrepSettings(userPreferences);
        if (ivPrepSettings) {
            this.selectedPrepSites = this.getSelectedPrepSites(ivPrepSettings.prepSiteSettings, this.prepSiteOptions);
            this.selectedUnits = this.getSelectedUnits(ivPrepSettings.unitsSettings);

        } else {
            this.selectedPrepSites = this.prepSiteOptions;
            this.selectedUnits = _.union(this.unitOptions, _.flatMap(this.unitOptions, x => x.children));
        }
        this.synchPrepSites();
        this.synchUnits();
    }

    onCancelDialog() {
        this.cancelDialog.emit();
    }

    applyConfiguration() {
        this.applyDialog.emit(this.ivPrepSettings);
    }

    onPrepSiteSelectionChanged(event) {
        this.isControlTouched = true;
        this.synchPrepSites();
    }

    onUnitSelectionChanged(event) {
        this.isControlTouched = true;
        this.synchUnits();
    }

    private synchPrepSites() {

        if (!this.selectedPrepSites.length) {
            this.ivPrepSettings.prepSiteSettings = [];
            return;
        }

        if (this.selectedPrepSites.length === this.prepSiteOptions.length) {
            this.ivPrepSettings.prepSiteSettings = null;
            return;
        }
        this.ivPrepSettings.prepSiteSettings = this.selectedPrepSites
            .map((p) => ({
                prepSiteId: p.data.Id,
                prepSiteAbbr: p.data.Abbreviation
            } as IvPrepModels.PrepSiteSetting));
    }

    private synchUnits() {
        if (!this.selectedUnits.length) {
            this.ivPrepSettings.unitsSettings = [];
            return;
        }

        const selectedUnits = this.selectedUnits
        .filter(x => x.type === this.unitNodeType)
        .filter(x => x.parent && x.parent.type === this.facilityNodeType)
        .map(x => {
            return {
                facilityId: x.parent.data.nativeFacilityKey,
                facilityName: x.parent.data.masterFacilityName,
                unitId: x.data.Id,
                unitName: x.data.Designation
            } as IvPrepModels.UnitSetting;
        });

        const allUnits = _.uniqBy(selectedUnits, 'unitId');
        const totalUnits = this.unitOptions.reduce((acc, obj) => acc += obj.children.length, 0);

        if (totalUnits === allUnits.length) {
            this.ivPrepSettings.unitsSettings = null;
            return;
        }

        this.ivPrepSettings.unitsSettings = selectedUnits;
    }

    private getSelectedUnits(settings: IvPrepModels.UnitSetting[]): TreeNode[] {

        if (this.isAllSelected(settings)) {
            return _.union(this.unitOptions, _.flatMap(this.unitOptions, x => x.children));
        }

        if (this.isAllUnselected(settings)) {
            return [];
        }

        // Calculate which facility nodes should be selected
        const savedFacilitiesIds = _.uniq(settings.map(unitSetting => unitSetting.facilityId));
        const savedFacilitiesNodes = this.unitOptions
                                    .filter(unitOption => _.includes(savedFacilitiesIds, unitOption.data.nativeFacilityKey));
        const unitNodes = _.flatMap(savedFacilitiesNodes.map(fn => fn.children));
        const savedUnitIds = settings.map(unitSetting => unitSetting.unitId);
        const savedUnitNodes = unitNodes.filter(unitNode => savedUnitIds.some(s => s === unitNode.data.Id));

        // Set facilities with partial selection
        savedFacilitiesNodes.forEach(facilityNode => {
            if (facilityNode.children && facilityNode.children.length > 0) {
                if (facilityNode.children.some(unitNode =>  !_.includes(savedUnitNodes, unitNode))) {
                    facilityNode.partialSelected = true;
                }
            }
        });

        return _.union(savedFacilitiesNodes, savedUnitNodes);
    }


    private getSelectedPrepSites(prepsiteSettings: IvPrepModels.PrepSiteSetting[]
        , prepSiteOptions: TreeNode[]): TreeNode[] {
        if (this.isAllSelected(prepsiteSettings)) {
            return prepSiteOptions;
        }

        if (this.isAllUnselected(prepsiteSettings)) {
            return [];
        }

        return prepSiteOptions.filter((o) => prepsiteSettings.some((s) => s.prepSiteId === o.data.Id));
    }

    private isAllSelected(settings: any[]): boolean {
        return settings === null;
    }

    private isAllUnselected(settings: any[]): boolean {
        return settings && !settings.length;
    }


    private getIvPrepSettings(userPreferences: any): IvPrepModels.IvPrepGeneralSettings {
        if (!userPreferences ||
            !userPreferences.generalSettings ||
            !userPreferences.generalSettings.length) {
            return undefined;
        }

        const ivPrepSetting = userPreferences
            .generalSettings.find((s) => s.id === MvdConstants.IVPREP_WIDGET_KEY);
        if (!ivPrepSetting) {
            return undefined;
        }

        return ivPrepSetting.configuration as IvPrepModels.IvPrepGeneralSettings;
    }

    private getPrepSiteOptions(prepSites: IvPrepModels.PrepSite[]): TreeNode[] {
        return prepSites.map(p => this.mapPrepSiteNode(p));
    }

    private getUnitOptions(unitsResponse: IvPrepModels.UnitsResponse
        , authorizationConfig: any
        , userPreferences: any): TreeNode[] {

        const filteredFacilities = this.filterFacilities(authorizationConfig, userPreferences);
        return filteredFacilities.map(f => {
            const facilityNode = this.mapFacilityTreeNode(f);
            const unitTreeNodes = this.filterUnitsByFacility(f, unitsResponse.Units)
                .map(u => this.mapUnitTreeNode(u, facilityNode));

            facilityNode.children = unitTreeNodes;
            return facilityNode;
        });
    }

    private filterFacilities(authorizationConfig: any, userPreferences: any): IvPrepModels.FacilityViewModel[] {

        const facilitySelectionSettings = _.get(userPreferences, 'facilities', null);
        if (!facilitySelectionSettings || !facilitySelectionSettings.length) {
            console.error('IvPrepSettingsComponent > filterFacilities: Error on IV Prep Settings processing');
            return [];
        }

        const selectedFacilitiesSetting = facilitySelectionSettings.filter(f => f.selected);
        const authorizedFacilities = this.getAuthorizedFacilities(selectedFacilitiesSetting, authorizationConfig);

        if (authorizedFacilities.length === 0) {
            console.log('IvPrepSettingsComponent > filterFacilities: No authorized facilities');
            return [];
        }

        return authorizedFacilities.map((f) => {
            const synonym = f.synonyms
                .find((s) => (s.source || '').toLowerCase() === MvdConstants.CATO_PROVIDER_NAME.toLowerCase());

            return <IvPrepModels.FacilityViewModel>{
                masterFacilityName: this.transformationService.mapMasterFacility(synonym.id, authorizationConfig),
                nativeFacilityKey: synonym.id
            };
        });
    }

    private getAuthorizedFacilities(selectedFacilitiesSetting: any[], authorizationConfig: any) {
        
        const isAllFacilitiesSelected = selectedFacilitiesSetting.some(f => f.id === MvdConstants.ALL_FACILITIES_KEY);
        let authorizedFacilities = [];
        if (isAllFacilitiesSelected) {
            authorizedFacilities = authorizationConfig
                .filter((a) => a.name !== MvdConstants.AUTHORIZATION_ROOT_ID &&
                    this.hasProvider(a.synonyms, MvdConstants.CATO_PROVIDER_NAME) &&
                    this.hasPermissions(a.permissions, MvdConstants.IVPREP_WIDGET_KEY));
        } else {
            authorizedFacilities = authorizationConfig
                .filter((a) => a.name !== MvdConstants.AUTHORIZATION_ROOT_ID &&
                    selectedFacilitiesSetting.some(f => f.id === (a.id || '').toString()) &&
                    this.hasProvider(a.synonyms, MvdConstants.CATO_PROVIDER_NAME) &&
                    this.hasPermissions(a.permissions, MvdConstants.IVPREP_WIDGET_KEY));
        }
        return authorizedFacilities;
    }

    private hasProvider(synonyms: any[], providerName: string): boolean {
        return synonyms.some((s) => (s.source || '').toLowerCase() === (providerName || '').toLowerCase());
    }

    private hasPermissions(permissions: any[], resourceName: string) {
        return permissions.some((p) => (p.resource || '').toLowerCase() === (resourceName || '').toLowerCase());
    }

    private mapFacilityTreeNode(facility: IvPrepModels.FacilityViewModel): TreeNode {
        return {
            label: facility.masterFacilityName,
            // data: facility.nativeFacilityKey,
            data: facility,
            draggable: false,
            droppable: false,
            selectable: true,
            expanded: true,
            type: this.facilityNodeType
        } as TreeNode;
    }

    private filterUnitsByFacility(facility: IvPrepModels.FacilityViewModel
        , units: IvPrepModels.Unit[]): IvPrepModels.Unit[] {
        return units.filter((u) => facility.nativeFacilityKey === u.FacilityId);
    }

    private mapUnitTreeNode(unit: IvPrepModels.Unit, parentNode: TreeNode): TreeNode {
        return {
            parent: parentNode,
            label: unit.Designation,
            // data: unit.Id,
            data: unit,
            draggable: false,
            droppable: false,
            selectable: true,
            type: this.unitNodeType
        } as TreeNode;
    }

    private mapPrepSiteNode(prepSite: IvPrepModels.PrepSite): TreeNode {
        return {
            label: prepSite.Abbreviation,
            data: prepSite,
            draggable: false,
            droppable: false,
            selectable: true,
            type: 'default'
        } as TreeNode;
    }

    private getResources() {
        return {
            ivPrepSettingsTittle: this.resourcesService.resource('ivPrepSettingsTittle')
            , showHideFacilitiesUnits: this.resourcesService.resource('showHideFacilitiesUnits')
            , showHidePrepSites: this.resourcesService.resource('showHidePrepSites')
            , apply: this.resourcesService.resource('apply')
            , cancel: this.resourcesService.resource('cancel')
        };
    }
}
