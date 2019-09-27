import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { GatewayService, ResourceService } from 'container-framework';
import { SelectItem } from 'primeng/primeng';
import { Observable, forkJoin, Subscription } from 'rxjs';

import { SortingService } from '../../../services/mvd-sorting-service';
import { MvdConstants } from '../../../shared/mvd-constants';
import { SystemAdminConfigurationService } from '../medview-system-admin/system-admin-configuration.service';

@Component({
    selector: 'continuous-infusions-configuration',
    templateUrl: './mvd-continuous-infusions-configuration.component.html',
    styleUrls: ['../iv-status-configuration/mvd-iv-status-configuration.component.scss']
})
export class ContinuousInfusionsConfigurationComponent implements OnDestroy {

    @Input() appCode: string;
    @Input() widgetId: string;

    @Output() onCloseDialog = new EventEmitter<any>();

    private continuousInfusionsWidgetName: string = MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY;
    continuousInfusionsConfiguration: any;
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
                    const continuousInfusionsWidget =
                        widgets.find((widget) => widget.id === this.continuousInfusionsWidgetName);

                    if (!continuousInfusionsWidget) {
                        this.continuousInfusionsConfiguration = this.getWidgetDefaultConfiguration(this.allInfusions);
                    } else {
                        const configuration = continuousInfusionsWidget.configuration ||
                            this.getWidgetDefaultConfiguration(this.allInfusions);

                        this.continuousInfusionsConfiguration = {
                            infusionsToShow: configuration.infusionsToShow ?
                                configuration.infusionsToShow.filter(a => excludedInfusions.findIndex(b => b.name === a) < 0)
                                : this.getWidgetDefaultConfiguration(this.allInfusions).infusionsToShow
                        };
                    }
                    this.infusionsToShow = this.transformTargetList(this.continuousInfusionsConfiguration.infusionsToShow);
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
        this.continuousInfusionsConfiguration.infusionsToShow = this.infusionsAvailables.length > 0 ?
            this.infusionsToShow.map(a => a.label) : null;
        this.onCloseDialog.emit({ name: 'APPLY', data: this.continuousInfusionsConfiguration });
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
        return { infusionsToShow: infusionsToShow };
    }

    private setResources() {
        this.resources = {
            continuousInfusionsSettingsTitle: this.resourceService.resource('continuousInfusionsSettingsTitle'),
            cancel: this.resourceService.resource('cancel'),
            apply: this.resourceService.resource('apply'),
            infusionShowHideList: this.resourceService.resource('infusionShowHideList'),
            show: this.resourceService.resource('show'),
            hide: this.resourceService.resource('hide'),
            instructionsShowHideList: this.resourceService.resource('instructionsShowHideList')
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
}
