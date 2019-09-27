import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { ContextConstants, ContextService, EventBusService, GatewayService, ResourceService } from 'container-framework';

import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { DispensingDataTransformationService } from '../../../services/mvd-dispensing-data-transformation-service';
import { AttentionNoticesTransformationService } from '../shared/mvd-attention-notices-transformation.service';
import { AttentionNoticesDataTableComponent } from './mvd-attention-notices-datatable.component';
import { DashboardHeaderService } from '../../../services/mvd-dashboard-header.service';

import * as models from '../../../shared/mvd-models';
import * as _ from 'lodash';

@Component({
    selector: 'mvd-attention-notices-detail',
    templateUrl: './mvd-attention-notices-detail.component.html',
    styleUrls: ['./mvd-attention-notices-detail.component.scss']
})
export class AttentionNoticesDetailComponent implements OnDestroy, OnInit {

    constructor(private contextService: ContextService,
        private dataService: GatewayService,
        private eventBus: EventBusService,
        private userConfigurationService: UserConfigurationService,
        private resourcesService: ResourceService,
        private transformationService: AttentionNoticesTransformationService,
        private dispensingTransformationService: DispensingDataTransformationService,
        private headerService: DashboardHeaderService) {
        this.resources = this.getResources();
    }

    public static ComponentName = 'mvdAttentionNoticesDetail';
    selectedItem: models.MvdListElement;
    private contextServiceSubscribe: Subscription;
    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;

    resources: any;

    @ViewChild(AttentionNoticesDataTableComponent) childComponent: AttentionNoticesDataTableComponent;

    onItemSelectionChanged(event: any) {
        this.selectedItem = event;
        this.childComponent.changeSelectedType(event);
    }

    ngOnInit() {
        this.headerService.cleanHeader(this.appCode);
        this.userConfigurationService.getCurrentConfig().subscribe((userConfig) => {
            this.headerService.updateHeader(this.appCode, userConfig);
        });
        this.contextServiceSubscribe = this.contextService.getContext(this.appCode).subscribe((response: any) => {
            const detailViewInfo = response.get(ContextConstants.DETAIL_VIEW_PAYLOAD);
            if (detailViewInfo) {
                this.selectedItem = detailViewInfo;
                console.log(this.selectedItem);
                this.childComponent.changeSelectedType(this.selectedItem);
            }
        });
    }

    getResources(): any {
        return {
            attentionNoticesExportFileName: this.resourcesService.resource('attentionNoticesExportFileName')
        };
    }

    /**
     * This function exports current iv status grid into selected (csv) file format.
     * In case of any filter applied to the current gird, it would be reflected in the export as well.
     * This event subscribed from toolbar export click event.
     *
     * @param event
     * @returns {void}
     */
    onExportButtonClicked(event: any[]): void {
        const options = {};
        let tempTable = _.cloneDeep(this.childComponent.dataTable);
        
        const requestDurationColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('noticeDuration');

        if (requestDurationColumnIndex != -1) {
            tempTable.columns[requestDurationColumnIndex].field = 'noticeDurationDisplay';
        }

        const noticeStartUtcDateTimeDisplayColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('noticeStartUtcDateTime');

        if (noticeStartUtcDateTimeDisplayColumnIndex != -1) {
            tempTable.columns[noticeStartUtcDateTimeDisplayColumnIndex].field = 'noticeStartUtcDateTimeDisplay';
        }

        const eventDurationDisplayColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('eventDuration');

        if (eventDurationDisplayColumnIndex != -1) {
            tempTable.columns[eventDurationDisplayColumnIndex].field = 'eventDurationDisplay';
        }

        const eventStartUtcDateTimeDisplayColumnIndex = tempTable.columns.map((col) => {
            return col.field;
        }).indexOf('eventStartUtcDateTime');

        if (eventStartUtcDateTimeDisplayColumnIndex != -1) {
            tempTable.columns[eventStartUtcDateTimeDisplayColumnIndex].field = 'eventStartUtcDateTimeDisplay';
        }

        tempTable.exportFilename = this.resources.attentionNoticesExportFileName;
        tempTable.exportCSV(options);
    }

    ngOnDestroy() {
        this.contextServiceSubscribe.unsubscribe();
    }
}
