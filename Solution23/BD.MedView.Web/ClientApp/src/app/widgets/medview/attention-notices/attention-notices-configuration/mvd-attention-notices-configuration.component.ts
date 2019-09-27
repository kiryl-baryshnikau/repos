import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EventBusService, GatewayService, ResourceService } from 'container-framework';
import { Subscription } from 'rxjs';

import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { SortingService } from '../../../services/mvd-sorting-service';
import { MvdConstants } from '../../../shared/mvd-constants';

@Component({
    selector: 'mvd-attention-notices-configuration',
    templateUrl: './mvd-attention-notices-configuration.component.html',
    styleUrls: ['./mvd-attention-notices-configuration.component.scss']
})
export class AttentionNoticesConfiguration implements OnInit {
    public static ComponentName = 'mvdAttentionNoticesConfigurationComponent';

    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    @Output() onCloseDialog = new EventEmitter<any>();

    displayData: any;
    resources: any = {
        off: this.resourcesService.resource('off'),
        critical: this.resourcesService.resource('critical'),
        nonCritical: this.resourcesService.resource('nonCritical'),
        configurationTitle: this.resourcesService.resource('attentionNoticeSettings'),
        cancel: this.resourcesService.resource('cancel'),
        apply: this.resourcesService.resource('apply')
    };

    private selectedValue: any;
    private eventBusStateChanged: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;
    private attentionNoticesWidgetName = MvdConstants.ATTENTIONNOTICES_WIDGET_KEY;
    private attentionNoticesTypes: any;
    private attentionNoticesConfiguration: any;
    private userPreferences: any = [];

    constructor(private userConfigurationService: UserConfigurationService,
        private dataService: GatewayService,
        private eventBus: EventBusService,
        private resourcesService: ResourceService,
        private sortingService: SortingService) {
    }

    ngOnInit() {
        console.log(`AttentionNoticesConfigurationComponent: appCode  = ${this.appCode} widgetId = ${this.widgetId} user = ${this.user}`);
        this.autoRefresh = this.eventBus.subcribeRequestAutoRefresh(this.appCode, this.widgetId);
        this.manualRefresh = this.eventBus.subcribeRequestManualRefresh(this.appCode, this.widgetId);
    }

    loadData() {
        this.dataService.loadData([this.createRequest()])
            .subscribe((responses: any[]) => {
                const response = responses[0] || [];
                this.userConfigurationService.getCurrentConfig().subscribe((configuration: any) => {
                    this.userPreferences = configuration;
                    const widgets = configuration.userPreferences.generalSettings || [];

                    const attentionNoticesWidget =
                        widgets.find((widget) => widget.id === this.attentionNoticesWidgetName);

                    if (attentionNoticesWidget && attentionNoticesWidget.configuration &&
                        attentionNoticesWidget.configuration.noticeTypes) {
                        this.attentionNoticesConfiguration = [...attentionNoticesWidget.configuration.noticeTypes];
                    }
                    console.log(`AttentionNoticesConfigurationComponent: after service response data :`, response);

                    this.attentionNoticesTypes = [];
                    if (response.body && response.body.length > 0) {
                        this.attentionNoticesTypes = response.body;
                        this.mapDisplayData(this.attentionNoticesTypes);
                        this.eventBus.emitLoadDataSuccess(this.appCode, this.widgetId);
                    } else {
                        this.eventBus.emitNoDataAvailable(this.appCode, this.widgetId);
                    }
                }, (error: any) => this.handleError(error));
            }, (error: any) => this.handleError(error));
    }

    private handleError(error: any) {
        console.log(`AttentionNoticesConfigurationComponent: Data Load Failed: ${error}`);
        this.eventBus.emitLoadDataFail(this.appCode, this.widgetId);
    }

    private createRequest() {
        const request = {
            appCode: this.appCode,
            widgetId: this.widgetId,
            api: 'attentionNoticeTypes',
            rawData: ''
        };
        return request;
    }

    private mapDisplayData(data: any) {
        const noLocked = this.sortingService
        .sortData('noticeTypeDescription', 1, 'alphabetical', data.filter(item => !item.locked).map((item: any) => {
            return {
                noticeTypeDescription: item.noticeTypeDescription,
                noticeTypeInternalCode: item.noticeTypeInternalCode,
                currentValue: this.getCurrentSelectedValue(item),
                locked: false
            };
        }));
        const locked = this.sortingService
        .sortData('noticeTypeDescription', 1, 'alphabetical', data.filter(item => item.locked).map((item: any) => {
            return {
                noticeTypeDescription: item.noticeTypeDescription,
                noticeTypeInternalCode: item.noticeTypeInternalCode,
                currentValue: 1,
                locked: true
            };
        }));
        this.displayData = [...noLocked, ...locked];
    }

    private getCurrentSelectedValue(item: any) {
        let selectedValue = 2;
        if (this.attentionNoticesConfiguration) {
            const currentSetting =
                this.attentionNoticesConfiguration.filter((a) => a.noticeTypeInternalCode ===
                    item.noticeTypeInternalCode);
            if (currentSetting && currentSetting.length > 0 && !currentSetting.off) {
                const current = currentSetting[0];
                selectedValue = !current.include ? 0 : (current.critical ? 1 : 2);
            } else {
                selectedValue = 0;
            }
        }
        return selectedValue;
    }

    onCancelDialog() {
        this.onCloseDialog.emit();
    }

    applyConfiguration() {
        if (this.displayData && this.displayData.length > 0) {
            this.attentionNoticesConfiguration = this.displayData.filter((item) => !item.locked).map((item) => {
                return {
                    noticeTypeInternalCode: item.noticeTypeInternalCode,
                    noticeTypeDescription: item.noticeTypeDescription,
                    locked: false,
                    off: item.currentValue == '0',
                    include: item.currentValue != '0',
                    critical: item.currentValue == '1'
                };
            });
            if (!this.attentionNoticesConfiguration) {
                this.attentionNoticesConfiguration = [];
            }
            const widgets = this.userPreferences.userPreferences.generalSettings || [];
            const attentionNoticesWidget =
                widgets.findIndex((widget) => widget.id === this.attentionNoticesWidgetName);
            if (attentionNoticesWidget >= 0) {
                this.userPreferences.userPreferences.generalSettings[attentionNoticesWidget] = {
                    id: this.attentionNoticesWidgetName,
                    configuration: {
                        noticeTypes: this.attentionNoticesConfiguration
                    }
                };
            } else {
                this.userPreferences.userPreferences.generalSettings.push({
                    id: this.attentionNoticesWidgetName,
                    configuration: {
                        noticeTypes: this.attentionNoticesConfiguration
                    }
                });
            }
        }
        this.onCloseDialog.emit(this.userPreferences.userPreferences);
    }
}
