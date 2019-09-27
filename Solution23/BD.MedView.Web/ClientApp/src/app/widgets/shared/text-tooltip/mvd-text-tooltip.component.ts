import { Component, Input } from '@angular/core';

@Component({
    selector: 'mvd-text-tooltip',
    templateUrl: './mvd-text-tooltip.component.html',
    styleUrls: ['./mvd-text-tooltip.component.scss']
})
export class TextTooltipComponent {
    @Input() text: string; 
    @Input() tooltipText: string;
}

