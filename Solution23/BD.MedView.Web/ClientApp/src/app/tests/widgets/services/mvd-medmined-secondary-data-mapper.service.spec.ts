import { Injectable } from "@angular/core";
import { TestBed } from '@angular/core/testing';

import { MvdMedMinedSecondaryDataMapperService } from "../../../widgets/services/mvd-medmined-secondary-data-mapper.service";
import { FacilityPatientIdMapping } from "../../../services/facility-patient-id-mapping.service";
import { IvPrepModels, DeliveryTrackingItem } from "../../../widgets/shared/mvd-models";
import { MedMinedModels as mmModel } from '../../../widgets/shared/medmined-models';

describe('Service: MvdMedMinedSecondaryDataMapperService', () => {
    let target: MvdMedMinedSecondaryDataMapperService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MvdMedMinedSecondaryDataMapperService
            ]
        });

        target = TestBed.get(MvdMedMinedSecondaryDataMapperService);
    });

    it('Should be defined', () => {
        expect(target).toBeDefined();
    });

    describe('Method: mapIdInfo', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(MvdMedMinedSecondaryDataMapperService.mapIdInfo).toBeDefined();
        });

        it('Should do the job', () => {
            let providerName = "DeliveryTracking";
            let synonymKey = "1760";
            let value = "VID102";
            let options = <FacilityPatientIdMapping[]>JSON.parse('[{"id":1,"synonymKey":"1760","providerName":"DeliveryTracking","patientIdKind":"MRN"},{"id":2,"synonymKey":"1760","providerName":"ContinuousInfusions","patientIdKind":"MRN"},{"id":3,"synonymKey":"1760","providerName":"IvStatus","patientIdKind":"AccountNumber"}]');

            let expected = <mmModel.IdInfo[]>JSON.parse('[{"idKind":"MRN","value":"VID102"}]');
            let actual = MvdMedMinedSecondaryDataMapperService.mapIdInfo(providerName, synonymKey, value, options);

            expect(actual).toEqual(expected);
        });
    });

    describe('Method: mapDeliveryTracking', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.mapDeliveryTracking).toBeDefined();
        });

        it('Should do the job', () => {
            let item = <DeliveryTrackingItem>JSON.parse('{"internalId":5,"deliveryLocationName":"LocationA","priority":"","patient":"NCML, NCMF","patientId":"VID102","unit":"DASUnit","facilityCodeUnit":"NCMC-DASUnit","patientRoomName":"ROOM00001","patientBedId":"","patientInfo":"N, NC","patientData":{"firstName":"NCMF","lastName":"NCML"},"location":"NCMC-DASUnit (ROOM00001)","orderStatus":"","orderDescription":"NCMC1 100 mg/500 mL (150 L) TAB","status":"DELIVERED","deliveryTrackingStatus":"Delivered","dateAge":"08/08/17 13:54","dateAgeValue":"2017-08-08T20:54:37.1464416Z","orderId":"NCMCOrderID1","giveAmount":50,"maximumGiveAmount":100,"routes":["IV"],"giveUnitOfMeasure":"TAB","isMultiComponentOrder":false,"facilityCode":"NCMC","facilityName":"MyNewMasterFacility","genericName":"NCMC1","medMinedFacilityId":"1760","medMinedAlerts":[],"uuid":"41e932d3-2225-8958-b263-8d12ba451529"}');
            let options = <FacilityPatientIdMapping[]>JSON.parse('[{"id":1,"synonymKey":"1760","providerName":"DeliveryTracking","patientIdKind":"MRN"},{"id":2,"synonymKey":"1760","providerName":"ContinuousInfusions","patientIdKind":"MRN"},{"id":3,"synonymKey":"1760","providerName":"IvStatus","patientIdKind":"AccountNumber"}]');

            let expected = <mmModel.PatientInfo>JSON.parse('{"id":"41e932d3-2225-8958-b263-8d12ba451529","idInfo":[{"idKind":"MRN","value":"VID102"}],"patientFirstName":"NCMF","patientLastName":"NCML","placerOrderNumber":"NCMCOrderID1","primaryDrugName":"NCMC1","concentration":{"amount":"50","amountUnits":"TAB"},"medMinedfacilityId":"1760"}');
            let actual = target.mapDeliveryTracking(item, options);

            expect(actual).toEqual(expected);
        });
    });

    describe('Method: mapContinuousInfusions', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.mapContinuousInfusions).toBeDefined();
        });
    });

    describe('Method: mapIvStatus', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.mapIvStatus).toBeDefined();
        });
    });

    describe('Method: mapIvPrep', () => {
        beforeEach(() => {
        });

        it('Should be defined', () => {
            expect(target.mapIvPrep).toBeDefined();
        });
    });
});
