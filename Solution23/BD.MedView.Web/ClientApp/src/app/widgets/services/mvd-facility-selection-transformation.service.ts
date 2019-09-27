import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';
import * as _ from 'lodash';

import { FacilityInfo, UnitInfo, PatientInfo } from '../shared/mvd-models';
import {
    FacilityMapping,
    FacilityFilter,
    UnitFilter,
    PatientFilter
} from '../medview/configuration/medview-facility-selection/facility-selection.models';
import { ResourceService } from 'container-framework';

@Injectable()
export class MvdFacilitySelectionTransformService {
    allSelectedType = 'allSelected';
    partialSelectedType = 'partialSelected';
    orphanType = 'orphan';
    defaultType = 'default';

    constructor(private readonly resourceService: ResourceService) {
    }

    getTree(facilityInfo: FacilityInfo[], facilityMappings: FacilityMapping[]): TreeNode[] {
        return facilityInfo.map(f => this.getFacilityTreeNode(f, facilityMappings));
    }

    getPatientTreeNode(patientInfo: PatientInfo, parentUnitNode: TreeNode): TreeNode {
        const treeNode: TreeNode = {
            label: patientInfo.patientName || patientInfo.adtPatientId || this.resourceService.resource('unknownPatient'),
            data: patientInfo,
            type: this.defaultType,
            icon: '',
            leaf: true,
            parent: parentUnitNode,
            children: null
        };
        return treeNode;
    }

    getUnitTreeNode(unitInfo: UnitInfo, parentFacilityNode: TreeNode): TreeNode {
        const treeNode: TreeNode = {
            label: unitInfo.patientCareUnit || this.resourceService.resource('unknownUnit'),
            data: unitInfo,
            leaf: false,
            type: this.defaultType,
            icon: '',
            parent: parentFacilityNode,
            children: []
        };

        treeNode.children.push(...unitInfo.patients.map(p => this.getPatientTreeNode(p, treeNode)));
        return treeNode;
    }

    getFacilityTreeNode(facilityInfo: FacilityInfo, facilityMappings: FacilityMapping[]): TreeNode {
        const treeNode: TreeNode = {
            label: this.getMasterFacilityName(facilityMappings, facilityInfo.adtFacility),
            data: facilityInfo,
            leaf: false,
            type: this.defaultType,
            icon: '',
            children: []
        };
        treeNode.children.push(...facilityInfo.units.map(p => this.getUnitTreeNode(p, treeNode)));
        return treeNode;
    }

    getNativeFacilityId(facilityMappings: FacilityMapping[], facilityId: string): string {
        const facilityMapping = facilityMappings.find(fm => fm.masterId === facilityId);
        if (!facilityMapping) {
            return undefined;
        }
        return facilityMapping.native;
    }

    getMasterFacilityName(facilityMappings: FacilityMapping[], facilityId: string): string {
        const facilityMapping = facilityMappings.find(fm => fm.native === facilityId);
        if (!facilityMapping) {
            return undefined;
        }
        return facilityMapping.masterName;
    }

    createNewFacility(sourceFacilityNode: TreeNode, facilityMappings: FacilityMapping[]): TreeNode {
        const sourceFacilityInfo: FacilityInfo = sourceFacilityNode.data;
        const newFacilityInfo: FacilityInfo = {
            adtFacility: sourceFacilityInfo.adtFacility,
            facilityId: sourceFacilityInfo.facilityId,
            units: []
        };

        const node = this.getFacilityTreeNode(newFacilityInfo, facilityMappings);
        node.type = this.defaultType;
        node.expanded =  sourceFacilityNode.expanded;

        return node;
    }

    createNewOrphanFacility(facilityFilter: FacilityFilter): TreeNode {
        const newFacilityInfo: FacilityInfo = {
            adtFacility: facilityFilter.facilityId,
            facilityId: undefined,
            units: []
        };

        const node: TreeNode = {
            label: facilityFilter.facilityId,
            leaf: true,
            data: newFacilityInfo,
            type: this.orphanType,
            children: []
        };

        return node;
    }

    addFacilityToTree(treeNodes: TreeNode[], facilityNode: TreeNode) {
        treeNodes.push(facilityNode);
    }

    removeFacility(treeNodes: TreeNode[], facilityNode: TreeNode) {
        _.remove(treeNodes, node => this.isSameFacilityNode(node, facilityNode));
    }

    createNewUnit(sourceUnitNode: TreeNode): TreeNode {
        const sourceUnitInfo: UnitInfo = sourceUnitNode.data;
        const newUnitInfo: UnitInfo = {
            patientCareUnit: sourceUnitInfo.patientCareUnit,
            patients: []
        };

        const node = this.getUnitTreeNode(newUnitInfo, undefined);
        node.type = this.defaultType;
        node.expanded = sourceUnitNode.expanded;

        return node;
    }

    createNewOrphanUnit(unitFilter: UnitFilter): TreeNode {
        const newUnitInfo: UnitInfo = {
            patientCareUnit: unitFilter.unitId,
            patients: []
        };

        const node = this.getUnitTreeNode(newUnitInfo, undefined);
        node.type = this.orphanType;
        node.leaf = true;

        return node;
    }

    addUnitToFacility(facilityNode: TreeNode, unitNode: TreeNode) {
        const facilityInfo: FacilityInfo = facilityNode.data;
        const unitInfo: UnitInfo = unitNode.data;
        facilityInfo.units.push(unitInfo);

        unitNode.parent = facilityNode;
        facilityNode.children.push(unitNode);
        facilityNode.leaf = false;
    }

    addUnitsToFacility(facilityNode: TreeNode, unitNodes: TreeNode[]) {
        unitNodes.forEach(unitNode => {
            this.addUnitToFacility(facilityNode, unitNode);
        });
    }

    removeUnitFromFacility(facilityNode: TreeNode, unitNode: TreeNode) {
        const facilityInfo: FacilityInfo = facilityNode.data;
        const unitInfo: UnitInfo = unitNode.data;

        _.remove(facilityInfo.units, u => this.isSameUnit(u, unitInfo));
        _.remove(facilityNode.children, node => this.isSameUnitNode(node, unitNode));
    }

    createNewPatient(sourcePatientNode: TreeNode): TreeNode {
        const sourcePatientInfo: PatientInfo = sourcePatientNode.data;
        const newPatientInfo: PatientInfo = {
            adtPatientId: sourcePatientInfo.adtPatientId,
            dischargeDate: sourcePatientInfo.dischargeDate,
            firstName: sourcePatientInfo.firstName,
            infusionContainerKey: sourcePatientInfo.infusionContainerKey,
            lastName: sourcePatientInfo.lastName,
            middleName: sourcePatientInfo.middleName,
            patientId: sourcePatientInfo.patientId,
            patientName: sourcePatientInfo.patientName
        };

        const node = this.getPatientTreeNode(newPatientInfo, null);
        node.type = this.defaultType;

        return node;
    }

    createNewOrphanPatient(patientFilter: PatientFilter): TreeNode {
        const newPatientInfo: PatientInfo = {
            adtPatientId: patientFilter.patientId,
            patientName: patientFilter.patientName,
            dischargeDate: undefined,
            firstName: undefined,
            infusionContainerKey: undefined,
            lastName: undefined,
            middleName: undefined,
            patientId: undefined
        };

        const node = this.getPatientTreeNode(newPatientInfo, null);
        node.type = this.orphanType;

        return node;
    }

    addPatientToUnit(unitNode: TreeNode, patientNode: TreeNode) {
        const unitInfo: UnitInfo = unitNode.data;
        const patientInfo: PatientInfo = patientNode.data;
        unitInfo.patients.push(patientInfo);

        patientNode.parent = unitNode;
        unitNode.children.push(patientNode);
        unitNode.leaf = false;
    }

    addPatientsToUnit(unitNode: TreeNode, patientNodes: TreeNode[]) {
        patientNodes.forEach(patientNode => {
            this.addPatientToUnit(unitNode, patientNode);
        });
    }

    removePatientFromUnit(unitNode: TreeNode, patientNode: TreeNode) {
        const unitInfo: UnitInfo = unitNode.data;
        const patientInfo: PatientInfo = patientNode.data;

        _.remove(unitInfo.patients, p => this.isSamePatient(patientInfo, p));
        _.remove(unitNode.children, node => this.isSamePatientNode(patientNode, node));
    }

    removePatientsFromUnit(unitNode: TreeNode, patientNodes: TreeNode[]) {
        patientNodes.forEach(patientNode => {
            this.removePatientFromUnit(unitNode, patientNode);
        });
    }

    isSameFacility(sourceFacility: FacilityInfo, targetFacility: FacilityInfo) {
        return sourceFacility.adtFacility === targetFacility.adtFacility;
    }

    isSameUnit(sourceUnit: UnitInfo, targetUnit: UnitInfo) {
        return sourceUnit.patientCareUnit === targetUnit.patientCareUnit;
    }

    isSamePatient(sourcePatient: PatientInfo, targetPatient: PatientInfo) {
        return sourcePatient.adtPatientId === targetPatient.adtPatientId;
    }

    isSameFacilityNode(sourceNode: TreeNode, targetNode: TreeNode) {
        const sourceFacility = <FacilityInfo>sourceNode.data;
        const targetFacility = <FacilityInfo>targetNode.data;

        return this.isSameFacility(sourceFacility, targetFacility);
    }

    isSameUnitNode(sourceNode: TreeNode, targetNode: TreeNode) {
        const sourceUnit = <UnitInfo>sourceNode.data;
        const targetUnit = <UnitInfo>targetNode.data;
        return this.isSameUnit(sourceUnit, targetUnit);
    }

    isSamePatientNode(sourceNode: TreeNode, targetNode: TreeNode) {
        const sourcePatient = <PatientInfo>sourceNode.data;
        const targetPatient = <PatientInfo>targetNode.data;
        return this.isSamePatient(sourcePatient, targetPatient);
    }

    isOrphanFacilityNode(node: TreeNode): boolean {
        return this.isFacilityNode(node) && node.type === this.orphanType;
    }

    isOrphanUnitNode(node: TreeNode): boolean {
        return this.isUnitNode(node) && node.type === this.orphanType;
    }

    isOrphanPatientNode(node: TreeNode): boolean {
        return this.isPatientNode(node) && node.type === this.orphanType;
    }

    isFacilityNode(node: TreeNode): boolean {
        return node.data.hasOwnProperty('units');
    }

    isUnitNode(node: TreeNode): boolean {
        return node.data.hasOwnProperty('patients');
    }

    isPatientNode(node: TreeNode): boolean {
        return node.leaf && !node.data.hasOwnProperty('units') && !node.data.hasOwnProperty('patients');
    }
}
