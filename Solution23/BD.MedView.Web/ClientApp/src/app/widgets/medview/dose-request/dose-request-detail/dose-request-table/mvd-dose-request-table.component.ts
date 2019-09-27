import { Component, Input, DoCheck, ViewChild, OnInit } from '@angular/core';
import { SortingService } from '../../../../services/mvd-sorting-service';
import { DoseRequestDetailConfigurationService } from '../../shared/mvd-dose-request-detail-configuration.service'
import { DataTable, SharedModule } from 'primeng/primeng';

import { ResourceService } from 'container-framework';
import { Observable, timer } from 'rxjs';

@Component({
    selector: 'mvd-dose-request-table',
    templateUrl: './mvd-dose-request-table.component.html',
    styleUrls: ['./mvd-dose-request-table.component.scss']
})
export class DoseRequestTableComponent implements OnInit {

    @Input() columns: any[] = [];
    @Input() data: any[];
    @Input() selectedItem: any;
    @ViewChild('dt') dataTable: DataTable;

    isAutomaticOnPageEvent = false;
    resources: any;

    constructor(private resourcesService: ResourceService,
        private sortingService: SortingService,
        private configurationService: DoseRequestDetailConfigurationService) {
        this.resources = this.getResources();
    }

    ngOnInit() {
        this.checkDimensions(false);
    }

    sortData(event: any, sortingMethod: any) {
        this.isAutomaticOnPageEvent = true;
        this.data = [...this.sortingService
            .sortData(event.field, event.order, sortingMethod, this.data)];
        this.checkDimensions(true);
    }

    onSort(event) {
        this.configurationService.setWidgetOptions({ sorting: event });
        let userConfiguration = this.configurationService.getConfiguration();
        if (userConfiguration.options.pagination) {
            this.setPageFromConfiguration(userConfiguration.options.pagination);
        }
        this.checkDimensions(true);
    }
    setPageFromConfiguration(configuration: any) {
        let config = this.getPaginatorConfiguration(configuration);
        this.isAutomaticOnPageEvent = (this.dataTable.rows !== config.rows || this.dataTable.first !== config.first);
        if (this.isAutomaticOnPageEvent) {
            this.dataTable.rows = config.rows;
            this.dataTable.first = config.first;
            this.configurationService.setWidgetOptions({ pagination: { rows: config.rows, first: config.first } });
        }
        this.checkDimensions(true);
    }
    getPaginatorConfiguration(configuration: any) {
        let pagingConfig = { first: 0, rows: this.dataTable.rows };
        let pageExists = configuration.first < this.dataTable.totalRecords;
        if (pageExists) {
            pagingConfig = configuration;
        }
        this.checkDimensions(true);
        return pagingConfig;
    }
    recoverTableState(userSettings: any) {
        this.setSortingFromConfiguration(userSettings);
        this.isAutomaticOnPageEvent = true;
        this.updateSortOptions({
            field: userSettings.options.sorting.field,
            order: userSettings.options.sorting.order
        });
        setTimeout(() => {
            let userConfiguration = this.configurationService.getConfiguration();
            if (userConfiguration.options.pagination) {
                this.setPageFromConfiguration(userConfiguration.options.pagination);
            }
        }, 0);
    }
    updateSortOptions(event: any) {
        if (event) {
            this.dataTable.sortField = event.field;
            this.dataTable.sortOrder = event.order;
        }
        this.checkDimensions(true);
    }

    setSortingFromConfiguration(userSettings: any) {
        let columnConfig = userSettings.columns.find((column: any) => column.field === userSettings.options.sorting.field);
        let sortingMethod = columnConfig ? columnConfig.sortOptions.method : "alphabetical";
        if (this.data && this.data.length) {
            this.data = [...this.sortingService
                .sortData(userSettings.options.sorting.field,
                    userSettings.options.sorting.order, sortingMethod, this.data)];
        }
        this.checkDimensions(true);
    }

    onPage(event) {
        if (!this.isAutomaticOnPageEvent) {
            this.configurationService.setWidgetOptions({ pagination: event });
        }
        this.isAutomaticOnPageEvent = false;
        this.checkDimensions(true);
    }

    ngAfterViewChecked() {
        this.isAutomaticOnPageEvent = false;
    }

    getResources() {
        return {
            columnDataRoom: this.resourcesService.resource('columnDataRoom'),
            columnDataUnit: this.resourcesService.resource('columnDataUnit'),
            columnDataBed: this.resourcesService.resource('columnDataBed'),
            noRecordsFound: this.resourcesService.resource('noRecordsFound')
        };
    }

    private checkDimensions(setAuto: boolean) {
        let element = this.dataTable as any;
        timer(0).subscribe(t => {
            try {
                let parentDiv = element.el.nativeElement.querySelector(".ui-datatable-tablewrapper");
                let widgetContainer = element.el.nativeElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

                let table = parentDiv.children[0];

                if (setAuto) {
                    parentDiv.style.width = "auto";
                    if (table.offsetWidth > widgetContainer.offsetWidth) {
                        parentDiv.style.width = `${table.offsetWidth + 24}px`;
                    } else {
                        parentDiv.style.paddingRight = "0px";
                    }
                }
                else {
                    parentDiv.style.width = `${table.offsetWidth + 24}px`;
                }
                parentDiv.style.paddingRight = "24px";
            }
            catch (ex) {

            }
        });

    }
}

