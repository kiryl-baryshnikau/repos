import { Component, Output, EventEmitter, ViewChild } from '@angular/core';

import { Observable } from 'rxjs';

import { ResourceService } from 'container-framework';

import * as models from '../../../shared/mvd-models';

@Component({
    selector: 'medview-disabledatasource-modal',
    templateUrl: './mvd-disabledatasource-dialog.component.html',
    styleUrls: ['./mvd-disabledatasource-dialog.component.scss']
})
export class DisableDatasourceModalComponent {

    dataSources: any[];
    myResources: any;
    currentStep = 0;

    @Output() onCancelDialog = new EventEmitter();
    @Output() onDelete = new EventEmitter();

    private setResources() {
        this.myResources = {
            disableDataSourceTitle: this.resourceService.resource('disableDataSourceTitle'),
            disableDataSourceText: this.resourceService.resource('disableDataSourceText'),
            confirmDelete: this.resourceService.resource('areYouSure'),
            cannotUndone: this.resourceService.resource('actionCannotBeUndone'),
            yesBtn: this.resourceService.resource('yes'),
            noBtn: this.resourceService.resource('no'),
        };
    }

    constructor(private resourceService: ResourceService) {
        this.setResources();
    }

    initializeForm(dataSources: any[]) {
        if (dataSources) {
            this.dataSources = dataSources;
        }
    }

    onFirstConfirmDeletion() {
        this.currentStep = 1;
    }

    onCancelClick(dataSources: any) {
        this.onCancelDialog.emit(dataSources);
    }

    onConfirmDeletion(dataSources: any) {
        this.onDelete.emit(dataSources);
    }
}
