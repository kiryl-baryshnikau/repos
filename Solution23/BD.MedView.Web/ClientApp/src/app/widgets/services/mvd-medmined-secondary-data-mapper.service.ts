import { Injectable } from '@angular/core';
import { MedMinedModels as mmModel } from '../shared/medmined-models';
import { DeliveryTrackingItem, ContinuousInfusionItem, IvStatusItem, IvPrepModels } from '../shared/mvd-models';
import * as _ from 'lodash';
import { FacilityPatientIdMapping } from '../../services/facility-patient-id-mapping.service';

@Injectable()
export class MvdMedMinedSecondaryDataMapperService {
    static mapIdInfo(providerName: string, synonymKey: string, value: string, options: FacilityPatientIdMapping[]): mmModel.IdInfo[] {
        let result = options
            .filter(opt => opt.providerName == providerName && opt.synonymKey == synonymKey)
            .map(opt => ({ idKind: opt.patientIdKind, value: value }));

        return result.length == 0 ? null : result;
    }

    mapDeliveryTracking(item: DeliveryTrackingItem, options: FacilityPatientIdMapping[]): mmModel.PatientInfo {
        let result: mmModel.PatientInfo = {
            id: item['uuid'],
            idInfo: MvdMedMinedSecondaryDataMapperService.mapIdInfo('DeliveryTracking', item.medMinedFacilityId, item.patientId, options) || [
                { idKind: 'MRN', value: item.patientId }
            ],
            patientFirstName: item.patientData.firstName,
            patientLastName: item.patientData.lastName,
            placerOrderNumber: item.orderId,
            primaryDrugName: item.genericName,
            concentration: { amount: `${item.giveAmount}`, amountUnits: item.giveUnitOfMeasure },
            medMinedfacilityId: item.medMinedFacilityId
        };

        return result;
    }

    mapContinuousInfusions(item: ContinuousInfusionItem, options: FacilityPatientIdMapping[]): mmModel.PatientInfo {
        let result: mmModel.PatientInfo = {
            id: item['uuid'],
            idInfo: MvdMedMinedSecondaryDataMapperService.mapIdInfo('ContinuousInfusions', item.medMinedFacilityId, item.patientId, options) || [
                { idKind: 'MRN', value: item.patientId }
            ],
            patientFirstName: item.firstName,
            patientLastName: item.lastName,
            placerOrderNumber: item.placerOrderId,
            primaryDrugName: item.infusionName,
            concentration: { amount: `${item.drugAmount}`, amountUnits: item.drugUnit },
            medMinedfacilityId: item.medMinedFacilityId
        };

        return result;
    }

    mapIvStatus(item: IvStatusItem, options: FacilityPatientIdMapping[]): mmModel.PatientInfo {
        let result: mmModel.PatientInfo = {
            id: item.uuid,
            idInfo: MvdMedMinedSecondaryDataMapperService.mapIdInfo('IvStatus', item.medMinedFacilityId, item.accountNumber, options) || [
                { idKind: 'AccountNumber', value: item.accountNumber },
                { idKind: 'MRN', value: item.patientId }
            ],
            patientFirstName: item.patientFirstName,
            patientLastName: item.patientLastName,
            placerOrderNumber: item.placerOrderId,
            primaryDrugName: item.infusionName,
            concentration: { amount: `${item.drugAmount}`, amountUnits: item.drugUnit },
            medMinedfacilityId: item.medMinedFacilityId
        };

        return result;
    }

    mapIvPrep(item: IvPrepModels.IvPrepViewModel, options: FacilityPatientIdMapping[]): mmModel.PatientInfo {
        const splittedPatientName = _.split((item.patientName || ''), ',');
        const lastName = splittedPatientName.length >= 1 ? _.trim(splittedPatientName [0]) : '';
        const firstName = splittedPatientName.length > 1 ? _.trim(splittedPatientName[1]) : '';

        const drugInfo = _.get(item, 'sourceDoseItem.Drugs[0]', { PrimaryActiveSubstance: '', FinalAmount: '', FinalUnit: '' });

        let result: mmModel.PatientInfo = {
            id: item.uuid,
            idInfo: MvdMedMinedSecondaryDataMapperService.mapIdInfo('IvPrep', item.medMinedFacilityId, item.patientNumber, options) || [
                { idKind: 'MRN', value: item.patientNumber },
                { idKind: 'AccountNumber', value: item.patientNumber }
            ],
            patientFirstName: firstName,
            patientLastName: lastName,
            placerOrderNumber: item.orderNumber,
            primaryDrugName: drugInfo.PrimaryActiveSubstance || '',
            concentration: {
                amount: `${drugInfo.FinalAmount || ''}`,
                amountUnits: `${drugInfo.FinalUnit || ''}`
            },
            medMinedfacilityId: item.medMinedFacilityId
        };

        return result;
    }
}
