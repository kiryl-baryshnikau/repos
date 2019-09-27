import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";

import { Observable, Subscription, timer } from "rxjs";
import { skipWhile } from 'rxjs/operators';

import { Store, select } from "@ngrx/store";
import { MvdListElement } from "../../../shared/mvd-models";
import { MedMinedModels } from "../../../shared/medmined-models";
import { AppState } from "../../../store";
import { ClinicalDashboardItemSelected } from "../../../store/clinical-dashboard/clinical-dashboard.actions";
import { selectCurrentItemSelected, selectItemSelectedFromSummary } from "../../../store/clinical-dashboard/clinical-dashboard.selectors";
import * as models from '../../../shared/mvd-models';
import { ResourceService } from "container-framework";
import { WindowRef } from '../../../services/windowref.service';

@Component({
    selector: 'clinical-overview-summary',
    templateUrl: './clinical-overview-summary.component.html',
    styleUrls: [ './clinical-overview-summary.component.scss' ]
})
export class ClinicalOverviewSummaryComponent implements OnInit, OnDestroy {
    @Input('summaryData')
    summaryData$: Observable<MedMinedModels.SummaryCategory[]>;

    @Input()
    selectedFilter: any;

    @Input()
    summaryWidget: boolean = false;

    @Input()
    appCode: string;

    @Input()
    widgetId: string;

    @Output()
    onElementClick = new EventEmitter();

    @Output() summaryExpandedCollapsed = new EventEmitter<MedMinedModels.SummaryCategory>();
    @Output() collapseAllClick = new EventEmitter();
    @Output() expandAllClick = new EventEmitter<MedMinedModels.SummaryCategory[]>();

    @ViewChild('accordionContainer') accordion: ElementRef;

    iconPriorityClassCallback: Function;

    itemSelectedSubscription: Subscription;
    summaryDataSubscription: Subscription;
    currentItemSelected: MvdListElement;
    displayHighPriority: boolean;
    displayPriority: boolean;
    allExpanded: boolean = true;
    itemSelectedFromSummaryWidget: boolean = false;
    userInteracted: boolean = false;

    activeIndex: number[];
    summaryData: MedMinedModels.SummaryCategory[];

    resources: any;

    constructor(private store: Store<AppState>,
        private resourcesService: ResourceService,
        private winRef: WindowRef
    ) {
        this.iconPriorityClassCallback = this.getPriorityIconClass;
    }

    ngOnInit() {
        this.setResources();

        this.itemSelectedSubscription = this.store.pipe(
            select(selectItemSelectedFromSummary),
            skipWhile(({ itemSelected }) => !itemSelected)
        ).subscribe(async ({ itemSelected, itemSelectedFromSummaryWidget }) => {
            this.currentItemSelected = await itemSelected;
            this.itemSelectedFromSummaryWidget = itemSelectedFromSummaryWidget;

            if (this.itemSelectedFromSummaryWidget) {
                setTimeout(() => {
                    let elementTab = this.winRef.nativeWindow.document.getElementById(this.currentItemSelected.key);
                    if (elementTab) {
                        elementTab.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }, 0);
            }
        });

        this.summaryDataSubscription = this.summaryData$.subscribe(data => {
            this.summaryData = data;
        }, () => {
            this.summaryData = [];
        });
    }

    ngOnDestroy() {
        this.itemSelectedSubscription.unsubscribe();
        this.summaryDataSubscription.unsubscribe();
    }

    getPriorityIconClass(item: MvdListElement) {
        switch (item.priority) {
            case 'S':
                return 'icon_alert_system';
            case 'H':
                return 'icon_alert_user_high';
            case 'M':
                return 'icon_alert_user_med';
            default:
                return 'icon_alert_user_low';
        }
    }

    itemSelectedChanged(itemSelected: any) {
        this.onElementClick.emit(itemSelected);
        this.store.dispatch(new ClinicalDashboardItemSelected({ itemSelected, fromSummary: this.summaryWidget }));
    }

    /**
     * Utility function to get total number alerts for the selected alert category
     *
     * @param summariesDataByCategory
     */
    getAlertCountByCategory(summariesDataByCategory: models.MvdListData) {
        // Default count is zero
        let alertCountByCategory = 0;

        if(summariesDataByCategory && summariesDataByCategory.data.length > 0) {
            summariesDataByCategory.data.forEach(item => {
                alertCountByCategory += item.counter.total;
            });
        }
        return alertCountByCategory;
    }


    collapseExpandAll() {
        if (this.summaryData) {
            if (this.allExpanded) {
                this.summaryData.forEach(t => {
                    t.selected = false;
                });
                this.allExpanded = false;
                this.collapseAllClick.emit();
            } else {
                this.summaryData.forEach(t => {
                    t.selected = true;
                });
                this.allExpanded = true;
                this.expandAllClick.emit(this.summaryData || []);
            }
        }
    }

    tabOpened(event) {
        if (this.summaryData && this.summaryData.length > 0) {
            this.summaryData[event.index].selected = true;
            this.summaryExpandedCollapsed.emit(this.summaryData[event.index]);
        }

        if (!this.allExpanded)
            this.allExpanded = true;
    }

    tabClosed(event) {
        if (this.summaryData && this.summaryData.length > 0) {
            this.summaryData[event.index].selected = false;
            this.summaryExpandedCollapsed.emit(this.summaryData[event.index]);
        }
        if (this.allExpanded)
            this.allExpanded = false;
    }

    private setResources() {
        this.resources = {
            expandAll: this.resourcesService.resource('expandAll'),
            colapseAll: this.resourcesService.resource('colapseAll'),
        }
    }
}
