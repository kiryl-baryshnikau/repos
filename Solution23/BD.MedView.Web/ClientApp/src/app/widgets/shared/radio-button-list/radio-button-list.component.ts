import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
    selector: 'mvd-radio-button-list',
    templateUrl: './radio-button-list.component.html',
    styleUrls: [ './radio-button-list.component.scss' ]
})
export class RadioButtonListComponent {
    @Output() onItemSelectionChanged = new EventEmitter();
    @Input() listItems: any[];

    public groupname: string = "groupname2";
    public selectedValue: string ="VeraFacility1";



    public selectItem(item: string) {
        this.selectedValue = item;
    }

    public onElementClick(item: any) {
        this.onItemSelectionChanged.emit(item);
    }
}
