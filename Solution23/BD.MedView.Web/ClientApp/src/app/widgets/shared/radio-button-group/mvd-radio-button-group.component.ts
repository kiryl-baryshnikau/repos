import { Component, Input, Output, EventEmitter } from '@angular/core'
import * as models from '../mvd-models';

@Component({
    selector: 'mvd-radio-button-group',
    templateUrl: './mvd-radio-button-group.component.html',
    styleUrls: ['./mvd-radio-button-group.component.scss']
})
export class RadioButtonGroupComponent  {

    @Input() selectedOption : string;
    @Input() options: models.SelectableItem[] = [];
    @Output() onOptionChange = new EventEmitter<any>();

    onModelChange(event) {
        if (event) {
            this.selectedOption = event;
            this.onOptionChange.emit(event);
        }
    }
}
