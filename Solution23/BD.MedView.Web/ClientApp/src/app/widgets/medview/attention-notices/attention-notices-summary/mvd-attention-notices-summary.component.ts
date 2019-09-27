import { Component, Input, Output, OnDestroy, OnInit, EventEmitter, ViewChild } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { ResourceService, MainContainerComponent } from 'container-framework';
import { MvdListPrioritiesComponent } from '../../../shared/list-component/mvd-list-priorities.component'

import * as models from '../../../shared/mvd-models';
import { MvdConstants } from '../../../shared/mvd-constants';

@Component({
    selector: 'mvd-attention-notices-summary',
    templateUrl: './mvd-attention-notices-summary.component.html',
    styleUrls: ['./mvd-attention-notices-summary.component.scss']
})
export class AttentionNoticesSummaryComponent implements OnDestroy, OnInit {

    public iconClassCallback: Function;
    public borderClassCallback: Function;

    @ViewChild('critical') criticalTable: MvdListPrioritiesComponent;
    @ViewChild('nonCritical') nonCriticalTable: MvdListPrioritiesComponent;


    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;
    @Input() selectedItem: models.MvdListElement;
    @Input() mainContainer: MainContainerComponent;
    @Input() emitDrillDownEvent = true;
    @Input() isDetailView = false;
    @Input() isExtendedView = false;

    @Output() onItemSelectionChanged = new EventEmitter();

    criticalData: models.MvdListData;
    nonCriticalData: models.MvdListData;
    myResources;

    private eventBusStateChanged$: Subscription;
    private autoRefresh: string;
    private manualRefresh: string;
    private userPreferences;
    private innerClick = false;
    private attentionNoticesWidgetName = MvdConstants.ATTENTIONNOTICES_WIDGET_KEY;
    private attentionNoticeCriticalThresholdDuration = 90; // minutes

    private setResources() {
        this.myResources = {
            criticalText: this.resourcesService.resource('critical'),
            nonCriticalText: this.resourcesService.resource('nonCritical')
        };
    }

    constructor(
        private resourcesService: ResourceService) {
        this.setResources();
        this.iconClassCallback = this.getIconClass.bind(this);
        this.borderClassCallback = this.getBorderClass.bind(this);
    }

    ngOnInit() {
    }

    private getIconClass(item: models.MvdListElement) {
        let cssClass = 'fa';

        switch (item.priority) {
            case 'H':
                cssClass += ' fa-stop fa-rotate-45';
                cssClass += item.blinkingRow && !this.isDetailView ? ' blinkingIconHighPriority' : '';
                break;
            case 'M':
                cssClass += ' fa-play fa-rotate-270';
                cssClass += item.blinkingRow && !this.isDetailView ? ' blinkingIconMediumPriority' : '';
                break;
            case 'L':
                cssClass += ' fa-stop';
                cssClass += item.blinkingRow && !this.isDetailView ? ' blinkingIconLowPriority' : '';
                break;
            default:
                cssClass += ' fa-circle';
                cssClass += item.blinkingRow && !this.isDetailView ? ' blinkingIconNormalPriority' : '';
                break;
        }

        return cssClass;
    }

    initializeComponent(criticalData: models.MvdListData, nonCriticalData: models.MvdListData, isExtendedView: boolean) {
        this.criticalData = criticalData;
        this.nonCriticalData = nonCriticalData;
        this.isExtendedView = isExtendedView;
    }

    setSelectedItem(item: any) {
        if (this.nonCriticalTable && this.criticalTable) {
            if (!this.isExtendedView) {
                this.criticalTable.setSelectedItem(item);
            }
            this.nonCriticalTable.setSelectedItem(item);
        }
    }

    private getBorderClass(item: models.MvdListElement) {
        let cssClass = 'leftBorder';

        switch (item.priority) {
            case 'H':
                cssClass += ' highPriorityBorder';
                break;
            case 'M':
                cssClass += ' mediumPriorityBorder';
                break;
            case 'L':
                cssClass += ' lowPriorityBorder';
                break;
            default:
                cssClass += ' normalPriorityBorder';
                break;
        }

        return cssClass;
    }

    onElementClick(event: any) {
        this.setSelectedItem(event);
        this.innerClick = true;
        this.selectedItem = event;
        this.onItemSelectionChanged.emit(event);

    }

    ngOnDestroy() {
    }
}
