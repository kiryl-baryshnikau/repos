import * as moment from 'moment';

import { Injectable } from '@angular/core';

import { FacilityLookUpService } from '../../services/facility-look-up.service';
import { DataFormatPipe } from '../pipes/mvd-data-format.pipe';
import { MvdConstants } from '../shared/mvd-constants';
import { IvStatusItem } from '../shared/mvd-models';
import { guardrailsWarnsStatus } from './mvd-data-transformation.types';
import * as _ from 'lodash';

import { ResourceService } from 'container-framework';
import { UUID } from 'angular2-uuid';

@Injectable()
export class DataTransformationService {
    private facilitySourceProvider = 'infusion';
    private allowUnknown: boolean;
    private allowUnknownCharPrefix = '*';
    private unknown = '';

    public authorizationConfiguration: any[];

    constructor(
        private dataFormatPipe: DataFormatPipe,
        private resources: ResourceService,
        private facilityLookUpService: FacilityLookUpService) {

        this.unknown = this.resources.resource('unknown');
    }

    transformIVStatusData(item: any, maskData: boolean = false, allowUnknown: boolean = false): IvStatusItem {
        this.allowUnknown = allowUnknown;
        const mappedPatientId = this.mapPatientId(item.patientId, item.adtPatientId, maskData);

        const result = <IvStatusItem>{
            uuid: UUID.UUID(),
            infusionContainerKey: item.infusionContainerKey,
            patientId: mappedPatientId[0],
            patientIdUnmasked: mappedPatientId[1],
            patientName: this.mapPatientInfo(item, maskData),
            patientFirstName: this.mapFirstName(item),
            patientLastName: `${item.lastName ? item.lastName : ''}`,
            facility: this.mapFacilityId(item.adtFacility, item.facilityId) || this.unknown,
            masterFacility: this.getMasterFacility(item.adtFacility, item.facilityId) || this.unknown,
            unitRoom: this.mapUnitRoom(item),
            unit: item.patientCareUnit || this.unknown,
            infusionName: item.infusion,
            drugAmountDiluentVolume: this.mapDrugAmountDiluentVolume(item),
            drugAmountDiluentVolumeDetail: this.mapDrugAmountDiluentVolumeDetail(item),
            dose: this.mapDose(item),
            doseDetail: this.mapDoseDetail(item),
            rate: this.mapRate(item),
            rateDetail: this.mapRateDetail(item),
            startDateTime: this.dataFormatPipe.transform(item.containerStartDateTime, 'localtime'),
            estimatedTimeTillEmpty: this.calculateTimeTillEmpty(item),
            estimatedTimeTillEmptyCounter: this.calculateTimeTillEmptyForCounters(item),
            estimatedVolumeRemaining: this.mapestimatedVolumeRemaining(item),
            infusionStatus: `${this.mapInfusionStatus(item.containerStatus)} (${item.moduleType})`,
            replenishmentStatus: this.mapReplenishmentStatus(item),
            lastUpdate: this.dataFormatPipe.transform(item.lastUpdateDateTime, 'localtime'),
            highPriority: false,
            guardrailStatus: this.mapGuardrailStatus(item),
            infusionType: item.infusionType,
            vtbi: this.mapVtbi(item.vtbi),
            vtbiDetail: this.mapVtbiDetail(item.vtbi),
            cumulativeVolumeInfused: this.mapCumulativeVolumeInfused(item.totalContainerInfusedVolume),
            clinicianId: item.clinicianId || this.unknown,
            unmaskedPatientName: this.mapPatientInfo(item, false),
            accountNumber: item.accountNumber || '',
            gender: item.gender || '',
            admitDate: item.admitDate ? this.dataFormatPipe.transform(item.admitDate, 'localtime') : '',
            dischargeDate: item.dischargeDate ? this.dataFormatPipe.transform(item.dischargeDate, 'localtime') : '',
            floor: item.floor || '',
            bed: item.bed || '',
            room: item.room || '',
            adtPatientId: item.adtPatientId || '',
            dateOfBirth: item.dob ? this.dataFormatPipe.transform(item.dob, 'date') : '',
            moduleModelNumber: this.mapModuleNumber(item.moduleId || ''),
            moduleSerialNumber: this.mapSerialNumber(item.moduleId || ''),
            pcuModelNumber: this.mapModuleNumber(item.pcuId || ''),
            pcuSerialNumber: this.mapSerialNumber(item.pcuId || ''),
            physician: item.physician || '',
            placerOrderId: item.placerOrderId,
            drugAmount: item.drugAmount,
            drugUnit: item.drugUnit,
            medMinedFacilityId: this.mapMedMinedFacility(this.authorizationConfiguration, item.adtFacility)
        };

        return result;
    }

    mapMedMinedFacility(authorizationInfo: any[], nativeFacilityId: string): string {
        return this.facilityLookUpService
            .getMedMinedNativeFacility(nativeFacilityId, authorizationInfo, MvdConstants.INFUSION_PROVIDER_NAME);
    }

    mapFacilityId(adtFacilityId, facilityId) {
        return adtFacilityId || (this.allowUnknown ? `${this.allowUnknownCharPrefix}${facilityId}` : adtFacilityId);
    }

    mapReplenishmentStatus(item: any) {
        if (item.acknowledgedState === 1) {
            return this.resources.resource('acknowledged');
        } else {
            const infusionType = item.infusionType ? item.infusionType.toLocaleLowerCase() : '';
            if (infusionType === 'continuous' && this.greenZoned(item) === 'green') {
                return this.resources.resource('none');
            } else {
                return this.resources.resource('notApplicable');
            }
        }
    }

    greenZoned(item: any) {
        const seconds = parseInt(this.calculateTimeTillEmpty(item).valueOf());
        // 90 minute threshold for 'green status' infusions
        if (seconds / 60000 >= 90) {
            return 'green';
        }
    }

    mapFirstName(item: any) {
        let firstName = item.firstName || item.middleName || this.resources.resource('notApplicable');
        if (item.firstName && item.middleName) {
            firstName += " " + item.middleName;
        }
        return firstName;
    }

    mapestimatedVolumeRemaining(item: any) {
        const remainingVolume = this.pipeToDecimal(parseFloat(item.remainingVolume
            .toFixed(this.getDiluentVolumePrecision(item.remainingVolume))));
        return `${remainingVolume}${this.resources.resource('mlAbbreviation')}`;
    }

    mapUnitRoom(item: any) {
        return (`${item.patientCareUnit || ''}/${item.room || ''}`);
    }

    mapRate(item: any) {
        const rateAmount = this.pipeToDecimal(parseFloat(item.rateAmount.toFixed(this.getRatePrecision(item))));
        return `${rateAmount} ${this.resources
            .resource('mlAbbreviation')}/` +
            (item.rateTimeUnit && item.rateTimeUnit !== 'none' ? item.rateTimeUnit : '');
    }

    mapRateDetail(item) {
        return `${this.pipeToDecimal(item.rateAmount)} ${this.resources.resource('mlAbbreviation')}/` +
            (item.rateTimeUnit && item.rateTimeUnit !== 'none' ? item.rateTimeUnit : '');
    }

    mapDrugAmountDiluentVolume(item: any) {
        if (this.isDrugAmountDiluentVolumeNa(item)) {
            return this.resources.resource('notApplicable');
        }
        const drugAmount = this.pipeToDecimal(
                                parseFloat(item.drugAmount.toFixed(this.getDrugAmountPrecision(item.drugAmount))));
        const diluentAmount = this.pipeToDecimal(
                                parseFloat(item.diluentAmount.toFixed(this.getDiluentVolumePrecision(item.diluentAmount))));
        return `${drugAmount}
                ${item.drugUnit} / ${diluentAmount}${item.diluentUnit}`;
    }

    mapDrugAmountDiluentVolumeDetail(item: any) {
        if (this.isDrugAmountDiluentVolumeNa(item)) {
            return this.resources.resource('notApplicable');
        }
        return `${this.pipeToDecimal(item.drugAmount)} ${item.drugUnit} / ${this.pipeToDecimal(item.diluentAmount)}${item.diluentUnit}`;
    }

    private isDrugAmountDiluentVolumeNa(item) {
        // if this comes back as 'none' for Basic, we are assuming Drug-Calc InfusionType and displaying a Rate.
        const itemDrugUnit = item.drugUnit;
        const infusionType = item.infusionType ? item.infusionType.toLocaleLowerCase() : '';
        return infusionType === 'fluid' || (infusionType === 'basic' && itemDrugUnit === 'none');
    }

    mapDose(item: any) {
        const infusionType = item.infusionType ? item.infusionType.toLocaleLowerCase() : '';
        if (infusionType === 'fluid' || infusionType === 'basic') {
            return this.resources.resource('notApplicable');
        }
        const doseRateAmount =
            this.pipeToDecimal(parseFloat(item.doseRateAmount.toFixed(this.getDosePrecision(item.doseRateAmount))));
        return `${doseRateAmount} ${item.doseRateUnit}` +
            (item.doseRateModifierUnit && item.doseRateModifierUnit !== 'none' ? '/' + item.doseRateModifierUnit : '') +
            (item.doseRateTimeUnit && item.doseRateTimeUnit != 'none' ? '/' + item.doseRateTimeUnit : '');
    }

    mapDoseDetail(item) {
        const infusionType = item.infusionType ? item.infusionType.toLocaleLowerCase() : '';
        if (infusionType === 'fluid' || infusionType === 'basic') {
            return this.resources.resource('notApplicable');
        }
        return `${this.pipeToDecimal(item.doseRateAmount)} ${item.doseRateUnit}` +
            (item.doseRateModifierUnit && item.doseRateModifierUnit !== 'none' ? '/' + item.doseRateModifierUnit : '') +
            (item.doseRateTimeUnit && item.doseRateTimeUnit != 'none' ? '/' + item.doseRateTimeUnit : '');
    }

    mapInfusionStatus(infusionStatus: number): string {

        let status = '';

        switch (infusionStatus) {
            case 1200:
                status = this.resources.resource('status1200');
                break;
            case 1201:
                status = this.resources.resource('status1201');
                break;
            case 1202:
                status = this.resources.resource('status1202');
                break;
            case 1203:
                status = this.resources.resource('status1203');
                break;
            case 1204:
                status = this.resources.resource('status1204');
                break;
            case 1205:
                status = this.resources.resource('status1205');
                break;
            default:
                status = this.resources.resource('notApplicable');
        }

        return status;
    }

    calculateTimeTillEmpty(item: any): string {
        const completed = this.resources.resource('completed');
        const notApplicable = this.resources.resource('notApplicable');

        let timeTillEmpty = '';

        switch (item.containerStatus) {
            case 1200:
                timeTillEmpty = completed;
                break;
            case 1203:
            case 1201:
                timeTillEmpty = this.unknown;
                break;
            case 1202:
                if (item.isKvo) {
                    timeTillEmpty = notApplicable;
                } else {
                    try {
                        const currentDate: Date = new Date();
                        const lastDate: Date = new Date(item.lastKnownContainerEstimatedEmptyTime + 'Z');

                        const diff: number = this.getTimeDiff(lastDate, currentDate);
                        timeTillEmpty = diff.toString();
                    } catch (ex) {
                        console.log(ex);
                    }
                }
                break;
            default:
                timeTillEmpty = this.unknown;
        }

        return timeTillEmpty;
    }

    calculateTimeTillEmptyForCounters(item: any): string {
        let timeTillEmpty = '';
        if (item.containerStatus === 1202) {
            try {
                const currentDate: Date = new Date();
                const lastDate: Date = new Date(item.lastKnownContainerEstimatedEmptyTime + 'Z');

                const diff: number = this.getTimeDiff(lastDate, currentDate);
                if (diff < 0) {
                    throw 'Infusion has finished';
                }
                timeTillEmpty = diff.toString();
            } catch (ex) {
                timeTillEmpty = this.resources.resource('notApplicable');
            }
        } else {
            timeTillEmpty = this.resources.resource('notApplicable');
        }
        return timeTillEmpty;
    }

    mapGuardrailStatus(item: any): any {
        const countGRViolations = {
            countGRViolations: 0,
            messages: ['']
        };
        countGRViolations.messages = [];
        if (item.hasGuardrailsWarning) {
            const totalviolations = this.getGuardRailVal(item.grConcentrationLimit) +
                this.getGuardRailVal(item.grBdarLimitsStatus) +
                this.getGuardRailVal(item.grBolusDoseLimitsStatus) +
                this.getGuardRailVal(item.grDoseLimitsStatus) +
                this.getGuardRailVal(item.grDurationLimitsStatus) +
                this.getGuardRailVal(item.grRateLimitsStatus);
            countGRViolations.countGRViolations = totalviolations;

            let statusStr: string;
            statusStr = this.getStringGuardRailAlert(item.grConcentrationLimit);
            if (typeof statusStr === 'string') {
                statusStr = `${this.resources.resource('grConcentrationLimits')} ${statusStr}`;
                countGRViolations.messages.push(statusStr);
            }

            statusStr = this.getStringGuardRailAlert(item.grBdarLimitsStatus);
            if (typeof statusStr === 'string') {
                statusStr = `${this.resources.resource('grBdarLimits')} ${statusStr}`;
                countGRViolations.messages.push(statusStr);
            }

            statusStr = this.getStringGuardRailAlert(item.grBolusDoseLimitsStatus);
            if (typeof statusStr === 'string') {
                statusStr = `${this.resources.resource('grBolusDoseLimits')} ${statusStr}`;
                countGRViolations.messages.push(statusStr);
            }

            statusStr = this.getStringGuardRailAlert(item.grDoseLimitsStatus);
            if (typeof statusStr === 'string') {
                countGRViolations.messages.push(`${this.resources.resource('grDoseLimits')} ${statusStr}`);
            }

            statusStr = this.getStringGuardRailAlert(item.grDurationLimitsStatus);
            if (typeof statusStr === 'string') {
                countGRViolations.messages.push(`${this.resources.resource('grDurationLimits')} ${statusStr}`);
            }

            statusStr = this.getStringGuardRailAlert(item.grRateLimitsStatus);
            if (typeof statusStr === 'string') {
                countGRViolations.messages.push(`${this.resources.resource('grRateLimits')} ${statusStr}`);
            }
        }

        return countGRViolations;
    }

    getTimeDiff(firstDate: any, secondDate: any): number {
        const diff = moment(firstDate).utcOffset('+0').diff(moment(secondDate).utc().utcOffset('+0'));
        return diff;
    }

    mapCumulativeVolumeInfused(infusedVolume: any): any {
        const value = infusedVolume || 0;
        const volumeInfused = this.pipeToDecimal(parseFloat(value.toFixed(2)));
        return `${volumeInfused}
                ${this.resources.resource('mlAbbreviation')}`;
    }

    private getDrugAmountPrecision(drugAmount: any) {
        const value = drugAmount || 0;
        if (value) {
            if (value < 10) { return 3; }
            else if (value >= 10 && value < 100) { return 2; }
            else if (value >= 100 && value <= 1000) { return 1; }
        }
        return 0;
    }

    private getDosePrecision(dose: any) {
        const value = dose || 0;
        if (value) {
            if (value < 1) { return 4; }
            else if (value >= 1 && value < 10) { return 3; }
            else if (value >= 10 && value < 100) { return 2; }
            else if (value >= 100 && value <= 1000) { return 1; }
        }
        return 0;
    }

    private getRatePrecision(item: any) {
        const value = item.rateAmount || 0;
        if (item.moduleType === 'LVP') { return value < 100 ? 1 : 0; }
        return value < 10 ? 2 : (value >= 10 && value < 100) ? 1 : 0;
    }

    private getDiluentVolumePrecision(diluent: any) {
        const value = diluent || 0;
        if (value) {
            if (value < 10) { return 2; }
            else if (value >= 10 && value <= 1000) { return 1; }
        }
        return 0;
    }

    private getGuardRailVal(guardRailValue: string) {
        let myval = 0;
        switch (guardrailsWarnsStatus[guardRailValue]) {
            case guardrailsWarnsStatus.AboveMaximum:
            case guardrailsWarnsStatus.BelowMinimum:
                myval = 1;
                break;
            default:
                myval = 0;
        }
        return myval;
    }

    private getStringGuardRailAlert(guardRailValue: string): string | any {
        let mystring: string;
        switch (guardrailsWarnsStatus[guardRailValue]) {
            case guardrailsWarnsStatus.AboveMaximum:
                mystring = `${this.resources.resource('overLimit')}`;
                break;
            case guardrailsWarnsStatus.BelowMinimum:
                mystring = `${this.resources.resource('underLimit')}`;
                break;
            default:
                return null;
        }
        return mystring;
    }

    mapVtbi(vtbi: any): any {
        const vtbiValue = this.pipeToDecimal(parseFloat(vtbi.toFixed(this.getDiluentVolumePrecision(vtbi))));
        return `${vtbiValue}
                ${this.resources.resource('mlAbbreviation')}`;
    }
    mapVtbiDetail(vtbi: any): any {
        return `${vtbi} ${this.resources.resource('mlAbbreviation')}`;
    }

    getMasterFacility(adtFacility, facilityId) {
        if (!adtFacility && this.allowUnknown) {
            return facilityId ? `${this.allowUnknownCharPrefix}${facilityId}` : facilityId;
        }
        return this.facilityLookUpService.masterFacilityNameLookUp(adtFacility,
            this.authorizationConfiguration,
            this.facilitySourceProvider);
    }

    mapPatientInfo(item: any, maskData: boolean) {
        if (!maskData) {
            return item.patientName || this.unknown;
        }

        if (!item.patientName || !item.lastName || !item.firstName) {
            return this.unknown;
        }

        const patientInfo = {
            patientLastName: item.lastName,
            patientFirstName: item.firstName
        };
        return this.maskPatientInfo(patientInfo);
    }

    private maskPatientInfo(value) {
        const maskedPatientFirstName = (value.patientFirstName || '').substr(0, 2);
        return (value.patientLastName || '').substr(0, 1) + (maskedPatientFirstName ? ', ' + maskedPatientFirstName : '');
    }

    mapPatientId(patientId: string, adtPatientId: string, maskData: boolean): Array<string> {
        if (maskData) {
            return ['', ''];
        }

        if (!adtPatientId && this.allowUnknown) {
            if (patientId && patientId !== 'Unknown') {
                return [`${this.allowUnknownCharPrefix}${patientId.substr(0, 2)}`, this.allowUnknownCharPrefix + patientId];
            } else {
                return [this.unknown, ''];
            }
        } else {
            return [adtPatientId || this.unknown, ''];
        }
    }

    mapModuleNumber(moduleId) {
        const moduleArray = moduleId.split('S');
        if (moduleArray.length && moduleArray[0]) {
            return moduleArray[0].substring(1, moduleArray[0].length);
        }
        return '';
    }

    mapSerialNumber(moduleId) {
        const moduleArray = moduleId.split('S');
        if (moduleArray.length && moduleArray[1]) {
            return moduleArray[1];
        }
        return '';
    }

    private pipeToDecimal(value) {
        return this.dataFormatPipe.transform(value, MvdConstants.PIPE_TYPES_DECIMAL);
    }
}
