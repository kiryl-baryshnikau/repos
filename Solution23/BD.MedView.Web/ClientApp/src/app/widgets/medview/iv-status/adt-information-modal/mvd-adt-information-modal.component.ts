import { Component, OnInit, Input } from '@angular/core';
import { ResourceService } from 'container-framework';

@Component({
    selector: 'mvd-adt-information-modal',
    templateUrl: './mvd-adt-information-modal.component.html',
    styleUrls: ['./mvd-adt-information-modal.component.scss']
})
export class MvdAdtInformationModalComponent implements OnInit {

    resources: any;
    adtInformationModel: any;
    modalRef: any;
    showPatientInfo = false;
    showPatientLocation = false;
    showDeviceInfo = false;

    constructor(private resourcesService: ResourceService) {
    }

    initializeComponent(adtInformation: any, modalRef: any, unknownPatientsEnabled: boolean) {
        this.adtInformationModel = this.transformToAdtViewModel(adtInformation, unknownPatientsEnabled);
        this.showAvailableSections(this.adtInformationModel);
        this.modalRef = modalRef;
    }

    ngOnInit() {
        this.resources = this.getResources();
    }

    private showAvailableSections(model) {
        this.showPatientInfo = model.patientIdentifier ||
            model.patientName ||
            model.dateOfBirth ||
            model.gender ||
            model.physician ||
            model.accountNumber ||
            model.admit ||
            model.discharge || false;
        this.showPatientLocation = model.facility ||
            model.unit ||
            model.floor ||
            model.room ||
            model.bed || false;
        this.showDeviceInfo = model.moduleModelNumber || model.moduleSerialNumber ||
                              model.pcuModelNumber || model.pcuSerialNumber ||
                              false;
    }
    
    private transformToAdtViewModel(adtInfo: any, allowUnknownsEnabled: boolean) {
        let patientId = (
            !adtInfo.adtPatientId && allowUnknownsEnabled
                ? (adtInfo.patientId && adtInfo.patientId !== 'Unknown'
                    ? `${adtInfo['patientIdUnmasked'] || adtInfo.patientId}`
                    : this.resources.unknown)
                : (adtInfo.adtPatientId || this.resources.unknown));
        

        return {
            patientIdentifier: patientId,
            patientName: adtInfo.unmaskedPatientName,
            dateOfBirth: adtInfo.dateOfBirth,
            gender: adtInfo.gender,
            physician: adtInfo.physician,
            accountNumber: adtInfo.accountNumber,
            admit: adtInfo.admitDate,
            discharge: adtInfo.dischargeDate,
            facility: adtInfo.masterFacility,
            unit: adtInfo.unit,
            floor: adtInfo.floor,
            room: adtInfo.room,
            bed: adtInfo.bed,
            pcuModelNumber: adtInfo.pcuModelNumber,
            pcuSerialNumber: adtInfo.pcuSerialNumber,
            moduleModelNumber: adtInfo.moduleModelNumber,
            moduleSerialNumber: adtInfo.moduleSerialNumber
        };
    }

    private getResources() {
        return {
            unknown: this.resourcesService.resource('unknown'),
            patientAndDeviceInformation: this.resourcesService.resource('patientAndDeviceInformation'),
            patientInformation: this.resourcesService.resource('patientInformation'),
            patientIdentifier: this.resourcesService.resource('patientIdentifier'),
            patientName: this.resourcesService.resource('patientName'),
            dateOfBirth: this.resourcesService.resource('dateOfBirth'),
            gender: this.resourcesService.resource('gender'),
            physician: this.resourcesService.resource('physician'),
            accountNumber: this.resourcesService.resource('accountNumber'),
            admit: this.resourcesService.resource('admit'),
            discharge: this.resourcesService.resource('discharge'),
            patientLocation: this.resourcesService.resource('patientLocation'),
            room: this.resourcesService.resource('room'),
            bed: this.resourcesService.resource('bed'),
            deviceInformation: this.resourcesService.resource('deviceInformation'),
            moduleModelNumber: this.resourcesService.resource('moduleModelNumber'),
            moduleSerialNumber: this.resourcesService.resource('moduleSerialNumber'),
            unit: this.resourcesService.resource('unit'),
            pcuModelNumber: this.resourcesService.resource('pcuModelNumber'),
            pcuSerialNumber: this.resourcesService.resource('pcuSerialNumber'),
            facility: this.resourcesService.resource('facility'),
            floor: this.resourcesService.resource('floor'),
            notApplicable: this.resourcesService.resource('notApplicable'),
            noDataAvailable: this.resourcesService.resource('noDataAvailable')
        };
    }
}
