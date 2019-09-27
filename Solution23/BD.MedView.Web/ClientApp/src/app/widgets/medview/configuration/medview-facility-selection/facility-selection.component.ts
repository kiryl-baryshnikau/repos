import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

import { of } from 'rxjs';

import * as _ from 'lodash';
import { ResourceService } from 'container-framework';

import {
    FacilitySelectionDataService,
} from './facility-selection-data.service';
import {
    FacilityFilter,
    PatientFilter,
    FacilityMapping,
    UnitFilter,
    FacilityFilterConfiguration
} from './facility-selection.models';

import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { FacilityLookUpService } from '../../../../services/facility-look-up.service';
import { MvdFacilitySelectionTransformService } from '../../../services/mvd-facility-selection-transformation.service';
import { FacilityInfo, UnitInfo, PatientInfo } from '../../../shared/mvd-models';
import { TreeNode } from 'primeng/components/common/treenode';

import { MvdConstants } from '../../../shared/mvd-constants';

@Component({
    selector: 'mvd-facility-selection',
    templateUrl: './facility-selection.component.html',
    styleUrls: ['./facility-selection.component.scss']
})
export class FacilitySelectionComponent implements OnInit {
    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() selectedMasterFacilityId: string;

    @Output() changed: EventEmitter<any> = new EventEmitter();

    resources: any;

    availableData: TreeNode[] = [];
    checkedAvailableData: TreeNode[] = [];

    selectedData: TreeNode[] = [];
    checkedSelectedData: TreeNode[] = [];

    isSourceTreeLoading = true;
    isTargetTreeLoading = true;

    isMoveRightEnabled = false;
    isMoveLeftEnabled = false;
    isMoveAllRightEnabled = false;
    isMoveAllLeftEnabled = false;
    isPurgeEnabled = false;

    isTouched = false;

    showLoadErrorMessage = false;

    private isDataLoaded = false;
    private facilityFilterConfig: FacilityFilterConfiguration;
    private originalFacilityFilters: FacilityFilter[];
    private userConfiguration: any;

    private facilityMappings: FacilityMapping[];

    private static extractFacilityFilters(userConfiguration): FacilityFilter[] {
        return userConfiguration
            && userConfiguration.userPreferences
            && userConfiguration.userPreferences.filters
            && userConfiguration.userPreferences.filters.facilityFilters
            || [];
    }

    private static extractFacilities(userConfiguration): any[] {
        return userConfiguration.authorizationConfig || [];
    }

    private static clearPartialSelection(sourceTree: TreeNode[]) {
        sourceTree.forEach(f => {
            f.partialSelected = false;
            f.children.forEach(u => u.partialSelected = false);
        });
    }

    private static getPatientFilter(patientNode: TreeNode): PatientFilter {
        const patientInfo: PatientInfo = patientNode.data;
        return {
            patientId: patientInfo.adtPatientId,
            patientName: patientInfo.patientName
        };
    }

    constructor(private dataService: FacilitySelectionDataService,
                private transformService: MvdFacilitySelectionTransformService,
                private resourcesService: ResourceService,
                private userConfigurationService: UserConfigurationService,
                private facilityLookUpService: FacilityLookUpService
    ) {
    }

    ngOnInit() {
        this.resources = this.getResources();
    }

    loadData(userConfiguration: any, parentFacilitiesIds: string[], selectedFacilitiesIds: string[], isFacilitySelected: boolean = true) {
        if (!isFacilitySelected) {
            this.showLoadErrorMessage = false;
            this.isTouched = false;
            this.isDataLoaded = false;
            this.availableData = [];
            this.checkedAvailableData = [];
            this.selectedData = [];
            this.checkedSelectedData = [];
            return;
        }

        this.isSourceTreeLoading = true;
        this.isTargetTreeLoading = true;

        userConfiguration = _.cloneDeep(userConfiguration);

        const allFacilitiesInfo = FacilitySelectionComponent.extractFacilities(userConfiguration);
        const facilityMappings = this.getFacilityMappings(userConfiguration, allFacilitiesInfo);
        this.facilityMappings = facilityMappings;

        const facilityFilters = FacilitySelectionComponent.extractFacilityFilters(userConfiguration);

        // Only show facilities that are on the parent facilities list and have an Infusion synonym
        const masterFacilityIds: string[] = allFacilitiesInfo
            .filter(f =>
                this.isInfusionFacility(f.id, userConfiguration.authorizationConfig)
                && _.includes(parentFacilitiesIds, f.id))
            .map(f => f.id);

        const infusionFacilityNames = this.getInfusionFacilityList(masterFacilityIds, selectedFacilitiesIds, facilityMappings);


        (infusionFacilityNames && infusionFacilityNames.length
                ? this.dataService.getInfusionFacilityInfoList(this.appCode, this.widgetId, infusionFacilityNames)
                : of([])
        )
            .subscribe(
                (facilityInfoList) => {
                    this.userConfiguration = userConfiguration;
                    this.facilityFilterConfig = { facilityFilters: facilityFilters, facilityMappings: facilityMappings };
                    this.originalFacilityFilters = _.cloneDeep(facilityFilters);
                    this.isTouched = false;
                    this.processInfusionInfo(masterFacilityIds, facilityFilters,
                        facilityInfoList, facilityMappings, selectedFacilitiesIds);
                },
                (error) => this.handleInfusionInfoError(error),
                () => this.onLoadDataComplete()
            );
    }

    onMoveToLeft() {
        if (this.isDataLoaded && this.checkedAvailableData.length) {
            this.isTouched = true;

            this.isSourceTreeLoading = true;
            this.isTargetTreeLoading = true;

            this.moveNodes(this.availableData, this.selectedData, this.checkedAvailableData);
            this.checkedAvailableData = [];
            this.selectedData = this.sortTree(this.selectedData);
            this.applyNodeTypes(this.availableData, this.selectedData);
            this.applyNodeTypes(this.selectedData, this.availableData);
            this.refreshTargetTree();
            this.refreshSourceTree();

            this.isSourceTreeLoading = false;
            this.isTargetTreeLoading = false;

            this.changed.emit();
        }
    }

    onMoveToRight() {
        if (this.isDataLoaded && this.checkedSelectedData.length) {
            this.isTouched = true;

            this.isSourceTreeLoading = true;
            this.isTargetTreeLoading = true;

            this.moveNodes(this.selectedData, this.availableData, this.checkedSelectedData);
            this.checkedSelectedData = [];
            this.availableData = this.sortTree(this.availableData);
            this.applyNodeTypes(this.availableData, this.selectedData);
            this.applyNodeTypes(this.selectedData, this.availableData);
            this.refreshTargetTree();
            this.refreshSourceTree();

            this.isSourceTreeLoading = false;
            this.isTargetTreeLoading = false;

            this.changed.emit();
        }
    }

    onMoveAllToLeft() {
        if (!this.isDataLoaded || !this.availableData || this.availableData.length <= 0) {
            return;
        }

        this.isTouched = true;
        _.remove(this.checkedAvailableData);
        this.checkedAvailableData.push(...this.availableData);
        this.onMoveToLeft();
    }

    onMoveAllToRight() {
        if (!this.isDataLoaded || !this.selectedData || this.selectedData.length <= 0) {
            return;
        }

        this.isTouched = true;
        _.remove(this.checkedSelectedData);
        this.checkedSelectedData.push(...this.selectedData);
        this.onMoveToRight();
    }

    onAvailableDataSelectionChanged() {
    }

    onSelectedDataSelectionChanged() {
    }

    onCancel(userConfiguration: any, parentFacilities: string[], selectedFacilitiesIds: string[]) {
        this.restore(userConfiguration, parentFacilities, selectedFacilitiesIds);
    }

    onSaved(userConfiguration: any, parentFacilities: string[], selectedFacilitiesIds: string[]) {
        this.restore(userConfiguration, parentFacilities, selectedFacilitiesIds);
    }

    onClearOrphans() {
        let changed = false;
        _.remove(this.selectedData, facilityNode => {
            // remove orphan facilities
            if (this.transformService.isOrphanFacilityNode(facilityNode)) { changed = true; return true; }

            // remove orphan untis in this facility
            _.remove(facilityNode.children, unitNode => {
                if (this.transformService.isOrphanUnitNode(unitNode)) { changed = true; return true; }

                // remove orphan patients in this unit
                _.remove(unitNode.children, patientNode => {
                    if (this.transformService.isOrphanPatientNode(patientNode)) { changed = true; return true; }
                });

                // -- don't remove empty units. if (!unitNode.children || unitNode.children.length <= 0) { return true; }
            });

            // -- don't remove empty facilities. if (!facilityNode.children || facilityNode.children.length <= 0) { return true; }
        });

        if (changed) {
            this.isTouched = true;
            this.refreshTargetTree();
            this.refreshSourceTree();

            this.changed.emit();
        }
    }

    /**
     * Gets the displayed facility filters.
     * The returned filters include all filters (even those that are not currently being displayed )
     * @param selectedFacilityId Master facility ID
     */
    getFacilityFilters(selectedFacilitiesIds: string[]): FacilityFilter[] {
        const newFacilityFilters: FacilityFilter[] = this.selectedData.map(node => this.getFacilityFilter(node));

        // If a single facility is selected => add existing configuration of the rest of facilities to preserve settings
        if (selectedFacilitiesIds && selectedFacilitiesIds.length > 0) {

            const nativeFacilities: string[] = [];
            selectedFacilitiesIds.forEach(selectedFacilityId => {
                const native = this.getNativeFacility(selectedFacilityId, this.facilityMappings);
                if (native) {
                    nativeFacilities.push(native);
                }
            });
            newFacilityFilters.push(...this.originalFacilityFilters.filter(f => !nativeFacilities.some(n => n === f.facilityId)));
        }

        console.log('== FacilitySelectionComponent filter configuration created ==', newFacilityFilters);
        return newFacilityFilters;
    }

    private getFacilityMappings(userConfiguration: any, facilities: any): FacilityMapping[] {
        return facilities.map(facility => {
            return {
                masterId: facility.id,
                masterName: facility.name,
                native: this.facilityLookUpService
                    .nativeFacilityLookUp(facility.id, userConfiguration.authorizationConfig, MvdConstants.INFUSION_PROVIDER_NAME)

            };
        });
    }

    private getInfusionFacilityList(masterFacilityNames: string[], selectedFacilitiesIds: string[], facilityMappings: FacilityMapping[]) {
        let requiredFacilitiesNativeIds: string[] = [];

        if (selectedFacilitiesIds && selectedFacilitiesIds.length > 0) {
            requiredFacilitiesNativeIds = selectedFacilitiesIds.filter(s => masterFacilityNames.indexOf(s) >= 0)
                .map(s => this.getNativeFacility(s, facilityMappings))
                .filter(n => n);
            
        } else {
            requiredFacilitiesNativeIds = masterFacilityNames
                .map(n => this.getNativeFacility(n, facilityMappings))
                .filter(n => n);
        }

        return requiredFacilitiesNativeIds;
    }

    private restore(userConfiguration: any, parentFacilities: string[], selectedFacilitiesIds: string[]) {
        this.showLoadErrorMessage = false;
        this.isTouched = false;
        this.isDataLoaded = false;
        this.availableData = [];
        this.checkedAvailableData = [];
        this.selectedData = [];
        this.checkedSelectedData = [];
        this.loadData(userConfiguration, parentFacilities, selectedFacilitiesIds);
    }

    private getNativeFacility(masterFacilityId: string, facilityMappings: FacilityMapping[]): string {
        const facilityMapping = facilityMappings.find(fm => fm.masterId === masterFacilityId);
        if (!facilityMapping) { return undefined; }

        return facilityMapping.native;
    }

    private getResources() {
        return {
            purgeFacilitySelection: this.resourcesService.resource('purgeFacilitySelection'),
            purgeDescription: this.resourcesService.resource('purgeDescription'),
            unableToRetrieveFacilityFilters: this.resourcesService.resource('unableToRetrieveFacilityFilters'),
            availableFacilities: this.resourcesService.resource('availableFacilities'),
            selectedFacilities: this.resourcesService.resource('selectedFacilities'),
            moveRighArrowTooltip: this.resourcesService.resource('moveRighArrowTooltip'),
            moveAllRighArrowTooltip: this.resourcesService.resource('moveAllRighArrowTooltip'),
            moveLeftArrowTooltip: this.resourcesService.resource('moveLeftArrowTooltip'),
            moveAllLeftArrowTooltip: this.resourcesService.resource('moveAllLeftArrowTooltip')
        };
    }

    private filterBySelectedFacility(facilityFilters: FacilityFilter[],
        facilityInfoList: FacilityInfo[], facilityMappings: FacilityMapping[], selectedFacilitiesIds: string[]) {
        if (selectedFacilitiesIds && selectedFacilitiesIds.length > 0) {
            const nativeFacilities: string[] = []
            selectedFacilitiesIds.forEach(selectedFacilityId => {
                const nativeFacility = this.getNativeFacility(selectedFacilityId, facilityMappings);
                if (nativeFacility) {
                    nativeFacilities.push(`${nativeFacility}`);
                }
            });
            _.remove(facilityFilters, filter => nativeFacilities.findIndex(f => f === filter.facilityId) < 0);
            _.remove(facilityInfoList, filter => nativeFacilities.findIndex(f => f === filter.adtFacility) < 0);

        }

        
    }

    private isInfusionFacility(masterFacilityId: string, authorizationConfig: any) {
        return authorizationConfig.some((config: any) =>
            config.id === masterFacilityId &&
            (config.synonyms || []).some(synonym => (synonym.source || '').toLocaleLowerCase() === MvdConstants.INFUSION_PROVIDER_NAME));
    }

    /**
     * Adds a facility to the Infusion facilities
     * @param facilityMappings
     * @param selectedFacilityId Master facility name to add
     * @param facilityInfoList
     */
    private addSingleFacilityWithoutInfusionData(selectedFacilitiesIds: string[], facilityMappings: FacilityMapping[],
                                                 facilityInfoList: FacilityInfo[]
    ) {
        if (selectedFacilitiesIds) {
            const facilityMapping = facilityMappings.filter(fm => selectedFacilitiesIds.findIndex(s => s === fm.masterId) >= 0);
            if (!facilityMapping || facilityMapping.length === 0) { return; }

            facilityMapping.forEach(f => {
                if (facilityInfoList.some(fi => fi.adtFacility === f.native)) {
                    return;
                }
                facilityInfoList.push({ adtFacility: f.native, facilityId: '', units: [] });
            });
        }
    }

    private addFacilitiesWithoutInfusionData(masterFacilityIds: string[], facilityMappings: FacilityMapping[],
                                             facilityInfoList: FacilityInfo[]
    ) {
        masterFacilityIds.forEach(masterId => {
            const nativeFacility = this.getNativeFacility(masterId, facilityMappings);
            if (nativeFacility === undefined) { return; }

            if (facilityInfoList.some(i => nativeFacility.toLocaleLowerCase() === i.adtFacility.toLocaleLowerCase())) {
                return;
            }

            facilityInfoList.push({ adtFacility: nativeFacility, facilityId: '', units: [] });
        });
    }

    private processInfusionInfo(masterFacilityIds: string[], facilityFilters: FacilityFilter[],
                                facilityInfoList: FacilityInfo[], facilityMappings: FacilityMapping[], selectedFacilitiesIds: string[]) {
        this.checkedAvailableData = [];
        this.checkedSelectedData = [];
        this.availableData = [];
        this.selectedData = [];

        this.isDataLoaded = true;
        this.showLoadErrorMessage = false;

        if (!selectedFacilitiesIds) {
            this.addFacilitiesWithoutInfusionData(masterFacilityIds, facilityMappings, facilityInfoList);
        } else {
            this.filterBySelectedFacility(facilityFilters, facilityInfoList, facilityMappings, selectedFacilitiesIds);
            let selectedInfusionFacilities = masterFacilityIds.filter(n => selectedFacilitiesIds.some(d => d === n));
            if (selectedInfusionFacilities.length > 0) {
                this.addSingleFacilityWithoutInfusionData(selectedInfusionFacilities, facilityMappings, facilityInfoList);
            }
        }

        // remove duplicate unknown patients and units
        facilityInfoList.forEach(f => {
            if (f.units && f.units.length) {
                f.units.forEach(u => this.removeDuplicateUnknownPatientsInUnit(u));
            }
            this.removeDuplicateUnknownUnitsInFacility(f);
        });

        this.availableData = this.sortTree(this.transformService.getTree(facilityInfoList, facilityMappings));
        
        if (facilityFilters) {
            this.processInitialSelection(facilityFilters);
        }

        this.isSourceTreeLoading = false;
        this.isTargetTreeLoading = false;
        this.isPurgeEnabled = true;

        const actionButtonState = this.isDataLoaded && (facilityInfoList.length > 0 || facilityFilters.length > 0);
        this.updateActionButtonStatus(actionButtonState);
    }

    private handleInfusionInfoError(error) {
        console.error('Error loading data', error);
        this.isDataLoaded = false;
        this.showLoadErrorMessage = true;

        this.isSourceTreeLoading = false;
        this.isTargetTreeLoading = false;

        this.updateActionButtonStatus(false);
    }

    private onLoadDataComplete() {
        this.isSourceTreeLoading = false;
        this.isTargetTreeLoading = false;
    }

    private moveNodes(sourceTree: TreeNode[], targetTree: TreeNode[], selection: TreeNode[]) {
        this.processFacilitySelectionNodes(sourceTree, targetTree, selection);
        this.processUnitSelectionNodes(targetTree, selection);
        this.processPatientSelectionNodes(targetTree, selection);
        this.checkedAvailableData = [];
        this.checkedSelectedData = [];
        FacilitySelectionComponent.clearPartialSelection(sourceTree);
        FacilitySelectionComponent.clearPartialSelection(targetTree);
    }

    private processFacilitySelectionNodes(sourceTree: TreeNode[], targetTree: TreeNode[], selection: TreeNode[]) {
        const selectedFacilitiesNodes = selection.filter(node => this.transformService.isFacilityNode(node));
        if (selectedFacilitiesNodes.length <= 0) {
            return;
        }

        selectedFacilitiesNodes.forEach(sourceFacilityNode => {
            if (!this.transformService.isOrphanFacilityNode(sourceFacilityNode)) {
                const targetFacilityNode = targetTree.find(tf => this.transformService.isSameFacilityNode(tf, sourceFacilityNode));

                // If facility doesn't exist in target, add it
                if (!targetFacilityNode) {
                    const newFacility = this.createNewFacilityWithAllUnits(sourceFacilityNode);
                    this.transformService.addFacilityToTree(targetTree, newFacility);
                } else {
                    // Target facility already exists. Move source units to it
                    const sourceUnitNodes = sourceFacilityNode.children;
                    sourceUnitNodes.forEach(sourceUnitNode => {
                        this.copyUnitToExistingFacility(sourceFacilityNode, sourceUnitNode, targetFacilityNode);
                    });

                    // Remove unit nodes from facility
                    this.deleteUnitsFromFacility(sourceFacilityNode, sourceUnitNodes);
                }
            }

            // remove from source tree
            this.transformService.removeFacility(sourceTree, sourceFacilityNode);

            // remove from selection
            this.removeFacilityFromSelection(selection, selectedFacilitiesNodes);
        });
    }

    private deleteUnitsFromFacility(facilityNode: TreeNode, unitNodes: TreeNode[]) {
        const unitNodesClone = _.clone(unitNodes);
        unitNodesClone.forEach(unitNodeClone => {
            if (!facilityNode.children) { return; }
            const unitNode = facilityNode.children.find(un => this.transformService.isSameUnitNode(un, unitNodeClone));
            if (!unitNode) { return; }
            this.transformService.removeUnitFromFacility(facilityNode, unitNode);
        });
    }

    private processUnitSelectionNodes(targetTree: TreeNode[], selection: TreeNode[]) {
        const selectedUnitsNodes = selection.filter(node => this.transformService.isUnitNode(node));
        if (selectedUnitsNodes.length <= 0) {
            return;
        }

        selectedUnitsNodes.forEach(sourceUnitNode => {
            const sourceFacilityNode = sourceUnitNode.parent;

            // dont'move orphan units
            if (this.transformService.isOrphanUnitNode(sourceUnitNode)) {
                this.transformService.removeUnitFromFacility(sourceFacilityNode, sourceUnitNode);
                return;
            }

            const targetFacilityNode = targetTree.find(targetFacility =>
                this.transformService.isSameFacilityNode(sourceFacilityNode, targetFacility));

            // If target facility doesn't exist, create it with the selected unit
            if (!targetFacilityNode) {
                const newFacility = this.transformService.createNewFacility(sourceFacilityNode, this.facilityFilterConfig.facilityMappings);
                const newUnit = this.transformService.createNewUnit(sourceUnitNode);
                const newPatients = sourceUnitNode.children
                    .filter(patientNode => !this.transformService.isOrphanPatientNode(patientNode))
                    .map(patientNode => this.transformService.createNewPatient(patientNode));
                this.transformService.addPatientsToUnit(newUnit, newPatients);
                this.transformService.addUnitToFacility(newFacility, newUnit);
                this.transformService.addFacilityToTree(targetTree, newFacility);

                this.transformService.removeUnitFromFacility(sourceFacilityNode, sourceUnitNode);

                return;
            }

            if (sourceFacilityNode.expanded) { targetFacilityNode.expanded = true; }

            // Target facility already exists -> Get target unit
            const targetUnitNode = targetFacilityNode.children.find(targetUnit =>
                this.transformService.isSameUnitNode(sourceUnitNode, targetUnit));
            if (!targetUnitNode) {
                // target unit don't exist -> create it
                const newUnit = this.transformService.createNewUnit(sourceUnitNode);
                const newPatients = sourceUnitNode.children
                    .filter(patientNode => !this.transformService.isOrphanPatientNode(patientNode))
                    .map(patientNode => this.transformService.createNewPatient(patientNode));
                this.transformService.addPatientsToUnit(newUnit, newPatients);
                this.transformService.addUnitToFacility(targetFacilityNode, newUnit);

                this.transformService.removeUnitFromFacility(sourceFacilityNode, sourceUnitNode);

                return;
            } else {
                // target unit exists -> move patients
                if (sourceUnitNode.expanded) { targetUnitNode.expanded = true; }

                const newPatients = sourceUnitNode.children
                    .filter(patientNode => !this.transformService.isOrphanPatientNode(patientNode))
                    .map(patientNode => this.transformService.createNewPatient(patientNode));
                this.transformService.addPatientsToUnit(targetUnitNode, newPatients);
                this.transformService.removeUnitFromFacility(sourceFacilityNode, sourceUnitNode);
            }
        });

        // remove from selection
        this.removeUnitFromSelection(selection, selectedUnitsNodes);
    }

    private processPatientSelectionNodes(targetTree: TreeNode[], selection: TreeNode[]) {
        const selectedPatientsNodes = selection.filter(node => this.transformService.isPatientNode(node));
        if (selectedPatientsNodes.length <= 0) {
            return;
        }

        selectedPatientsNodes.forEach(sourcePatientNode => {
            const sourceFacilityNode = sourcePatientNode.parent.parent;
            const sourceUnitNode = sourcePatientNode.parent;

            // don't move orphan patients
            if (this.transformService.isOrphanPatientNode(sourcePatientNode)) {
                this.transformService.removePatientFromUnit(sourceUnitNode, sourcePatientNode);
                return;
            }

            // Get target facility
            const targetFacilityNode = targetTree.find(tfn => this.transformService.isSameFacilityNode(sourceFacilityNode, tfn));

            // If target facility doesn't exist in target -> create it with appropiate data
            if (!targetFacilityNode) {
                const newFacility = this.transformService.createNewFacility(sourceFacilityNode, this.facilityFilterConfig.facilityMappings);
                const newUnit = this.transformService.createNewUnit(sourceUnitNode);
                const newPatient = this.transformService.createNewPatient(sourcePatientNode);

                this.transformService.addPatientToUnit(newUnit, newPatient);
                this.transformService.addUnitToFacility(newFacility, newUnit);
                this.transformService.addFacilityToTree(targetTree, newFacility);

                // remove patient from source unit
                this.transformService.removePatientFromUnit(sourceUnitNode, sourcePatientNode);

                return;
            }

            // Facility already exists in target -> Update target facility with unit and patient
            const targetUnitNode = targetFacilityNode.children.find(tun =>
                this.transformService.isSameUnitNode(tun, sourcePatientNode.parent));

            // If target unit doesn't exist in facility -> create it
            if (!targetUnitNode) {
                const newUnit = this.transformService.createNewUnit(sourceUnitNode);
                const newPatient = this.transformService.createNewPatient(sourcePatientNode);

                this.transformService.addPatientToUnit(newUnit, newPatient);
                this.transformService.addUnitToFacility(targetFacilityNode, newUnit);

                this.transformService.removePatientFromUnit(sourceUnitNode, sourcePatientNode);
                return;
            }

            // Target unit exists -> Add patient to it
            const newPatientNode = this.transformService.createNewPatient(sourcePatientNode);
            this.transformService.addPatientToUnit(targetUnitNode, newPatientNode);

            this.transformService.removePatientFromUnit(sourceUnitNode, sourcePatientNode);

        });
    }

    private removeFacilityFromSelection(selection: TreeNode[], selectedFacilitiesNodes: TreeNode[]) {
        _.remove(selection, selectedNode => {
            if (this.transformService.isFacilityNode(selectedNode)) {
                return true;
            }
            if (this.transformService.isUnitNode(selectedNode)) {
                if (selectedFacilitiesNodes.some(node => this.transformService.isSameFacilityNode(node, selectedNode.parent))) {
                    return true;
                }
            }
            if (this.transformService.isPatientNode(selectedNode)) {
                if (selectedFacilitiesNodes.some(node => this.transformService.isSameFacilityNode(node, selectedNode.parent.parent))) {
                    return true;
                }
            }
            return false;
        });
    }

    private removeUnitFromSelection(selection: TreeNode[], selectedUnitsNodes: TreeNode[]) {
        _.remove(selection, selectedNode => {
            if (this.transformService.isUnitNode(selectedNode)) {
                return true;
            }
            if (this.transformService.isPatientNode(selectedNode)) {
                if (selectedUnitsNodes.some(node => this.transformService.isSameUnitNode(node, selectedNode.parent))) {
                    return true;
                }
            }
            return false;
        });
    }

    private copyUnitToExistingFacility(sourceFacilityNode: TreeNode, sourceUnitNode: TreeNode, targetFacilityNode: TreeNode) {
        // Don't move orphan units
        if (this.transformService.isOrphanUnitNode(sourceUnitNode)) {
            this.transformService.removeUnitFromFacility(sourceFacilityNode, sourceUnitNode);
            return;
        }

        if (sourceFacilityNode.expanded) { targetFacilityNode.expanded = true; }

        // Get target unit
        const targetUnitNode = targetFacilityNode.children.find(tu => this.transformService.isSameUnitNode(tu, sourceUnitNode));
        if (!targetUnitNode) {
            // Target unit doesn't exist -> Create a new unit with all patients
            const newUnit = this.transformService.createNewUnit(sourceUnitNode);
            const newPatients = sourceUnitNode.children
                .filter(sourcePatientNode => !this.transformService.isOrphanPatientNode(sourcePatientNode))
                .map(sourcePatientNode => {
                    return this.transformService.createNewPatient(sourcePatientNode);
                });
            this.transformService.addPatientsToUnit(newUnit, newPatients);
            this.transformService.addUnitToFacility(targetFacilityNode, newUnit);
        } else {
            // Target unit already exists -> move existing patients into it
            this.moveAllPatientsToExistingUnit(sourceUnitNode, targetUnitNode);
        }
    }

    private moveAllPatientsToExistingUnit(sourceUnitNode: TreeNode, targetUnitNode: TreeNode) {
        if (sourceUnitNode.expanded) { targetUnitNode.expanded = true; }

        const sourcePatientNodes = sourceUnitNode.children;
        const newPatients = sourcePatientNodes
            .filter(sourcePatientNode => !this.transformService.isOrphanPatientNode(sourcePatientNode))
            .map(sourcePatientNode => this.transformService.createNewPatient(sourcePatientNode));
        this.transformService.addPatientsToUnit(targetUnitNode, newPatients);

        // remove all patients from source unit
        _.remove(sourceUnitNode.children);
        _.remove(sourceUnitNode.data.patients);
    }

    private createNewFacilityWithAllUnits(sourceFacilityNode: TreeNode): TreeNode {
        const newFacility = this.transformService.createNewFacility(sourceFacilityNode, this.facilityFilterConfig.facilityMappings);
        const newUnits = sourceFacilityNode.children
            .filter(unitNode => !this.transformService.isOrphanUnitNode(unitNode))
            .map(unitNode => {
                const newUnit = this.transformService.createNewUnit(unitNode);
                unitNode.children
                    .filter(patientNode => !this.transformService.isOrphanPatientNode(patientNode))
                    .forEach(patientNode => {
                        const newPatient = this.transformService.createNewPatient(patientNode);
                        this.transformService.addPatientToUnit(newUnit, newPatient);
                    });
                return newUnit;
            }) || [];

        newUnits.forEach(newUnit => this.transformService.addUnitToFacility(newFacility, newUnit));
        return newFacility;
    }

    private sortTree(sourceTree: TreeNode[]): TreeNode[] {
        const sortedTree = _.sortBy(sourceTree, 'label');
        sortedTree.forEach(f => {
            const sortedUnits = _.sortBy(f.children, 'label');
            f.children = sortedUnits;
            sortedUnits.forEach(u => {
                u.children = _.sortBy(u.children, 'label');
            });
        });
        return sortedTree;
    }

    private applyNodeTypes(sourceTree: TreeNode[], targetTree: TreeNode[]) {
        targetTree.forEach(targetFacilityNode => {
            if (targetFacilityNode.type === this.transformService.orphanType) {
                return;
            }
            if (!targetFacilityNode.children || !targetFacilityNode.children.length) {
                targetFacilityNode.leaf = true;
            }

            const sourceFacilityNode = sourceTree.find(sn => this.transformService.isSameFacilityNode(targetFacilityNode, sn));
            if (!sourceFacilityNode) {
                targetFacilityNode.type = this.transformService.allSelectedType;
                targetFacilityNode.children.forEach(targetUnitNode => {
                    if (targetUnitNode.type === this.transformService.orphanType) {
                        return;
                    }
                    targetUnitNode.type = this.transformService.allSelectedType;
                });
            } else {
                targetFacilityNode.type = this.transformService.partialSelectedType;

                targetFacilityNode.children.forEach(targetUnitNode => {
                    if (targetUnitNode.type === this.transformService.orphanType) {
                        return;
                    }

                    targetUnitNode.type = sourceFacilityNode.children
                        .some(sourceUnitNode =>
                            !this.transformService.isOrphanUnitNode(sourceUnitNode) &&
                            this.transformService.isSameUnitNode(sourceUnitNode, targetUnitNode))
                        ? this.transformService.partialSelectedType
                        : this.transformService.allSelectedType;
                });
            }
        });
    }

    private refreshTargetTree() {
        const dataTmp = this.selectedData;
        this.selectedData = [];
        setTimeout(() => {
            this.selectedData = dataTmp;
        }, 0);
    }

    private refreshSourceTree() {
        const dataTmp = this.availableData;
        this.availableData = [];
        setTimeout(() => {
            this.availableData = dataTmp;
        }, 0);
    }

    private updateActionButtonStatus(state: boolean) {
        this.isMoveAllRightEnabled = state;
        this.isMoveRightEnabled = state;
        this.isMoveAllLeftEnabled = state;
        this.isMoveLeftEnabled = state;
        this.isPurgeEnabled = state;
        return;
    }

    private processInitialSelection(filters: FacilityFilter[]) {
        const orphanFacilities: FacilityFilter[] = [];
        const orphanUnits = [];
        const orphanPatients = [];
        const selection: TreeNode[] = [];
        filters.forEach(facilityFilter => {
                const facilityNode = this.getFacilityNodeById(this.availableData, facilityFilter.facilityId);
                if (!facilityNode) {
                    // orphan facility -> do nothing
                    console.log(`Orphan facility found: '${facilityFilter.facilityId}', skipping`);
                    orphanFacilities.push(facilityFilter);
                    return;
                }

                // If facility doesn't have units -> Select whole facility
                if (!facilityFilter.units || facilityFilter.units.length <= 0) {
                    selection.push(facilityNode);
                    return;
                }

                // Facility has units -> process units
                facilityFilter.units.forEach(unitFilter => {
                    const unitNode = this.getUnitNodeById(this.availableData, facilityFilter.facilityId, unitFilter.unitId);
                    if (!unitNode) {
                        // orphan unit -> do nothing
                        console.log(`Orphan Unit found: '${unitFilter.unitId}', skipping`);
                        orphanUnits.push({
                            sourceFacilityNode: facilityNode,
                            facilityFilter: facilityFilter,
                            unitFilter: unitFilter
                        });
                        return;
                    }

                    // if unit doesn't have patients -> Select whole unit
                    if (!unitFilter.patients || unitFilter.patients.length <= 0) {
                        selection.push(unitNode);
                        return;
                    }

                    // unit has patients -> select individual patients
                    unitFilter.patients.forEach(patientFilter => {
                        const patientNode = this.getPatientNodeById(this.availableData,
                            facilityFilter.facilityId, unitFilter.unitId, patientFilter.patientId);

                        if (!patientNode) {
                            // orphan patient -> add it to the orphans list
                            orphanPatients.push({
                                sourceFacilityNode: facilityNode,
                                sourceUnitNode: unitNode,
                                facilityFilter: facilityFilter,
                                unitFilter: unitFilter,
                                patientFilter: patientFilter
                            });
                            return;
                        }

                        selection.push(patientNode);
                    });

                    // if all patients where selected in the unit -> add unit to the selection
                    if (!unitNode.children.some(patientNode =>
                            !selection.some(selectionNode => selectionNode === patientNode))
                        && !selection.some(node => node === unitNode)
                    ) {
                        selection.push(unitNode);
                    }
                });

                // if all units where selected in the facility -> add facility to the selection
                if (!facilityNode.children.some(unitNode =>
                        !selection.some(selectionNode => selectionNode === unitNode)) &&
                    !selection.some(node => node === facilityNode)
                ) {
                    selection.push(facilityNode);
                }
            }
        );

        let requiresRefresh = false;
        if (selection && selection.length >= 0) {
            this.moveNodes(this.availableData, this.selectedData, selection);
            requiresRefresh = true;
        }

        if (orphanFacilities.length) {
            orphanFacilities.forEach(orphanFacilityFilter => {
                const newFacility = this.transformService.createNewOrphanFacility(orphanFacilityFilter);
                const newUnits = orphanFacilityFilter.units.map(unitFilter => {
                    const newUnit = this.transformService.createNewOrphanUnit(unitFilter);
                    const newPatients = unitFilter.patients.map(patientFilter =>
                        this.transformService.createNewOrphanPatient(patientFilter));
                    this.transformService.addPatientsToUnit(newUnit, newPatients);
                    return newUnit;
                });
                this.transformService.addUnitsToFacility(newFacility, newUnits);
                this.transformService.addFacilityToTree(this.selectedData, newFacility);
            });
            requiresRefresh = true;
        }

        if (orphanUnits.length) {
            orphanUnits.forEach(orphanUnit => {
                const newUnit = this.transformService.createNewOrphanUnit(orphanUnit.unitFilter);
                const newPatients = (<UnitFilter>orphanUnit.unitFilter).patients.map(patientFilter =>
                    this.transformService.createNewOrphanPatient(patientFilter));
                this.transformService.addPatientsToUnit(newUnit, newPatients);

                const targetFacilityNode = this.getFacilityNodeById(this.selectedData, orphanUnit.facilityFilter.facilityId);
                if (targetFacilityNode) {
                    this.transformService.addUnitToFacility(targetFacilityNode, newUnit);
                } else {
                    const newFacility = this.transformService.createNewFacility(orphanUnit.sourceFacilityNode,
                        this.facilityFilterConfig.facilityMappings);
                    this.transformService.addUnitToFacility(newFacility, newUnit);
                    this.transformService.addFacilityToTree(this.selectedData, newFacility);
                }
            });
            requiresRefresh = true;
        }
        if (orphanPatients.length) {
            orphanPatients.forEach(orphanPatient => {
                const newPatient = this.transformService.createNewOrphanPatient(orphanPatient.patientFilter);

                const facilityId = (<FacilityFilter>orphanPatient.facilityFilter).facilityId;
                const unitId = (<UnitFilter>orphanPatient.unitFilter).unitId;
                const targetFacility = this.getFacilityNodeById(this.selectedData, facilityId);
                if (targetFacility) {
                    // target facility exists -> get target unit
                    const targetUnit = this.getUnitNodeById(this.selectedData, facilityId, unitId);
                    if (targetUnit) {
                        // target unit exists -> add new patient
                        this.transformService.addPatientToUnit(targetUnit, newPatient);
                    } else {
                        // target unit doesn't exist -> create it
                        const newUnit = this.transformService.createNewUnit(orphanPatient.sourceUnitNode);
                        this.transformService.addPatientToUnit(newUnit, newPatient);
                        this.transformService.addUnitToFacility(targetFacility, newUnit);
                    }

                } else {
                    // target facility doesn't exist -> create it (whole structure)
                    const newFacility = this.transformService.createNewFacility(orphanPatient.sourceFacilityNode,
                        this.facilityFilterConfig.facilityMappings);
                    const newUnit = this.transformService.createNewUnit(orphanPatient.sourceUnitNode);
                    this.transformService.addPatientToUnit(newUnit, newPatient);
                    this.transformService.addUnitToFacility(newFacility, newUnit);
                    this.transformService.addFacilityToTree(this.selectedData, newFacility);
                }
            });
            requiresRefresh = true;
        }

        if (requiresRefresh) {
            this.selectedData = this.sortTree(this.selectedData);
            this.applyNodeTypes(this.availableData, this.selectedData);
            this.applyNodeTypes(this.selectedData, this.availableData);
            this.refreshTargetTree();
            this.refreshSourceTree();
        }
    }

    private getFacilityFilter(facilityNode: TreeNode): FacilityFilter {
        const facilityInfo: FacilityInfo = facilityNode.data;
        const facilityFilter: FacilityFilter = {
            facilityId: facilityInfo.adtFacility,
            units: []
        };

        if (!this.isAllUnitsSelected(facilityNode)) {
            facilityFilter.units = facilityNode.children.map(unitNode => this.getUnitFilter(unitNode));
        }

        return facilityFilter;
    }

    private getUnitFilter(unitNode: TreeNode): UnitFilter {
        const unitInfo: UnitInfo = unitNode.data;
        const unitFilter: UnitFilter = {
            unitId: unitInfo.patientCareUnit,
            patients: []
        };

        if (!this.isAllPatientsSelected(unitNode)) {
            unitFilter.patients = unitNode.children.map(patientNode => FacilitySelectionComponent.getPatientFilter(patientNode));
        }

        return unitFilter;
    }

    private isAllUnitsSelected(facilityNode: TreeNode): boolean {
        
        // if contains orphan units -> preserve units individually to not override orphans
        if (facilityNode.children.some(node => this.transformService.isOrphanUnitNode(node))) { return false; }

        const facilityInfo: FacilityInfo = facilityNode.data;
        const sourceFacilityNode = this.getFacilityNodeById(this.availableData, facilityInfo.adtFacility);
        if (!sourceFacilityNode) { return true; }

        return !sourceFacilityNode.children || sourceFacilityNode.children.length <= 0;
    }

    private isAllPatientsSelected(unitNode: TreeNode): boolean {
        // if contains orphan patients -> preserve patients individually to not override orphans
        if (unitNode.children.some(node => this.transformService.isOrphanPatientNode(node))) { return false; }

        const facilityNode = unitNode.parent;
        const unitInfo: UnitInfo = unitNode.data;
        const facilityInfo: FacilityInfo = facilityNode.data;

        const sourceFacilityNode = this.getFacilityNodeById(this.availableData, facilityInfo.adtFacility);
        if (!sourceFacilityNode) { return true; }

        const sourceUnitNode = this.getUnitNodeById(this.availableData, facilityInfo.adtFacility, unitInfo.patientCareUnit);
        if (!sourceUnitNode) { return true; }

        return !sourceUnitNode.children || sourceUnitNode.children.length <= 0;
    }

    private getFacilityNodeById(tree: TreeNode[], facilityId: string): TreeNode {
        return tree.find(fn => (<FacilityInfo>fn.data).adtFacility === facilityId);
    }

    private getUnitNodeById(tree: TreeNode[], facilityId: string, unitId): TreeNode {
        const facility = this.getFacilityNodeById(tree, facilityId);
        if (!facility) { return undefined; }

        return facility.children.find(un => (<UnitInfo>un.data).patientCareUnit === unitId);
    }

    private getPatientNodeById(tree: TreeNode[], facilityId: string, unitId, patientId: string): TreeNode {
        const unit = this.getUnitNodeById(tree, facilityId, unitId);
        if (!unit) { return undefined; }

        return unit.children.find(pn => (<PatientInfo>pn.data).adtPatientId === patientId);
    }

    private removeDuplicateUnknownPatientsInUnit(unitInfo: UnitInfo) {
        if (!unitInfo || !unitInfo.patients || !unitInfo.patients.length) { return; }

        const unknownPatients = unitInfo.patients.filter(p => !p.adtPatientId);
        if (unknownPatients.length <= 1) { return; }
        const duplicatePatients = unknownPatients.slice(1);

        _.remove(unitInfo.patients, p => _.includes(duplicatePatients, p));
    }

    private removeDuplicateUnknownUnitsInFacility(facilityInfo: FacilityInfo) {
        if (!facilityInfo || !facilityInfo.units || !facilityInfo.units.length) { return; }

        const unknownUnits = facilityInfo.units.filter(u => !u.patientCareUnit);
        if (unknownUnits.length <= 1) { return; }
        const duplicateUnits = unknownUnits.slice(1);

        _.remove(facilityInfo.units, p => _.includes(duplicateUnits, p));
    }
}
