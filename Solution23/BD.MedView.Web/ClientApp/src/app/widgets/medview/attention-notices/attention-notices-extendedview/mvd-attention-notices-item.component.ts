import { Component, Input, Output, OnInit, OnChanges, EventEmitter }      from '@angular/core';
import * as models from '../../../shared/mvd-models';

@Component({
  moduleId: module.id,
  selector: 'mvd-attention-notices-item',
  templateUrl: './mvd-attention-notices-item.component.html',
  styleUrls: [ './mvd-attention-notices-item.component.scss' ]
})
export class AttentionNoticesItemComponent implements OnInit, OnChanges {
    @Input() itemData: models.MvdListElement;

    @Output() elementClick = new EventEmitter<any>();

    constructor(){
    }

    ngOnInit(){
        
    }

    ngOnChanges(){

    }

    onElementClick(element: any) {
        this.elementClick.emit(element);
    }

    getIconClass(itemData: models.MvdListElement) {
        let cssClass = 'fa';

        switch (itemData.priority) {
            case "3":
                cssClass += ' fa-stop fa-rotate-45';
                cssClass += itemData.blinkingRow ? " blinkingIconHighPriority" : "";
                break;
            case "2":
                cssClass += ' fa-play fa-rotate-270';
                cssClass += itemData.blinkingRow ? " blinkingIconMediumPriority" : "";
                break;
            case "1":
                cssClass += ' fa-stop';
                cssClass += itemData.blinkingRow ? " blinkingIconLowPriority" : "";
                break;
            default:
                cssClass += ' fa-circle';
                cssClass += itemData.blinkingRow ? " blinkingIconNormalPriority" : "";
                break;
        }

        return cssClass;
    }
}
