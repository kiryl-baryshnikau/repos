import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ResourceService } from 'container-framework';
import * as models from '../../shared/mvd-models';

@Component({
    moduleId: module.id,
    selector: 'mvd-column-multiple-value',
    templateUrl: 'mvd-column-multiple-value.component.html',
    styleUrls: ['mvd-column-multiple-value.scss']
})
export class MultipleValueFilter {
    options: any;
    resources: any;
    applyButtonEnabled: boolean = false;

    @Input() widerBoxesMode = false;

    @Output() onInit = new EventEmitter();
    @Output() onApply = new EventEmitter();
    @Output() onReset = new EventEmitter();

    constructor(protected resourceService: ResourceService) {
        this.resources = this.getResources();
    }

    applyFilters() {
        this.disableApplyButton();
        this.onApply.emit(this.options);
    }

    resetFilters() {
        this.options.forEach((option: any) => {
            option.filterOptions.allChecked = true;
            option.filterOptions.criteria.forEach((criteria: any) => {
                criteria.state = true;
            });
        });
        this.disableApplyButton();
        this.onReset.emit(this.options);
    }

    initializeFilters(data: any, configuration: models.ColumnOption[]) {
        this.disableApplyButton();
        let initialData = [...data];
        if (configuration) {
            this.options = configuration
                .filter((config: models.ColumnOption) => config.filterOptions.enabled)
                .map((config: models.ColumnOption) => {
                    config.filterOptions.allChecked = config.filterOptions.allChecked;
                    config.filterOptions.criteria = this.getDistincValues(config, initialData);
                    return config;
                });
            this.options.forEach((option) => {
                option.filterOptions.criteria
                .sort((a, b) => {
                    const valueA = ((a || '').value || '').toString().toUpperCase();
                    const valueB = ((b || '').value || '').toString().toUpperCase();
                    return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
                });
            });
        }
        this.onInit.emit(this.options);
        return this.options;
    }

    getDistincValues(config: models.ColumnOption, data: any[]) {
        let unique = {};
        let distinct: any[] = [];
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                if (config.field === 'guardrailStatus') {
                    if (typeof (unique[data[i][config.field].countGRViolations]) == "undefined") {
                        let value = data[i][config.field].countGRViolations;
                        distinct.push({ value: value, state: this.getCriteriaState(value, config) });
                    }
                    unique[data[i][config.field].countGRViolations] = 0;
                } else {
                    if (config.subProperty) {
                        if (Array.isArray(data[i][config.field])) {   
                            data[i][config.field].forEach((item, index) => {
                                // hard coded - temporal solution
                                
                                if (config.subProperty === 'priority') {
                                    let tempTotal = item.documented
                                        + item.new
                                        + item.pending
                                        + item.read;
                                    if (!tempTotal)
                                        return;
                                }

                                if (typeof (unique[data[i][config.field][index][config.subProperty]]) == "undefined") {
                                    let value = data[i][config.field][index][config.subProperty];
                                    if (value !== undefined) {
                                        distinct.push({ value: value, state: this.getCriteriaState(value, config) });
                                    }
                                }
                                unique[data[i][config.field][index][config.subProperty]] = 0;
                            });
                        }
                    } else {
                        if (typeof (unique[data[i][config.field]]) == "undefined") {
                            let value = data[i][config.field];
                            if (value !== undefined) {
                                distinct.push({ value: value, state: this.getCriteriaState(value, config) });
                            }
                        }
                        unique[data[i][config.field]] = 0;
                    }
                }
            }
        }
        return distinct;
    }

    getCriteriaState(value: any, config: models.ColumnOption): any {
        let currentConfig = config.filterOptions.criteria.find((con: any) => con.value === value);
        return currentConfig ? currentConfig.state : config.filterOptions.allChecked;
    }

    checkAll(event: any, field: any) {
        let option = this.options
            .find((filter: any) => { return filter.field === field });
        if (option) {
            option.filterOptions.criteria.forEach((criteria: any) => {
                criteria.state = event;
            });
        }
        this.enableApplyButton();
    }

    isAllChecked(field: any) {
        let option = this.options
            .find((filter: any) => { return filter.field === field });

        option.filterOptions.allChecked = option.filterOptions.criteria.every((criteria: any) => {
            return criteria.state;
        });
        this.enableApplyButton();
        return option.filterOptions.allChecked;
    }

    getResources() {
        return {
            all: this.resourceService.resource('all'),
            apply: this.resourceService.resource('apply'),
            resetFilters: this.resourceService.resource('resetFilters'),
            hideFilters: this.resourceService.resource('hideFilters'),
            yes: this.resourceService.resource('yes'),
            no: this.resourceService.resource('no'),
            unknown: this.resourceService.resource('unknown'),
            normal: this.resourceService.resource('normalIndicator'),
        };
    }

    enableApplyButton() {
        if (!this.applyButtonEnabled) {
            this.applyButtonEnabled = true;
        }
    }

    disableApplyButton() {
        if (this.applyButtonEnabled) {
            this.applyButtonEnabled = false;
        }
    }
}
