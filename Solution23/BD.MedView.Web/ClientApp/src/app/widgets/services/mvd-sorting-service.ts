import { Injectable } from "@angular/core";

import { ResourceService } from 'container-framework';

@Injectable()
export class SortingService {

    private resources: any;

    constructor(private resourcesService: ResourceService) {
        this.resources = this.getResources();
    }

    sortDataByField(field: any, order: number, sortingMethod: any, data: any[]) {
        if (!this.sortingMethods.hasOwnProperty(sortingMethod) || !field) {
            console.error(`Invalid arguments for sortData:  ${sortingMethod} ${field}`);
            return;
        }
        data.sort((a: any, b: any) => {
            if (a[field] === b[field] ||
                (field === 'guardrailStatus' && a[field].countGRViolations === b[field].countGRViolations)) {
                return this.sortingMethods['numeric'](a['infusionContainerKey'], b['infusionContainerKey']);
            }
            return this.sortingMethods[sortingMethod](a[field], b[field]);
        });
        if (order === -1) data.reverse();
        let highPriorityItems = data.filter((item: any) => item.highPriority);

        for (let i = 0; i < highPriorityItems.length; i++) {
            let itemIndex = data.indexOf(highPriorityItems[i]);
            let element = data.splice(itemIndex, 1);
            data.splice(0, 0, element[0]);
        }
        return data;
    }

    sortData(field: any, order: number, sortingMethod: any, data: any[]) {
        if (!this.sortingMethods.hasOwnProperty(sortingMethod) || !field) {
            console.error(`Invalid arguments for sortData:  ${sortingMethod} ${field}`);
            return;
        }
        data.sort((a: any, b: any) => {
            return this.sortingMethods[sortingMethod](a[field], b[field]);
        });
        if (order === -1) data.reverse();
        return data;
    }

    sortDataWithIndex(field: any, order: number, sortingMethod: any, data: any[], indexName: string): any {
        if (!this.sortingMethods.hasOwnProperty(sortingMethod) || !field) {
            console.error(`Invalid arguments for sortData:  ${sortingMethod} ${field}`);
            return;
        }
        data.sort((a: any, b: any) => {
            const itemA = a[field];
            const itemB = b[field];
            const indexA = a[indexName];
            const indexB = b[indexName];

            if (itemA === itemB) {
                return indexA < indexB ? -1 : indexA > indexB ? 1 : 0; 
            }
            return this.sortingMethods[sortingMethod](itemA, itemB);
        });
        if (order === -1) data.reverse();
        return data;
    }

    sortDataWithIndexForIvStatus(field: any, order: number, sortingMethod: any, data: any[], indexName: string) {

        this.sortDataWithIndex(field, order, sortingMethod, data, indexName);
        data.sort((a: any, b: any) => {
            if (a.highPriority === b.highPriority) {
                return 0;
            }
            return a.highPriority < b.highPriority ? 1 : -1;
        }); 
    }

    sortDataAgeDataWithIndex(field: any, order: number, sortingMethod: any, data: any[], indexName: string) {
        if (!this.sortingMethods.hasOwnProperty(sortingMethod) || !field) {
            console.error(`Invalid arguments for sortData:  ${sortingMethod} ${field}`);
            return;
        }
        if (order === 1) {
            this.sortAgeDataWithIndexAscending(data, field, indexName);
        } else {
            this.sortAgeDataWithIndexDescending(data, field, indexName);
        }
    }

    private sortAgeDataWithIndexAscending(data: any[], field: string, indexName: string) {
        data.sort((a: any, b: any) => {

            const itemA = a[field];
            const itemB = b[field];
            const indexA = a[indexName];
            const indexB = b[indexName];
            const deliveredStatusCode = 'DELIVERED';

            if (itemA === itemB) {
                return indexA < indexB ? -1 : indexA > indexB ? 1 : 0;
            }

            if (a.status === b.status) {

                if (a.status === deliveredStatusCode) {
                    const dateA = new Date(itemA);
                    const dateB = new Date(itemB);
                    return dateA.getTime() - dateB.getTime();
                }

                const numericItemA = itemA || 0;
                const numericItemB = itemB || 0;

                return (numericItemA > numericItemB) ? 1 : -1;
            }

            if (a.status !== deliveredStatusCode && b.status !== deliveredStatusCode) {
                const numericItemA = itemA || 0;
                const numericItemB = itemB || 0;

                return (numericItemA > numericItemB) ? 1 : -1;
            }
            return a.status === deliveredStatusCode ? -1 : 1;
        });
    }

    private sortAgeDataWithIndexDescending(data: any[], field: string, indexName: string) {
        data.sort((a: any, b: any) => {

            const itemA = a[field];
            const itemB = b[field];
            const indexA = a[indexName];
            const indexB = b[indexName];
            const deliveredStatusCode = 'DELIVERED';

            if (itemA === itemB) {
                return indexA > indexB ? -1 : indexA < indexB ? 1 : 0;
            }

            if (a.status === b.status) {

                if (a.status === deliveredStatusCode) {
                    const dateA = new Date(itemA);
                    const dateB = new Date(itemB);
                    return dateB.getTime() - dateA.getTime();
                }

                const numericItemA = itemA || 0;
                const numericItemB = itemB || 0;

                return (numericItemA < numericItemB) ? 1 : -1;
            }

            if (a.status !== deliveredStatusCode && b.status !== deliveredStatusCode) {
                const numericItemA = itemA || 0;
                const numericItemB = itemB || 0;

                return (numericItemA < numericItemB) ? 1 : -1;
            }
            return a.status === deliveredStatusCode ? -1 : 1;
        });
    }

    getSortingMethod(sortingMethod: any) {
        return this.sortingMethods[sortingMethod];
    }

    getResources(): any {
        return {
            completed: this.resourcesService.resource('completed'),
            unknown: this.resourcesService.resource('unknown'),
            notApplicable: this.resourcesService.resource('notApplicable')
        };
    }

    sortArray(data: any[]) {
        return data.sort(function (a, b) {
            a = a || "";
            b = b || "";
            return a.localeCompare(b);
        });
    }

    sortArrayObjectByField(field: string, data: any[]) {
        data.sort((a: any, b: any) => {
            a[field] = a[field] || "";
            b[field] = b[field] || "";
            return a[field].localeCompare(b[field]);
        });
        return data;
    }

    private sortingMethods = {
        'numeric': (a: any, b: any) => {
            a = a || 0;
            b = b || 0;
            return (a === b) ? 0 : a > b ? 1 : -1;
        },
        'timeString': (a: any, b: any) => {
            if (isNaN(a) && !isNaN(b)) {
                a = 1;
                b = 0;
            }
            else if (isNaN(b) && !isNaN(a)) {
                a = 0;
                b = 1;
            }
            else if (isNaN(a) && isNaN(b)) {
                if (a !== b) {
                    let temp = a;
                    a = a === this.resources.unknown ? 1 : (a === this.resources.notApplicable && b !== this.resources.unknown) ? 1 : 0;
                    b = b === this.resources.unknown ? 1 : (b === this.resources.notApplicable && temp !== this.resources.unknown) ? 1 : 0;
                }
                else {
                    a = b = 0;
                }
            }
            a = a || 0;
            b = b || 0;
            return (a === b) ? 0 : Number(a) > Number(b) ? 1 : -1;
        },
        'numericString': (a: any, b: any) => {
            const numericRegexp = /[-]{0,1}[\d.]*[\d]+/g;
            let temp: string[];
            if (isNaN(a)) {
                temp = a.match(numericRegexp);
                if (temp.length > 0) {
                    a = Number(temp[0]);
                }
                else {
                    a = 0;
                }
            }
            if (isNaN(b)) {
                temp = b.match(numericRegexp);
                if (temp.length > 0) {
                    b = Number(temp[0]);
                }
                else {
                    b = 0;
                }
            }
            a = a || 0;
            b = b || 0;
            return (a === b) ? 0 : a > b ? 1 : -1;
        },
        'numericGuardrailViolations': (a: any, b: any) => {
            a = a.countGRViolations || 0;
            b = b.countGRViolations || 0;
            return (a === b) ? 0 : a > b ? -1 : 1;
        },
        'alphabetical': (a: any, b: any) => {
            a = a || "";
            b = b || "";
            if (a === 'Unknown' || b === 'Unknown') {
                return (a === b) ? 0 : (a === 'Unknown') ? -1 : 1;
            }
            return `${a}`.localeCompare(`${b}`);
        },
        'boolean': (a: any, b: any) => {
            return (a === b) ? 0 : a ? -1 : 1;
        },
        'date': (a: any, b: any) => {
            let dateA = new Date(a);
            let dateB = new Date(b);
            return dateA.getTime() - dateB.getTime();
        },
        'localeSensitive': (a: any, b: any) => {
            a = a || "";
            b = b || "";
            return a === b ? 0 : a.localeCompare(b);
        },
        'dateAge': (a: any, b: any) => {
            if (!isNaN(a) && !isNaN(b)) {
                return (a === b) ? 0 : a > b ? 1 : -1;
            }
            if (isNaN(a) && isNaN(b)) {
                let dateA = new Date(a);
                let dateB = new Date(b);
                return dateA.getTime() - dateB.getTime();
            }
            return !isNaN(a) ? 1 : -1; 
        }
    };
}
