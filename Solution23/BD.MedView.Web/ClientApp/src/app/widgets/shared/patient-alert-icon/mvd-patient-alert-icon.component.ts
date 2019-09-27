import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MedMinedModels as mmModel } from '../medmined-models';
import { ResourceService } from 'container-framework';

@Component({
    selector: 'mvd-patient-alert-icon',
    templateUrl: './mvd-patient-alert-icon.component.html',
    styleUrls: ['./mvd-patient-alert-icon.component.scss']
})
export class PatientAlertIconComponent implements OnInit {

    private _patientAlerts: mmModel.MedMinedAlertHeader[] = [];

    alertNames: string[] = [];
    alertsNumber = 0;
    imgUrl = './dist/assets/images/dialog_system_alert.png';
    imgUrlOn = './dist/assets/images/dialog_system_alert_blue.png';
    imgUrlOut = './dist/assets/images/dialog_system_alert.png';
    resources: any;

    @Input() set patientAlerts(patientAlerts: mmModel.MedMinedAlertHeader[]) {
        this._patientAlerts = patientAlerts && patientAlerts.length ?
            patientAlerts : [];
        this.alertsNumber = this._patientAlerts.length;
        if (this.alertsNumber) {
            this.alertNames = this.mapAlertNames(this._patientAlerts);
        }
    }
    get patientAlerts(): mmModel.MedMinedAlertHeader[] {
        return this._patientAlerts;
    }

    @Output() alertClick: EventEmitter<mmModel.MedMinedAlertHeader[]> = new EventEmitter<mmModel.MedMinedAlertHeader[]>();
    @Output() mouseClick: EventEmitter<Event> = new EventEmitter<Event>();

    constructor(private resourcesService: ResourceService) {
    }

    ngOnInit() {
        this.resources = this.getResources();
    }

    onClick(event: Event) {
        this.mouseClick.emit(event);
        this.alertClick.emit(this.patientAlerts);
    }

    setMouseOverImage() {
        this.imgUrl = this.imgUrlOn;
    }

    setMouseOutImage() {
        this.imgUrl = this.imgUrlOut;
    }

    private mapAlertNames(patientAlerts: mmModel.MedMinedAlertHeader[]): string[] {
        const alertTitleArray = patientAlerts.map((alert) => alert.alertTitle);        
        return alertTitleArray.filter((value, index, self) => {
            return self.indexOf(value) === index;
        });
    }

    private getResources() {
        return {
            clickHelpWordings: this.resourcesService.resource('clickHelpWordings'),
        };
    }
}
