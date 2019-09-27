import { Injectable } from '@angular/core';
import { ResourceService } from 'container-framework';
import * as moment from 'moment';

import { FacilityLookUpService } from '../../../services/facility-look-up.service';
import { DataFormatPipe } from '../../pipes/mvd-data-format.pipe';
import { guardrailsWarnsStatus } from '../../services/mvd-data-transformation.types';
import { SortingService } from '../../services/mvd-sorting-service';
import { MvdConstants } from '../../shared/mvd-constants';
import { ContainerStatus } from '../../shared/mvd-container-status.type';
import { ContinuousInfusionsConfigurationService } from './mvd-continuous-infusions-configuration.service';
import { ContinuousInfusionsTresholdIndicators } from './mvd-continuous-infusions.types';
import * as _ from 'lodash';

@Injectable()
export class ContinuousInfusionsTransformationService {
    private facilitySourceProvider = 'infusion';
    public authorizationConfiguration: any[];

    configurations: any;

    constructor(private resources: ResourceService,
        private dataFormatPipe: DataFormatPipe,
        private configurationService: ContinuousInfusionsConfigurationService,
        private facilityLookUpService: FacilityLookUpService,
        private sortingService: SortingService) {
    }

    transformContinuousInfusionsData(data: any[], maskData: boolean = false, globalPreferences: any): any {
        if (globalPreferences) {
            this.configurations = {
                thresholdEscalate: globalPreferences.urgentThreshold,
                thresholdPriority: globalPreferences.priorityThreshold,
                thresholdWarning: globalPreferences.warningThreshold
            };
        }
        const items = data
            .filter(this.filterItems)
            .map((item: any) => this.mapContinuousInfusions(item, maskData));

        const summary = this.mapSummary(items.filter((item) => !item.isAcknowledged));

        const infusingItems = items
            .filter((item: any) => item.containerStatus === ContainerStatus.Infusing && !item.isAcknowledged)
            .sort((a: any, b: any) => this.numericSort(a.estimatedTimeTillEmpty, b.estimatedTimeTillEmpty));

        const stoppedItems = items
            .filter((item: any) => item.containerStatus === ContainerStatus.Stopped && !item.isAcknowledged)
            .sort((a: any, b: any) => this.numericSort(a.estimatedTimeTillEmpty, b.estimatedTimeTillEmpty));

        const acknowledgedItems = items
            .filter((item: any) => item.isAcknowledged)
            .sort((a: any, b: any) => this.numericSort(a.estimatedTimeTillEmpty, b.estimatedTimeTillEmpty));

        infusingItems.push(...stoppedItems);
        infusingItems.push(...acknowledgedItems);
        
        return {
            data: infusingItems,
            summary: summary
        };
    }

    transformOrderServices(data: any[], patientId: any) {
        if (data && data.length > 0) {
            const orders: any = [];
            const medicationOrders = data.forEach((item) => {

                if (item.resource.resourceType !== 'MedicationOrder' || !item.resource.dosageInstruction) {
                    return;
                }
                const dosageInstruction = item.resource.dosageInstruction; // .find((a) => a.timing);
                const dosageInstructionTiming = item.resource.dosageInstruction.find((a) => a.timing);
                if (!dosageInstruction || !dosageInstructionTiming) {
                    return;
                }
                const timing = dosageInstructionTiming.timing;

                if (!timing.repeat || !timing.repeat.boundsPeriod) {
                    return;
                }
                const encounterId = item.resource.encounter.reference.replace('Encounter/', '');
                const medicationId = item.resource.medicationReference.reference.replace('Medication/', '');
                const encounterFilter = data
                    .filter(
                        (dataItem) => dataItem.resource.resourceType === 'Encounter' &&
                            dataItem.resource.id === encounterId);
                const medicationFilter = data
                    .filter(
                        (dataItem) => dataItem.resource.resourceType === 'Medication' &&
                            dataItem.resource.id === medicationId);
                const encounter = encounterFilter[0] || null;
                const medication = medicationFilter[0] || null;

                // let dosageInstruction = item.resource.dosageInstruction;
                let doseRange: any = null;
                let dosageTiming: any = null;
                // let ingredient = medication.resource.product.ingredient[0] || null;
                for (const a in dosageInstruction) {
                    if (dosageInstruction.hasOwnProperty(a)) {
                        if (dosageInstruction[a].doseRange) {
                            doseRange = dosageInstruction[a] ? dosageInstruction[a].doseRange : null;
                            break;
                        }
                    }
                }
                dosageTiming = timing.repeat.boundsPeriod;

                const identifiers = (item && item.resource && item.resource.identifier) || [];
                const orderNumbers = identifiers
                    .filter(identifier => (identifier && identifier.value) && ((identifier && identifier.system) === 'OrderNumber'))
                    .map(identifier => identifier.value);

                const dosageInstructionItem = dosageInstruction.find(i => i.text);
                const orderInstructions = (dosageInstructionItem && dosageInstructionItem.text) || '';

                orders.push({
                    patientName: '',
                    encounterId: encounter ? encounter.resource.identifier[0].value : '',
                    patientId: patientId,
                    solutionName: `${medication.resource.code.text}`, // (${numeratorDenominator})`,
                    orderStatus: item.resource.status,
                    orderId: item.resource.id,
                    endDate: dosageTiming ? this.dataFormatPipe.transform(dosageTiming.end, 'localtime') : '',
                    startDate: dosageTiming ? this.dataFormatPipe.transform(dosageTiming.start, 'localtime') : '',
                    dose: doseRange ? `${doseRange.low.value} ${doseRange.low.unit}` : '',
                    rate: doseRange ? `${doseRange.high.value} ${doseRange.high.unit}` : '',
                    dosageStartDate: new Date(dosageTiming.start),
                    orderNumber: orderNumbers[0],
                    orderInstructions: orderInstructions
                });
            });
            return this.sortOrders(orders) || [];
        } else {
            return [];
        }
    }

    sortOrders(data: any[]) {
        if (data && data.length > 0) {
            const sortedOrders = this.sortingService.sortDataByField('dosageStartDate', -1, 'date', data);
            return sortedOrders;
        }
        return null;
    }

    numericSort(a: any, b: any) {
        const valueA = isNaN(a) ? 0 : a;
        const valueB = isNaN(b) ? 0 : b;
        return (valueA === valueB) ? 0 : valueA > valueB ? 1 : -1;
    }

    mapContinuousInfusions(item: any, maskData: boolean) {
        const drugAmount = this.mapDrugAmount(item);
        const timeTillEmpty = this.mapTimeTillEmpty(item);
        const result = {
            placerOrderId: item.placerOrderId,
            infusionContainerKey: item.infusionContainerKey,
            patientId: item.patientId,
            patientIdDisplay: this.mapPatientId(item.patientId, maskData),
            patientInformation: `${this.mapPatientInfo(item, maskData)} ${item.infusion} ${drugAmount}`,
            firstName: item.firstName,
            lastName: item.lastName,
            patientName: this.mapPatientInfo(item, maskData),
            infusionName: item.infusion || this.resources.resource('notApplicable'),
            infusionType: item.infusionType,
            containerStatus: item.containerStatus,
            containerStatusLabel: this.mapInfusionStatus(item.containerStatus),
            dose: this.mapDose(item),
            drugAmount: drugAmount,
            estimatedTimeTillEmpty: timeTillEmpty,
            drugAmountDiluentVolume: this.mapDrugAmountDiluentVolume(item),
            thresholdIndicator: this.mapThresholdIndicator(timeTillEmpty),
            displayStatus: this.mapDisplayStatus(item.containerStatus, timeTillEmpty),
            rate: this.mapRate(item),
            guardRailWarning: this.mapGuardrailStatus(item),
            adtFacility: item.adtFacility,
            masterFacility: this.getMasterFacility(item.adtFacility),
            isAcknowledged: this.mapAcknowledgedState(item),
            acknowledgedBy: item.acknowledgedState === 1 ? item.acknowledgedByUser : '',
            acknowledgetAt: item.acknowledgedState === 1 ? this.dataFormatPipe.transform(item.acknowledgementDateTime, 'localtime') : '',
            startDateTime: this.dataFormatPipe.transform(item.containerStartDateTime, 'date'),
            moduleType: item.moduleType,
            unit: item.patientCareUnit || '',
            unitMasterFacility: this.mapMasterFacilityUnit(item),
            masterFacilityUnitRoom: this.mapMasterFacilityUnitRoom(item),
            originalDrugAmount: this.mapOriginalDrugAmount(item),
            drugUnit: item.drugUnit,
            diluentAmount: this.mapDiluentAmount(item),
            diluentUnit: item.diluentUnit,
            medMinedFacilityId: this.facilityLookUpService.getMedMinedNativeFacility(item.adtFacility, this.authorizationConfiguration, MvdConstants.INFUSION_PROVIDER_NAME),
            medMinedAlerts: []
        };
        return result;
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

    mapPatientId(displayPatientId, maskData: boolean) {
        return maskData ? '' : `(${displayPatientId})`;
    }

    mapAcknowledgedState(item: any): boolean {
        return item.acknowledgedState === 1;
    }

    mapTimeTillEmpty(item: any): number {
        return item.containerStatus === ContainerStatus.Stopped
            ? this.calculateTimeTillEmpty(new Date(item.lastKnownContainerEstimatedEmptyTime + 'Z'),
                new Date(item.stopDateTime + 'Z'))
            : this.calculateTimeTillEmpty(new Date(item.lastKnownContainerEstimatedEmptyTime + 'Z'), new Date());
    }

    private mapDiluentAmount(item: any): number {
        let diluentAmount: number = null;
        if (item.diluentAmount) {
            diluentAmount = parseFloat(item.diluentAmount);
        }
        return diluentAmount;
    }

    mapDrugAmountDiluentVolume(item: any) {
        const drugAmount = this.pipeToDecimal(
            parseFloat(
                item.drugAmount.toFixed(this.getDrugAmountPrecision(item.drugAmount))
            ));
        const diluentAmount = this.pipeToDecimal(
            parseFloat(
                item.diluentAmount.toFixed(this.getDiluentVolumePrecision(item.diluentAmount)
                )));
        return `${drugAmount}
                ${item.drugUnit} / ${diluentAmount}${item.diluentUnit}`;
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

    getGuardRailVal(guardRailValue: string) {
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

    mapRate(item: any) {
        const rateAmount = this.pipeToDecimal(parseFloat(item.rateAmount.toFixed(this.getRatePrecision(item))));
        return `${rateAmount} ${this.resources
            .resource('mlAbbreviation')}/` +
            (item.rateTimeUnit && item.rateTimeUnit !== 'none' ? item.rateTimeUnit : '');
    }

    getStringGuardRailAlert(guardRailValue: string): string | any {
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

    mapSummary(items: any[]): any {
        const resume: any[] = [];
        const normal: any[] = [];
        const priority: any[] = [];
        const warning: any[] = [];
        items.forEach((item: any) => {
            if (item.estimatedTimeTillEmpty <= this.configurations.thresholdPriority) {
                priority.push(item.infusionContainerKey);
            } else if (item.estimatedTimeTillEmpty <= this.configurations.thresholdWarning) {
                warning.push(item.infusionContainerKey);
            } else if (item.containerStatus === ContainerStatus.Infusing) {
                normal.push(item.infusionContainerKey);
            }
        });
        resume.push({
            name: this.resources.resource('priority'),
            value: priority.length,
            order: 1,
            items: priority
        });
        resume.push({
            name: this.resources.resource('warning'),
            value: warning.length,
            order: 2,
            items: warning
        });
        resume.push({
            name: this.resources.resource('normal'),
            value: normal.length,
            order: 3,
            items: normal
        });
        return resume;
    }

    filterItems(item: any): any {
        const infusionType = item.infusionType ? item.infusionType.toLocaleLowerCase() : '';
        return item.patientName && item.patientId && infusionType === 'continuous' &&
            (item.containerStatus === ContainerStatus.Infusing || item.containerStatus === ContainerStatus.Stopped) &&
            !item.isKvo;
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
            (item.doseRateTimeUnit && item.doseRateTimeUnit !== 'none' ? '/' + item.doseRateTimeUnit : '');
    }

    private mapOriginalDrugAmount(item: any): number {
        let drugAmount: number = null;
        if (item.drugAmount) {
            drugAmount = parseFloat(item.drugAmount);
        }
        return drugAmount;
    }

    mapDrugAmount(item: any) {
        const drugAmount = this.pipeToDecimal(parseFloat(item.drugAmount.toFixed(this.getDrugAmountPrecision(item.drugAmount))));
        return `${drugAmount} ${item.drugUnit}`;
    }

    getRatePrecision(item: any) {
        const value = item.rateAmount || 0;
        if (item.moduleType === 'LVP') {
            return value < 100 ? 1 : 0;
        }
        return value < 10 ? 2 : (value >= 10 && value < 100) ? 1 : 0;
    }

    getDiluentVolumePrecision(diluent: any) {
        const value = diluent || 0;
        if (value) {
            if (value < 10) {
                return 2;
            } else if (value >= 10 && value <= 1000) {
                return 1;
            }
        }
        return 0;
    }

    getDosePrecision(dose: any) {
        const value = dose || 0;
        if (value) {
            if (value < 1) {
                return 4;
            } else if (value >= 1 && value < 10) {
                return 3;
            } else if (value >= 10 && value < 100) {
                return 2;
            } else if (value >= 100 && value <= 1000) {
                return 1;
            }
        }
        return 0;
    }

    getDrugAmountPrecision(drugAmount: any) {
        const value = drugAmount || 0;
        if (value) {
            if (value < 10) {
                return 3;
            } else if (value >= 10 && value < 100) {
                return 2;
            } else if (value >= 100 && value <= 1000) {
                return 1;
            }
        }
        return 0;
    }

    getTimeDiff(firstDate: any, secondDate: any): number {
        const diff = moment(firstDate).utcOffset('+0').diff(moment(secondDate).utc().utcOffset('+0'));
        return diff;
    }

    calculateTimeTillEmpty(last: Date, current: Date): number {
        const diff: number = this.getTimeDiff(last, current);
        return this.convertToMinutes(diff);
    }

    convertToMinutes(estimatedTimeTillEmpty: any): number {
        return !isNaN(estimatedTimeTillEmpty) && estimatedTimeTillEmpty >= 0 ? Math.floor(estimatedTimeTillEmpty / 60000) : 0;
    }

    mapThresholdIndicator(estimatedTimeTillEmpty: number): ContinuousInfusionsTresholdIndicators {
        return estimatedTimeTillEmpty <= this.configurations.thresholdEscalate
            ? ContinuousInfusionsTresholdIndicators.Escalate
            : estimatedTimeTillEmpty <= this.configurations.thresholdPriority
                ? ContinuousInfusionsTresholdIndicators.Priority
                : estimatedTimeTillEmpty <= this.configurations.thresholdWarning
                    ? ContinuousInfusionsTresholdIndicators.Warning
                    : ContinuousInfusionsTresholdIndicators.Normal;
    }

    mapDisplayStatus(containerStatus: any, timeUntillEmpty: number): any {
        return containerStatus === ContainerStatus.Stopped ?
            this.resources.resource('stopped') :
            `${timeUntillEmpty}${this.resources.resource('minAbbreviationGraph')}`;
    }

    getMasterFacility(adtFacility: any) {
        if (!adtFacility || !this.authorizationConfiguration.length) {
            return this.resources.resource('unknown');
        }
        return this.facilityLookUpService.masterFacilityNameLookUp(adtFacility,
            this.authorizationConfiguration,
            this.facilitySourceProvider);
    }

    mapPatientInfo(item: any, maskData: boolean) {
        if (!maskData) {
            return item.patientName || this.resources.resource('unknown');
        }
        const patientInfo = {
            patientLastName: item.lastName,
            patientFirstName: item.firstName
        };
        return this.maskPatientInfo(patientInfo);
    }

    mapMasterFacilityUnit(item) {

        return `${this.getMasterFacility(item.adtFacility)}/` +
            (item.patientCareUnit &&
                item.patientCareUnit.toString().toLowerCase() !== 'null'
                ? `${item.patientCareUnit}` : this.resources.resource('unknown'));
    }

    mapMasterFacilityUnitRoom(item) {
        return `${this.getMasterFacility(item.adtFacility)}/` +
            (item.patientCareUnit &&
                item.patientCareUnit.toString().toLowerCase() !== 'null'
                ? `${item.patientCareUnit}` : this.resources.resource('unknown')) +
            (item.room &&
                item.room.toString().toLowerCase() !== 'null'
                ? `/${item.room}` : `/${this.resources.resource('unknown')}`);
    }

    getOrderNumbers(orders: any): string[] {
        if (orders) {
            const entries = (orders && orders.entry) || [];
            const resources = entries.filter(entry =>
                (entry && entry.resource && entry.resource.resourceType) === 'MedicationOrder')
                .map(entry => entry.resource)
                .filter(resource =>
                    resource.identifier
                    && resource.identifier.length > 0
                    && resource.identifier.some(identifier => identifier.system === 'OrderNumber')
                );
            const orderNumbers = _.flatMap(resources, (resource) => resource.identifier)
                .filter(identifier => identifier.system === 'OrderNumber' && identifier.value)
                .map(identifier => identifier.value);

            return orderNumbers;
        }

        return [];
    }

    getFirstOrderNumber(orders: any): string {
        const orderNumbers = this.getOrderNumbers(orders);
        if (orderNumbers.length > 0) {
            return orderNumbers[0];
        }

        return undefined;
    }

    private maskPatientInfo(value) {
        const maskedPatientFirstName = (value.patientFirstName || '').substr(0, 2);
        return (value.patientLastName || '').substr(0, 1) + (maskedPatientFirstName ? ', ' + maskedPatientFirstName : '');
    }

    private pipeToDecimal(value) {
        return this.dataFormatPipe.transform(value, MvdConstants.PIPE_TYPES_DECIMAL);
    }
}
