import { Component, Output, Input, EventEmitter, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { ResourceService } from 'container-framework';
import { IvPrepModels } from '../../../shared/mvd-models';
import { IvPrepTransformationService } from '../mvd-iv-prep-transformation.service';
import * as _ from 'lodash';

@Component({
    selector: 'iv-prep-btn-filters',
    templateUrl: './iv-prep-btn-filters.component.html',
    styleUrls: ['iv-prep-btn-filters.component.scss']
})
export class IvPrepBtnfiltersComponent implements OnInit, OnChanges {

    @Output() 
    onChange = new EventEmitter();

    @Input()
    deliveryMode = true;

    @Input()
    data: IvPrepModels.IvPrepViewModel[] = [];

    @Input()
    doseSummary: IvPrepModels.DoseSummary;

    @Input()
    stateMappings: IvPrepModels.StateMapping[];

    items: any[];
    totalCounter = {
        stat: 0,
        normal: 0
    };
    allCounter: any;
    resources: any;

    currentStatus = { id: 'ALL' };

    constructor(private resourceService: ResourceService,
        private transformationService: IvPrepTransformationService) {

    }

    ngOnInit() {
        this.resources = this.getResources();
        this.initializeItems();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('deliveryMode') && this.resources) {
            this.initializeItems();
        }
        if (changes.hasOwnProperty('doseSummary') && this.doseSummary) {
            // CALCULATE COUNTERS

            this.buildCounters(this.doseSummary);
        }
    }

    private buildCounters(doseSummary: IvPrepModels.DoseSummary) {
        this.totalCounter.normal = 0;
        this.totalCounter.stat = 0;

        this.items.forEach((item) => {

            const counters = this.transformationService.getDoseCountFromSummary(doseSummary, this.stateMappings, item.id);
            item.counter.stat = counters.statCount;
            item.counter.normal = counters.normalCount;

            this.totalCounter.normal += item.counter.normal;
            this.totalCounter.stat += item.counter.stat;
        });
    }

    initializeItems() {
        this.items = [
            {
                id: 'QUEUEDPREP',
                label: this.resources.queuedForPrep,
                counter: {
                    stat: 0,
                    normal: 0
                }
            },
            {
                id: 'READYPREP',
                label: this.resources.readyForPrep,
                counter: {
                    stat: 0,
                    normal: 0
                }
            },
            {
                id: 'INPREP',
                label: this.resources.inPrep,
                counter: {
                    stat: 0,
                    normal: 0
                }
            },
            {
                id: 'READYCHECK',
                label: this.resources.readyForCheck,
                counter: {
                    stat: 0,
                    normal: 0
                }
            },
            {
                id: 'READYDELIVERY',
                label: this.resources.readyForDelivery,
                counter: {
                    stat: 0,
                    normal: 0
                }
            },
            {
                id: 'DELIVERY',
                label: this.deliveryMode ? this.resources.delivery : this.resources.completed,
                counter: {
                    stat: 0,
                    normal: 0
                }
            }
        ];
    }

    onItemClicked(event): void {
        setTimeout(() => {
            this.currentStatus = event.option.value;
            this.onChange.emit({ value: this.currentStatus.id });
        }, 0);
    }

    getResources() {
        return {
            all: this.resourceService.resource('all'),
            queuedForPrep: this.resourceService.resource('queuedForPrep'),
            readyForPrep: this.resourceService.resource('readyForPrep'),
            inPrep: this.resourceService.resource('inPrep'),
            readyForCheck: this.resourceService.resource('readyForCheck'),
            readyForDelivery: this.resourceService.resource('readyForDelivery'),
            delivery: this.resourceService.resource('delivery'),
            completed: this.resourceService.resource('completed')
        };
    }

    isSelected(itemId) {
        return this.currentStatus.id === itemId;
    }

    isAllSelected() {
            return this.currentStatus.id === 'ALL';
    }

    setCurrentStatus(status: string) {
        if (status) {
            this.currentStatus = { id: status };
        }
    }
}
