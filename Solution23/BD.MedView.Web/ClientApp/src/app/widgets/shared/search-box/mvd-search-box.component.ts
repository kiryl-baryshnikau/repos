import { Component, Input, Output, EventEmitter, ViewChildren, AfterViewInit } from '@angular/core'

import { ResourceService } from 'container-framework';

@Component({
    moduleId: module.id,
    selector: 'mvd-search-box',
    templateUrl: 'mvd-search-box.component.html',
    styleUrls: ['mvd-search-box.component.scss']
})
export class SearchBox implements AfterViewInit {

    @Output() onClear = new EventEmitter();
    @Output() onSearchClicked = new EventEmitter();

    @Input() searchCriteria: string; 
    @Input() placeHolder: string = "something";
    @Input('setFocusOnLoad') setFocusOnLoad: boolean;

    @ViewChildren('tbxComponent') tbxComponent;

    resources: any;

    constructor(private resourcesService: ResourceService) {
    }

    clearSearch() {
        this.searchCriteria = '';
        this.onClear.emit({});
    }

    executeSearch(criteria: string) {
        let filterText = criteria ? criteria.trim() : "";
        if (filterText) {
            this.onSearchClicked.emit({ value: filterText, criteria: criteria });   
        } else {
            this.searchCriteria = '';
            this.onClear.emit({});
        }
        this.tbxComponent.first.nativeElement.focus();
    }

    ngAfterViewInit(): void {
        this.requestFocus(this.setFocusOnLoad);
    }

    private requestFocus(value: boolean) {
        if (value)
            this.tbxComponent.first.nativeElement.focus();
    }
}
