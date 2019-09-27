import { Component, EventEmitter, Output, Input } from '@angular/core';
import { MvdConstants } from '../mvd-constants';
import * as _ from 'lodash';

@Component({
    selector: 'mvd-checkbox-list',
    templateUrl: './checkbox-list.component.html',
    styleUrls: ['./checkbox-list.component.scss']
})
export class CheckboxListComponent {
    @Output() onItemSelectionChanged = new EventEmitter();
    @Input() listItems: any[];

    public groupname: string = "groupname2";
    public selectedValue: string = "";


    public selectItem(item: string) {
        this.selectedValue = item;
    }

    public onElementClick(checked: any, item: any) {
        if (item.value.id === MvdConstants.ALL_FACILITIES_KEY) {
            if (checked) {
                this.listItems.forEach(d => d.value.checked = true);
            } else {
                this.listItems.forEach(d => d.value.checked = false);
            }
        } else {
            if (!checked) {
                this.checkOrUncheckAllFacilities(false);
            } 
            else {
                this.checkForAutomaticAllFacilitiesCheck();
            }
        }

        this.onItemSelectionChanged.emit(_.cloneDeep(this.listItems));
    }

    private checkForAutomaticAllFacilitiesCheck() {
        let noOfSelectedFaciities = this.listItems.filter(d => d.value.checked === true);
        if (noOfSelectedFaciities.length == (this.listItems.length - 1)) {
            this.checkOrUncheckAllFacilities(true);
        }
    }

    private checkOrUncheckAllFacilities(checkValue: boolean) {
        let allFacilitiesItem = this.listItems.find(d => d.value.id === MvdConstants.ALL_FACILITIES_KEY);
        if (allFacilitiesItem) {
            allFacilitiesItem.value.checked = checkValue;
        }
    }
}
