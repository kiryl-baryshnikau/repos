import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { GatewayService, ResourceService } from 'container-framework';
import { SelectItem } from 'primeng/primeng';
import { Observable, forkJoin, timer, Subscription } from 'rxjs';

import { SortingService } from '../../../services/mvd-sorting-service';
import { MvdConstants } from '../../../shared/mvd-constants';
import { SystemAdminConfigurationService } from '../medview-system-admin/system-admin-configuration.service';

@Component({
    selector: 'iv-status-configuration',
    templateUrl: './mvd-iv-status-configuration.component.html',
    styleUrls: [ './mvd-iv-status-configuration.component.scss' ]
})
export class IVStatusConfigurationComponent implements OnDestroy {

    @Input() appCode: string;
    @Input() widgetId: string;

    @Output() onCloseDialog = new EventEmitter<any>();

    private ivStatusWidgetName: string = MvdConstants.IVSTATUS_WIDGET_KEY;
    ivStatusConfiguration: any;
    private allInfusions: any[];

    infusionDataObservable$: Observable<any>;
    globalPreferencesObservable$: Observable<any>;
    infusionDataSubscription$: Subscription;

    infusionsAvailables: SelectItem[] = [];
    infusionsToShow: SelectItem[] = [];

    userPreferences: any;

    resources: any;


    constructor(private resourceService: ResourceService,
        private dataService: GatewayService,
        private sortingService: SortingService,
        private globalPreferences: SystemAdminConfigurationService) {
        this.setResources();
    }

    loadData(userPreferences: any) {
        this.infusionDataObservable$ = this.dataService.loadData([this.createRequest([])]);
        this.globalPreferencesObservable$ = this.globalPreferences.getGlobalPreferences();
        this.infusionDataSubscription$ = forkJoin([
            this.infusionDataObservable$,
            this.globalPreferencesObservable$
        ])
            .subscribe(([infusionsResponse, globalPreferencesResponse]) => {
                if (infusionsResponse) {
                    let excludedInfusions = [];
                    if (globalPreferencesResponse) {
                        excludedInfusions = globalPreferencesResponse.excludedInfusions || [];
                    }
                    this.allInfusions = infusionsResponse[0].filter(a => excludedInfusions.findIndex(b => b.name === a.name) < 0);
                    this.userPreferences = userPreferences;
                    const widgets = this.userPreferences.generalSettings || [];
                    const ivStatusWidget =
                        widgets.find((widget) => widget.id === this.ivStatusWidgetName);

                    if (!ivStatusWidget) {
                        this.ivStatusConfiguration = this.getWidgetDefaultConfiguration(this.allInfusions);
                    } else {
                        const configuration = ivStatusWidget.configuration || this.getWidgetDefaultConfiguration(this.allInfusions);
                        this.ivStatusConfiguration = {
                            showPatientIds: configuration.showPatientIds,
                            showPatientNames: configuration.showPatientNames,
                            infusionsToShow: configuration.infusionsToShow ?
                                configuration.infusionsToShow.filter(a => excludedInfusions.findIndex(b => b.name === a) < 0)
                                : this.getWidgetDefaultConfiguration(this.allInfusions).infusionsToShow
                        };
                    }

                    this.infusionsToShow = this.transformTargetList(this.ivStatusConfiguration.infusionsToShow);
                    this.infusionsAvailables = this.transformSourceList(this.allInfusions, this.infusionsToShow);
                }
            });
    }

    ngOnDestroy() {
        this.infusionDataSubscription$.unsubscribe();
    }

    onSourceToTarget(event: any) {
        event.forEach(item => this.infusionsToShow.push({ label: item, value: item }));
        this.infusionsToShow = this.sortingService.sortArrayObjectByField('label', this.infusionsToShow);
        this.infusionsAvailables = this.transformSourceList(this.allInfusions, this.infusionsToShow);
    }

    onAllSourceToTarget() {
        this.infusionsAvailables.forEach(item => this.infusionsToShow.push(item));
        this.infusionsToShow = this.sortingService.sortArrayObjectByField('label', this.infusionsToShow);
        this.infusionsAvailables = [];
    }

    onTargetToSource(event: any) {
        event.forEach(item => {
            const index = this.infusionsToShow.findIndex(a => a.label === item);
            this.infusionsToShow.splice(index, 1);
        });
        this.infusionsAvailables = this.transformSourceList(this.allInfusions, this.infusionsToShow);
    }

    onAllTargetToSource() {
        this.infusionsToShow = [];
        this.infusionsAvailables = this.transformSourceList(this.allInfusions, this.infusionsToShow);
    }

    onCancelDialog() {
        this.onCloseDialog.emit({ name: 'CANCEL', data: null });
    }

    applyConfiguration() {
        this.ivStatusConfiguration.infusionsToShow = this.infusionsAvailables.length > 0 ? this.infusionsToShow.map(a => a.label) : null;
        this.onCloseDialog.emit({ name: 'APPLY', data: this.ivStatusConfiguration, userPreferences: this.userPreferences });
    }

    private getWidgetDefaultConfiguration(infusionsAvailables: any[]) {
        let infusionsToShow = [];
        if (infusionsAvailables) {
            infusionsToShow = infusionsAvailables.reduce((arrayResume, item) => {
                if (arrayResume.findIndex(a => a === item.name) < 0) {
                    arrayResume.push(item.name);
                }
                return arrayResume;
            }, []);
        }
        return { showPatientIds: true, showPatientNames: true, infusionsToShow: infusionsToShow };
    }

    private setResources() {
        this.resources = {
            ivStatusSettingsTitle: this.resourceService.resource('ivStatusSettingsTitle'),
            cancel: this.resourceService.resource('cancel'),
            apply: this.resourceService.resource('apply'),
            infusionShowHideList: this.resourceService.resource('infusionShowHideList'),
            show: this.resourceService.resource('show'),
            hide: this.resourceService.resource('hide'),
            instructionsShowHideList: this.resourceService.resource('instructionsShowHideList'),
            showPatientIds: this.resourceService.resource('showPatientIds'),
            showPatientNames: this.resourceService.resource('showPatientNames')
        };
    }

    private createRequest(params: any) {
        return {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'infusiondrugs',
            rawData: params
        };
    }

    private transformSourceList(inputData: any, dataexclude: any) {
        let data = [];
        if (inputData) {
            const infusions = inputData.reduce(function (arrayResume, item) {
                if (!dataexclude || !dataexclude.some(a => a.value == item.name)) {
                    if (arrayResume.indexOf(item.name) == -1) {
                        arrayResume.push(item.name);
                    }
                }
                return arrayResume;
            }, []);
            data = this.sortingService.sortArray(infusions).map(a => (
                {
                    label: a,
                    value: a
                }
            ));
        }
        return data;
    }

    private transformTargetList(inputData: any[]) {
        const data = [];
        if (inputData) {
            return this.sortingService.sortArray(inputData).map(item => {
                return {
                    label: item,
                    value: item
                };
            });
        }
        return data;
    }

    onShowPatientsIdChange(event) {
        if (!event) {
            if (!this.ivStatusConfiguration.showPatientNames) {
                timer(0).subscribe(t => this.ivStatusConfiguration.showPatientIds = true);
            }
        }
    }

    onShowPatientsNamesChange(event) {
        if (!event) {
            if (!this.ivStatusConfiguration.showPatientIds) {
                timer(0).subscribe(t => this.ivStatusConfiguration.showPatientNames = true);
            }
        }
    }
}
