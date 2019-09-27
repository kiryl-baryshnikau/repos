import { Injectable } from '@angular/core';

import { DispensingDataTransformationService } from '../../../services/mvd-dispensing-data-transformation-service'
import { ResourceService } from 'container-framework';

@Injectable()
export class DoseRequestDetailTransformationService {

    maskData: boolean = false;

    constructor(private dispensingTransformationService: DispensingDataTransformationService,
        private resourceService: ResourceService) {

    }
    
    transform(data: any) {
        data.forEach(d => {
            //Insure compatibility with older version.
            d.medDisplayInfo = d.medDisplayInfo || { displayName: d.medDisplayName || "" };

            //Handle "not in formulary" item and EACH token
            if (!d.medDisplayInfo.genericName && !d.medDisplayInfo.orderGiveDescription) {
                d.medDisplayInfo.displayName = this.resourceService.resource('seeMedicalRecord');
            }
            else if (!d.medDisplayInfo.genericName) {
                d.medDisplayInfo.displayName = d.medDisplayInfo.orderGiveDescription;
            }
            else if (!d.medDisplayInfo.displayName) {
                d.medDisplayInfo.displayName = d.medDisplayInfo.genericName;
            }
            else {
                d.medDisplayInfo.displayName = d.medDisplayInfo.displayName.replace("EACH", this.resourceService.resource('eachUpperCase'));
            }
            d.medDisplayName = d.medDisplayInfo.displayName;
        });

        let items = this.dispensingTransformationService.processDoseRequestData(data);
        items = items.sort((item1, item2) => {
            if (item1.careUnit > item2.careUnit)
                return 1;
            if (item1.careUnit < item2.careUnit)
                return -1;
            return 0;
        });
        return items;
    }

    transformDetails(items: any[]) {
        items.forEach((item: any) => {
            item.patientInfoFormatted = this.dispensingTransformationService.formatPatientInfo(item, this.maskData);
            item.nameFormatted = this.getNameFormat(item);
            item.requestedBy = 
            item.durationDisplayFormatted = this.dispensingTransformationService.getDurationDisplay(item.requestDuration);
            item.trackingStatusFormatted = this.dispensingTransformationService.formatTrackingStatus(item);
            item.orderStatusFomratted = this.dispensingTransformationService.formatOrderStatus(item);
            item.location = this.formatLocation(item);
            item.requestedBy = this.formatRequestedBy(item);
        });
        return items;
    }

    formatLocation(item) {
        if (item) {
            return item.patientUnitName + item.patientRoomName + item.patientBedId;
        }
    }

    getNameFormat(item) {
        let displayName = '';
        let displayNameFormat = '';
        if (!item.requestorFirstName) {
            displayName = item.requestorLastName;
        }
        else if (!this.resourceService.resource('userNameFormat')) {
            displayName = item.requestorLastName;
        }
        else {
            displayNameFormat = this.resourceService.resource('userNameFormat').replace("{{LastName}}", item.requestorLastName);
            displayNameFormat = displayNameFormat.replace("{{FirstName}}", item.requestorFirstName);
            displayName = displayNameFormat;
        }
        return displayName;
    }

    formatRequestedBy(item) {
        return item.requestorLastName + item.requestorFirstName;
    }
}
