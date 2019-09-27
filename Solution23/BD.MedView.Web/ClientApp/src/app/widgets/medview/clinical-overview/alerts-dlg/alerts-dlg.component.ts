import { Component, EventEmitter, Output } from '@angular/core';
import { ResourceService } from "container-framework";
import { SortingService } from '../../../services/mvd-sorting-service';
import * as _ from 'lodash';


@Component({
    selector: 'alerts-dlg',
    templateUrl: 'alerts-dlg.component.html',
    styleUrls: ['alerts-dlg.component.scss']
})
export class AlertsDlgComponent  {
    @Output() dlgApply = new EventEmitter<any>();
    @Output() dlgCancel= new EventEmitter<any>();

    readonly fieldTitleConst = 'title';
    readonly fieldCategoryConst = 'category';
    readonly ascOrderConst = 1;
    readonly sortingMethodConst = 'alphabetical';    

    loadingData = false;
    alertCategories: any;
    isApplyEnabled = false;
    private originalAlertCategories;

    resources = {
        clinicAlalertSettings: this.resourceService.resource('clinicAlalertSettings'),
        on: this.resourceService.resource('on'),
        off: this.resourceService.resource('off'),
        apply: this.resourceService.resource('apply'),
        cancel: this.resourceService.resource('cancel')
    }

    constructor(
        private resourceService: ResourceService,
        private sortingService: SortingService
    ) {
        this.loadingData = true;
    }
    
    apply(): void {
        this.dlgApply.emit(this.alertCategories);
    }

    cancel(): void {
        this.dlgCancel.emit();
    }

    setAlertsData(alertsData: any) {
        this.loadingData = false;

        this.alertCategories = this.sortingService.sortData('category', 1, 'alphabetical', alertsData);
        this.originalAlertCategories = _.cloneDeep(this.alertCategories);
    }

    turnOnCategoryAlerts(category: string) {
        let alerts = this.alertCategories.find(x => x.category == category).alerts;
        alerts = alerts.map(x => { x.status = '1'; });
        this.hasChange();
    }

    turnOffCategoryAlerts(category: string) {
        let alerts = this.alertCategories.find(x => x.category == category).alerts;
        alerts = alerts.map(x => { x.status = '0'; });
        this.hasChange();
    }

    hasChange() {
        this.alertCategories.some(x => {
            let originalAlertCategory = this.originalAlertCategories.find(y => y.category == x.category);

            x.alerts.some(y => {
                let originalAlert = originalAlertCategory.alerts.find(z => z.title == y.title);

                this.isApplyEnabled = originalAlert.status != y.status ? true : false;
                return this.isApplyEnabled;
            });

            return this.isApplyEnabled;
        });
    }
}
