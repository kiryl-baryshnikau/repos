import { Injectable } from '@angular/core';
import { IvPrepModels } from '../../shared/mvd-models';
import { ResourceService } from 'container-framework';
import { DataFormatPipe } from '../../pipes/mvd-data-format.pipe';
import { FacilityLookUpService } from '../../../services/facility-look-up.service';
import { MvdConstants } from '../../shared/mvd-constants';
import * as _ from 'lodash';
import { MvdTimeTransformService } from '../../services/mvd-time-transform.service';
import { UUID } from 'angular2-uuid';

@Injectable()
export class IvPrepTransformationService {

    constructor(private resourceService: ResourceService,
        private dataFormatPipe: DataFormatPipe,
        private facilityLookUpService: FacilityLookUpService,
        private timeTransformationService: MvdTimeTransformService) { }

    transform(response: { data: IvPrepModels.DosesResponse; }
        , stateMapping: IvPrepModels.StateMapping[], authInfo: any
        , facilitiesResponse: IvPrepModels.FacilitiesResponse
        , apiConfigResponse: IvPrepModels.ApiConfig
        , maskPatientData: boolean): IvPrepModels.IvPrepViewModel[] {

        const doses = response.data.Doses
            .map((item: IvPrepModels.Dose) => this.transformSingle(
                                                            item
                                                            , stateMapping
                                                            , authInfo
                                                            , facilitiesResponse
                                                            , apiConfigResponse
                                                            , maskPatientData));
        return doses.filter((dose) => dose);
    }

    transformSingle(doseItem: IvPrepModels.Dose
        , stateMappings: IvPrepModels.StateMapping[]
        , authorizationInfo: any, facilitiesResponse: IvPrepModels.FacilitiesResponse
        , apiConfigResponse: IvPrepModels.ApiConfig
        , maskingEnabled: boolean): IvPrepModels.IvPrepViewModel {

        const status = this.resolveStatus(doseItem, stateMappings);
        if (!status) {
            return null;
        }
        const facilityId = _.head(this.mapFacilityAbbreviationToFacilityId(facilitiesResponse, doseItem.FacilityAbbr));
        const masterFacility = this.mapMasterFacility(facilityId, authorizationInfo);
        const adminDateTime =
            this.timeTransformationService.toLocalTime(doseItem.AdminDateTime, apiConfigResponse.TimeZoneOffset);
        const patientName = maskingEnabled
            ? this.maskPatientName(doseItem.Patient.Name)
            : doseItem.Patient.Name;
        const patientNumber = maskingEnabled ? '' : doseItem.Patient.PatientNumber || '';


        return <IvPrepModels.IvPrepViewModel>{
            uuid: UUID.UUID(),
            doseId: doseItem.DoseId || '',
            patientName: patientName || '',
            patientNumber: patientNumber,
            facilityName: doseItem.FacilityAbbr || '',
            masterFacility: masterFacility,
            dateTimeNeeded: this.dataFormatPipe.transform(adminDateTime, 'datetime') || '',
            orderNumber: doseItem.OrderNumber || '',
            prepSite: doseItem.Prepsite || '',
            unit: doseItem.UnitDesignation || '',
            status: status,
            statusDisplayName: this.mapStatusDisplayName(status),
            priority: doseItem.Urgent,
            isOnHold: doseItem.Blocked,
            isOnHoldView: doseItem.Blocked,
            medication: this.mapMedication(doseItem.Drugs),
            doseMedNumber: doseItem.DoseId,
            cancelled: doseItem.Cancelled,
            doseViewStatus: this.mapDoseViewStatus(doseItem),
            isHoldDisabled: this.isHoldDisabled(authorizationInfo),
            isPriorityChangeDisabled: this.isPriorityChangeDisabled(authorizationInfo),
            finalContainerType: doseItem.FinalContainerType,
            sourceDoseItem: doseItem,
            medMinedFacilityId: this.facilityLookUpService.getMedMinedNativeFacility(facilityId,
                authorizationInfo, MvdConstants.CATO_PROVIDER_NAME)
        };
    }

    mapMedication(drugs: IvPrepModels.Drug[]): string {
        if (!drugs || !drugs.length) {
            return '';
        }
        const [drug = ''] = drugs;
        return drug && drug.PrimaryActiveSubstance ? drug.PrimaryActiveSubstance : '';
    }

    mapFacilityDesignationToFacilityId(facilitiesResponse: IvPrepModels.FacilitiesResponse, facilityDesignation: string): string[] {
        const facilityIds = (facilitiesResponse.Facilities || [])
            .filter(f => (f.Designation || '').toUpperCase() === (facilityDesignation || '').toUpperCase())
            .map(f => f.Id);

        return facilityIds;
    }

    mapFacilityAbbreviationToFacilityId(facilitiesResponse: IvPrepModels.FacilitiesResponse, facilityAbbreviation: string): string[] {
        const facilityIds = (facilitiesResponse.Facilities || [])
            .filter(f => (f.Abbreviation || '').toUpperCase() === (facilityAbbreviation || '').toUpperCase())
            .map(f => f.Id);

        return facilityIds;
    }

    mapUnitDesignationToUnitId(unitsResponse: IvPrepModels.UnitsResponse, unitDesignation: string): string[] {
        const unitIds = (unitsResponse.Units || [])
            .filter(f => (f.Designation || '').toUpperCase() === (unitDesignation || '').toUpperCase())
            .map(f => f.Id);

        return unitIds;
    }

    mapPrepSiteAbbreviationToId(prepSitesResponse: IvPrepModels.PrepSitesResponse, abbreviation: string) {
        return prepSitesResponse.Prepsites
            .filter(prepSite => (prepSite.Abbreviation || '').toUpperCase() === (abbreviation || '').toUpperCase())
            .map(prepSite => prepSite.Id);
    }

    mapDoseViewStatus(dose: IvPrepModels.Dose) {
        let status;
        if (dose.Cancelled) {
            status = 'CANCELED';
        } else if (dose.Blocked) {
            status = dose.Urgent ? 'ONHOLDSTAT' : 'ONHOLD';
        } else {
            status = dose.Urgent ? 'STAT' : 'Normal';
        }
        return status;
    }

    resolveStatus(doseItem: IvPrepModels.Dose, stateMappings: IvPrepModels.StateMapping[]): IvPrepModels.IvPrepStatuses {
        return this.resolveStatusByStateId(doseItem.StateId, stateMappings);
    }

    resolveStatusByStateId(stateId: string, stateMappings: IvPrepModels.StateMapping[]): IvPrepModels.IvPrepStatuses {
        const widgetState = stateMappings
            .find((mappingItem) => (
                    mappingItem.providerStates.findIndex((providerItem) => providerItem.stateId === stateId) > -1)
                    , stateId);
        if (!widgetState) {
            return null;
        }
        return widgetState.type as IvPrepModels.IvPrepStatuses;
    }

    mapStatusDisplayNameFromDose(dose: IvPrepModels.Dose, stateMappings: IvPrepModels.StateMapping[]): string {
        const hsvStatus = this.resolveStatus(dose, stateMappings);
        return this.mapStatusDisplayName(hsvStatus);
    }

    mapStatusDisplayName(status: IvPrepModels.IvPrepStatuses) {

        switch (status) {
            case 'DELIVERY':
                return this.resourceService.resource('completed');
            case 'INPREP':
                return this.resourceService.resource('inPrep');
            case 'READYCHECK':
                return this.resourceService.resource('readyForCheck');
            case 'QUEUEDPREP':
                return this.resourceService.resource('queuedForPrep');
            case 'READYDELIVERY':
                return this.resourceService.resource('readyForDelivery');
            case 'READYPREP':
                return this.resourceService.resource('readyForPrep');
            default:
                return this.resourceService.resource('unknown');
        }
    }

    mapStatusDisplayNameToStatus(statusDisplayName: string): IvPrepModels.IvPrepStatuses {
        switch (statusDisplayName) {
            case this.resourceService.resource('completed'):
                return 'DELIVERY';
            case this.resourceService.resource('inPrep'):
                return 'INPREP';
            case this.resourceService.resource('readyForCheck'):
                return 'READYCHECK';
            case this.resourceService.resource('queuedForPrep'):
                return 'QUEUEDPREP';
            case this.resourceService.resource('readyForDelivery'):
                return 'READYDELIVERY';
            case this.resourceService.resource('readyForPrep'):
                return 'READYPREP';
            default:
                return undefined;
        }
    }

    mapStatusToNative(status: IvPrepModels.IvPrepStatuses, stateMappings: IvPrepModels.StateMapping[]): string[] {
        const stateItem = stateMappings.find((item) => item.type === status);
        return stateItem ? stateItem.providerStates.map(a => a.stateId) : [];
    }

    mapMasterFacility(facilityId: string, authorizationInfo): string {
        if (!facilityId && !authorizationInfo) {
            this.resourceService.resource('unknown');
        }
        return this.facilityLookUpService.masterFacilityNameLookUp(facilityId, authorizationInfo, MvdConstants.CATO_PROVIDER_NAME);
    }

    mapNativeFacilityFromMaster(masterFacility: string, authorizationInfo): string {
        if (!masterFacility && !authorizationInfo) {
            this.resourceService.resource('unknown');
        }
        return this.facilityLookUpService.getNativeFacilityFromMasterFacilityName(masterFacility, authorizationInfo,
            MvdConstants.CATO_PROVIDER_NAME);
    }

    isPriorityChangeDisabled(authorizationInfo): boolean {
        return !this.hasRole(MvdConstants.PHARMACIST_ROLE_ID, authorizationInfo);
    }

    isHoldDisabled(authorizationInfo): boolean {
        return !this.hasRole(MvdConstants.PHARMACIST_ROLE_ID, authorizationInfo);
    }

    hasRole(roleName: string, authorizationInfo: any): boolean {
        if (!roleName || !authorizationInfo || !authorizationInfo.length) {
            return false;
        }
        const facilities = authorizationInfo.filter((item) => item.name !== MvdConstants.AUTHORIZATION_ROOT_ID);
        const permissions = _.flatMap(facilities, 'permissions');
        if (permissions.length) {

            return permissions.some((permission) => permission.resource === MvdConstants.PHARMACIST_ROLE_ID);
        }
        return false;
    }

    getDoseCountFromSummary(dosesSummary: IvPrepModels.DoseSummary, stateMappings: IvPrepModels.StateMapping[],
        ivPrepStatus?: IvPrepModels.IvPrepStatuses): { normalCount: number, statCount: number } {

        let doseStates: IvPrepModels.DoseState[] = dosesSummary.DoseStates;
        if (ivPrepStatus) {
            const nativeStatuses = this.mapStatusToNative(ivPrepStatus, stateMappings).map(x => (x || '').toString());
            doseStates = dosesSummary.DoseStates.filter(doseState => _.includes(nativeStatuses, doseState.StateId));
        }

        const normalCount = _.sumBy(doseStates, doseState => doseState.TotalDoseCount);
        const statCount = _.sumBy(doseStates, doseState => doseState.UrgentDoseCount);

        return { normalCount, statCount };
    }

    maskPatientName(name: string): string {
        const [lastName, firstName] = name.split(',');
        const maskedPatientFirstName = (firstName || '').trim().substr(0, 2);

        const displayPatientInfo =
            (lastName || '').trim().substr(0, 1) +
                (maskedPatientFirstName ? ', ' + maskedPatientFirstName : '');
        return displayPatientInfo;
    }
}
