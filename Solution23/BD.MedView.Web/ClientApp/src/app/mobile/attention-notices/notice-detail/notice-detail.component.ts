import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';

import { AttentionNoticeModel, SortDirection, AttentionNoticesConfiguration, SortItemClickEvent } from '../../shared/mvd-mobile-models';
import { MvdListElement, AttentionNoticeStatus } from '../../../widgets';
import { ResourceService } from 'container-framework';
import { AttentionNoticesDataService } from '../attention-notices-data.service';
import { AttentionNoticesMobileConfiguratonService } from '../attention-notices-configuration.service';

@Component({
    selector: 'mvd-notice-detail',
    templateUrl: './notice-detail.component.html',
    styleUrls: ['./notice-detail.component.scss']
})
export class NoticeDetailComponent implements OnInit, OnChanges {
    @Input() noticesDetails: AttentionNoticeModel[];
    @Input() selectedNotice: MvdListElement;
    @Input() lastUpdatedDate = '';
    @Input() lastUpdatedTime = '';

    @Output() statusChanged = new EventEmitter<MvdListElement>();
    @Output() backButtonClick = new EventEmitter<void>();

    noticesDetailsView: AttentionNoticeModel[];

    resources: any;
    noticeTittle: string;
    noticeCounter: number;
    isCritical: boolean;

    unAcknowledgeError = false;
    acknowledgeError = false;
    isLoading = false;

    sortItems: SortItemInfo[];
    private supportedSortingItems: SortItemInfo[];

    constructor(private resourcesService: ResourceService,
        private dataService: AttentionNoticesDataService,
        private configuratonService: AttentionNoticesMobileConfiguratonService) { }

    ngOnInit() {
        this.resources = this.getResources();
        this.configuratonService.ensureConfiguration();
        this.supportedSortingItems = this.getSupportedSortingItems();
        this.sortItems = this.getSortItems(this.noticesDetails);
        this.synchSorting();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (changes.selectedNotice) {
                const notice = changes.selectedNotice.currentValue as MvdListElement;
                if (!notice) {
                    return;
                }
                this.noticeTittle = notice.title || '';
                this.noticeCounter = notice.counter || 0;
                this.isCritical = notice.critical;

            }

            if (changes.noticesDetails && !changes.noticesDetails.firstChange) {
                this.sortItems = this.getSortItems(this.noticesDetails);
                this.synchSorting();
            }
        }
    }

    onSortItemClicked(sortItemClickEvent: SortItemClickEvent): void {
        this.clearSortDirections();

        const sortItem = this.sortItems.find(x => x.id === sortItemClickEvent.id);
        sortItem.sortDirection = this.getNextSortingDirection(sortItemClickEvent.sortDirection);
        this.configuratonService.saveSortingConfiguration(this.selectedNotice.key,
            { id: sortItemClickEvent.id, sortDirection: sortItem.sortDirection }
        );

        this.noticesDetailsView = this.sortData(sortItem, this.noticesDetails);
    }

    onRowClicked(detail: AttentionNoticeModel) {
        const selectedNotice = this.noticesDetailsView.find(x => x.key === detail.key);
        if (!selectedNotice || !this.noticesDetailsView.length) {
            return;
        }

        const currentValue = detail.isCollapsed;
        this.clearAll();
        detail.isCollapsed = !currentValue;
    }

    onNoticeAcknowledge(event, detail: AttentionNoticeModel) {

        event.stopPropagation();

        this.isLoading = true;

        this.dataService.acknowledgeNotice$(detail.key, detail.facilityKey)
            .pipe(take(1))
            .subscribe((response) => {

                if (response.alreadyChanged && response.status) {
                    const notice = response.status as AttentionNoticeStatus;
                    detail.status = notice.status;
                    detail.updatedBy = notice.updatedBy;
                    detail.updatedDateTime = notice.updatedDateTime;
                    detail.isAcknowledge = true;
                } else {
                    this.statusChanged.emit(this.selectedNotice);
                }
                console.log('succeed');
                this.isLoading = false;

            }, (error) => {
                this.acknowledgeError = true;
                this.isLoading = false;
            });

        console.log(event, detail);
    }

    onNoticeUnAcknowledge(event, detail: AttentionNoticeModel) {

        event.stopPropagation();
        this.isLoading = true;
        this.dataService.unacknowledgeNotice$(detail.id, detail.key, detail.facilityKey)
            .pipe(take(1))
            .subscribe((response) => {

                console.log('succeed');
                this.statusChanged.emit(this.selectedNotice);
                this.isLoading = false;

            }, (error) => {
                this.unAcknowledgeError = true;
                this.isLoading = false;
            });

        console.log(event, detail);
    }

    backButtonClicked() {
        this.backButtonClick.emit();
    }

    private clearAll() {
        this.noticesDetailsView.forEach((item: AttentionNoticeModel) => item.isCollapsed = true);
        this.acknowledgeError = false;
        this.unAcknowledgeError = false;
    }

    private getResources() {
        return {
            acknowledge: this.resourcesService.resource('acknowledgeMobile'),
            ok: this.resourcesService.resource('okButtonMobile'),
            unAcknowledge: this.resourcesService.resource('unAcknowledgeMobile'),
            acknowledgedBy: this.resourcesService.resource('acknowledgedByMobile'),
            errorMesssageAcknowledge: this.resourcesService.resource('errorMesssageAcknowledge'),
            errorMesssageUnAcknowledge: this.resourcesService.resource('errorMesssageUnAcknowledge'),
            at: this.resourcesService.resource('atMobile'),
            cancel: this.resourcesService.resource('cancel'),
            goBackTitle: this.resourcesService.resource('goBackTitle'),
            newItems: this.resourcesService.resource('newItems'),
            deletedItems: this.resourcesService.resource('deletedItems'),
            lastUpdatedOn: this.resourcesService.resource('lastUpdatedOn'),

            age: this.resourcesService.resource('age'),
            device: this.resourcesService.resource('device'),
            itemMobile: this.resourcesService.resource('itemMobile'),
            area: this.resourcesService.resource('area'),
        };
    }

    private getSortItems(data: AttentionNoticeModel[]): SortItemInfo[] {
        if (data && data.length > 0) {
            const sortItems = this.supportedSortingItems.filter(sortingItem =>
                sortingItem.fieldsInfo.some(fieldInfo => data[0].hasOwnProperty(fieldInfo.dataField))
            );
            return sortItems.reverse();
        }

        return [];
    }

    private synchSorting(): void {
        this.clearSortDirections();
        if (this.synchPreservedSorting()) {
            return;
        } else if (this.synchDefaultSorting()) {
            return;
        } else {
            this.noticesDetailsView = this.noticesDetails;
        }
    }

    private synchPreservedSorting(): boolean {
        const config = this.configuratonService.getConfiguration();
        const sortItem = this.findSavedSortItem(config);
        if (!sortItem) { return false; }

        sortItem.sortDirection = config.sortConfig[this.selectedNotice.key].sortDirection;
        this.noticesDetailsView = this.sortData(sortItem, this.noticesDetails);
        return true;
    }

    private synchDefaultSorting(): boolean {
        const sortItem = this.findDefaultSortItem();
        if (!sortItem) { return false; }

        sortItem.sortDirection = SortDirection.Ascending;
        this.configuratonService.saveSortingConfiguration(this.selectedNotice.key, sortItem);
        this.noticesDetailsView = this.sortData(sortItem, this.noticesDetails);
        return true;
    }

    private findSavedSortItem(config: AttentionNoticesConfiguration): SortItemInfo {
        const savedSortItem = config.sortConfig[this.selectedNotice.key];
        if (!savedSortItem) { return; }
        return this.findSortItemById(savedSortItem.id);
    }

    private findDefaultSortItem(): SortItemInfo {
        const defaultSortingIds = this.configuratonService.getDefaultSortingIds();
        let sortItem: SortItemInfo;
        let i = 0;
        while (!sortItem && i < defaultSortingIds.length) {
            sortItem = this.findSortItemById(defaultSortingIds[i]);
            i++;
        }

        return sortItem;
    }
    private findSortItemById(id: string): SortItemInfo {
        return this.sortItems.find(sortItem => sortItem.id === id);
    }

    private clearSortDirections(): void {
        this.sortItems.forEach(x => x.sortDirection = SortDirection.Unset);
    }

    private getNextSortingDirection(currentDirection: SortDirection): SortDirection {
        switch (currentDirection) {
            case SortDirection.Unset:
            case SortDirection.Descending:
                return SortDirection.Ascending;
            case SortDirection.Ascending:
                return SortDirection.Descending;
            default:
                console.log('Unexpected sort direction', currentDirection);
                return currentDirection;
        }
    }

    private mapSortDirection(sortDirection: SortDirection): 'asc' | 'desc' {
        switch (sortDirection) {
            case SortDirection.Unset:
            case SortDirection.Ascending:
                return 'asc';
            case SortDirection.Descending:
                return 'desc';
            default:
                console.log('Unexpected sort direction', sortDirection);
                return undefined;
        }
    }

    private sortData(sortItemInfo: SortItemInfo, data: AttentionNoticeModel[]): AttentionNoticeModel[] {
        if (!data || data.length <= 0) {
            return data;
        }

        this.isLoading = true;
        try {
            let sortedData: AttentionNoticeModel[];

            if (sortItemInfo.id === 'device') {
                sortedData = this.sortByDeviceThenAge(sortItemInfo, data);
            } else {
                sortedData = this.sortBySortItemInfo(sortItemInfo, data);
            }

            return sortedData;
        } catch (error) {
            console.error('Error in sorting', error);
        } finally {
            this.isLoading = false;
        }
    }

    private getOrderByParameters(sortItemInfo: SortItemInfo, dataItem: AttentionNoticeModel)
        : {iteratees: any[],  sortDirections: ('asc'|'desc')[] } {
        const sortingFieldNames = sortItemInfo.fieldsInfo
            .map(fieldInfo => fieldInfo.sortingField || fieldInfo.dataField)
            .filter(fieldName => dataItem.hasOwnProperty(fieldName));

        // Get function for each sorting field that returns case insensitive, length insensitive value (only for alphabetic fields)
        const iteratees = sortingFieldNames.map(sortingField => {
            return row => {
                const value = row[sortingField];
                if (sortItemInfo.sortingMethod === 'alphabetical') {
                    return value != null ? value.toString().toLowerCase() : '';
                } else {
                    return value;
                }
            };
        });

        const sortDirection = this.mapSortDirection(sortItemInfo.sortDirection);
        const sortDirections = sortingFieldNames.map(() => sortDirection);

        return { iteratees, sortDirections };
    }

    private sortBySortItemInfo(sortItemInfo: SortItemInfo, data: AttentionNoticeModel[]): AttentionNoticeModel[] {
        if (!data || data.length === 0) { return data; }

        const orderByParams = this.getOrderByParameters(sortItemInfo, data[0]);
        return _.orderBy(data, orderByParams.iteratees, orderByParams.sortDirections) as AttentionNoticeModel[];
    }

    private sortByDeviceThenAge(sortItemInfo: SortItemInfo, data: AttentionNoticeModel[]): AttentionNoticeModel[] {
        if (!data || data.length === 0) { return data; }

        const deviceOrderByParams = this.getOrderByParameters(sortItemInfo, data[0]);

        const ageSortItem = this.supportedSortingItems.find(x => x.id === 'age');
        const ageOrderByParams = this.getOrderByParameters(ageSortItem, data[0]);
        const ageSortDirections = ageOrderByParams.sortDirections.map(() => 'asc' as 'asc' | 'desc');

        return _.orderBy(data,
            [...deviceOrderByParams.iteratees, ...ageOrderByParams.iteratees],
            [...deviceOrderByParams.sortDirections, ...ageSortDirections]
        ) as AttentionNoticeModel[];
    }

    private getSupportedSortingItems(): SortItemInfo[] {
        return [
            {
                id: 'age',
                fieldsInfo: [
                    {
                        dataField: 'noticeDurationDisplay',
                        sortingField: 'noticeDuration'
                    },
                    {
                        dataField: 'eventDurationDisplay',
                        sortingField: 'eventDuration'
                    }
                ],
                alias: this.resources.age,
                sortDirection: SortDirection.Unset,
                sortingMethod: 'numeric'
            },
            {
                id: 'device',
                fieldsInfo: [
                    { dataField: 'dispensingDeviceNameDisplay' },
                    { dataField: 'externalSystemName' }
                ],
                alias: this.resources.device,
                sortDirection: SortDirection.Unset,
                sortingMethod: 'alphabetical'
            },
            {
                id: 'item',
                fieldsInfo: [
                    { dataField: 'item' },
                    { dataField: 'inboundInterruptTypeInternalCode' }
                ],
                alias: this.resources.itemMobile,
                sortDirection: SortDirection.Unset,
                sortingMethod: 'alphabetical'
            },
            {
                id: 'areas',
                fieldsInfo: [{ dataField: 'areasDisplay' }],
                alias: this.resources.area,
                sortDirection: SortDirection.Unset,
                sortingMethod: 'alphabetical'
            },
        ];
    }
}

interface SortItemInfo {
    id: string;
    fieldsInfo: SortItemFieldInfo[];
    alias: string;
    sortDirection: SortDirection;
    sortingMethod: string;
}

interface SortItemFieldInfo {
    dataField: string;
    sortingField?: string;
}
