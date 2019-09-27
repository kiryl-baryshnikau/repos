import { Injectable } from '@angular/core';

import { DispensingDataTransformationService } from '../../../services/mvd-dispensing-data-transformation-service';
import { ResourceService } from 'container-framework';
import { DeliveryTrackingItem, DeliveryTrackingPatientData } from '../../../shared/mvd-models';
import { FacilityLookUpService } from '../../../../services/facility-look-up.service';
import { MvdConstants } from '../../../shared/mvd-constants';
import * as _ from 'lodash';

@Injectable()
export class DeliveryTrackingTransformationService {
    constructor(private dispensingTransformationService: DispensingDataTransformationService,
                private facilityLookUpService: FacilityLookUpService,
                private resourceService: ResourceService ) {
    }

    transform(data: any[]
        , maskData: boolean
        , authorizationInfo: any): DeliveryTrackingItem[] {

        return data.map((item, index) => this.transformSingle(item, maskData, authorizationInfo, index));
    }

    private transformSingle(item: any
        , maskData: boolean
        , authorizationInfo: any
        , index: number): DeliveryTrackingItem {

        const masterFacility = this.mapMasterFacility(item, authorizationInfo);

        const deliveryTrackingItem = (<DeliveryTrackingItem>{
            internalId: index,
            deliveryLocationName: item.deliveryLocationName || '',
            priority: item.isStatPriority ? this.resourceService.resource('statIndicator') : '',
            patient: item.patientLastName + ', ' + item.patientFirstName,
            patientId: item.displayPatientId,
            unit: item.patientUnitName || '',
            facilityCodeUnit: this.mapFacilityCodeUnit(item),
            patientRoomName: item.patientRoomName || '',
            patientBedId: item.patientBedId || '',
            patientInfo: this.mapPatientInfo(item, maskData),
            patientData: this.mapPatientData(item),
            location: this.mapLocation(item),
            orderStatus: this.mapOrderStatus(item),
            orderDescription: this.mapOrderDescription(item),
            status: item.itemDeliveryTrackingStatusInternalCode,
            deliveryTrackingStatus: item.itemDeliveryTrackingStatusDescription,
            dateAge: this.mapDateAgeDisplayed(item),
            dateAgeValue: this.mapDateAgeValue(item),
            orderId: item.orderId,
            giveAmount: item.giveAmount,
            maximumGiveAmount: item.maximumGiveAmount,
            routes: item.routes,
            giveUnitOfMeasure: item.giveUnitOfMeasure,
            isMultiComponentOrder: item.isMultiComponentOrder,
            facilityCode: item.facilityCode,
            facilityName: masterFacility || item.facilityName,
            genericName: item.genericName,
            medMinedFacilityId: this.mapMedMinedFacility(authorizationInfo, item.facilityKey),
            medMinedAlerts: []
        });

        return deliveryTrackingItem;
    }

    private mapFacilityCodeUnit(item: any): string {
        const facilityCode = item.facilityCode || '';
        const unit = item.patientUnitName || '';

        return facilityCode + '-' + unit;
    }

    mapPatientInfo(item: any, maskData: boolean) {
        const patientInfo = {
            patientLastName: item.patientLastName,
            patientFirstName: item.patientFirstName,
            displayPatientId: item.displayPatientId
        };
        return this.dispensingTransformationService.formatPatientInfo(patientInfo, maskData);
    }

    mapPatientData(item: any): DeliveryTrackingPatientData {
        return {
            firstName: item.patientFirstName,
            lastName: item.patientLastName
        };
    }

    mapLocation(item) {
        let unitDisplayText = '';
        if (item.patientRoomName && item.patientBedId) {
            unitDisplayText = ' (' + item.patientRoomName + '-' + item.patientBedId + ')';
        } else if (item.patientRoomName || item.patientBedId) {
            unitDisplayText = ' (' + (item.patientRoomName || '') + (item.patientBedId || '') + ')';
        }

        const location = item.facilityCode + '-' + item.patientUnitName + unitDisplayText;
        return location;
    }

    mapOrderStatus(item) {
        return item.isDiscontinued ? this.resourceService.resource('orderStatusDiscontinued') :
            (item.isCancelled ? this.resourceService.resource('orderStatusCancelled') :
                (item.isOrderEnded ? this.resourceService.resource('orderStatusExpired') : ''));
    }

    mapOrderDescription(item) {
        return (item.medDisplayName || item.genericName) || this.resourceService.resource('seeMedicalRecord');
    }

    mapDateAgeDisplayed(item) {
        return item.itemDeliveryTrackingStatusInternalCode == 'DELIVERED' ?
            this.dispensingTransformationService.getDateDisplay(item.deliveredUtcDateTime, 0) :
            this.dispensingTransformationService.getDurationDisplay(item.itemDeliveryStateDuration);
    }

    mapDateAgeValue(item) {
        return item.itemDeliveryTrackingStatusInternalCode == 'DELIVERED'
            ? item.deliveredUtcDateTime
            : item.itemDeliveryStateDuration;
    }

    mapMasterFacility(item, authorizationInfo) {
        if (!item.facilityKey) {
            return item.facilityName;
        }
        this.dispensingTransformationService.authorizationConfiguration = authorizationInfo;
        const masterFacilityName =  this.dispensingTransformationService.getMasterFacility(item.facilityKey);
        return masterFacilityName !== this.resourceService.resource('unknown') ? masterFacilityName : item.facilityName;
    }

    mapMedMinedFacility(authorizationInfo: any, nativeFacilityId: string): string {
        return this.facilityLookUpService
            .getMedMinedNativeFacility(nativeFacilityId, authorizationInfo, MvdConstants.DISPENSING_PROVIDER_NAME);
    }
}
