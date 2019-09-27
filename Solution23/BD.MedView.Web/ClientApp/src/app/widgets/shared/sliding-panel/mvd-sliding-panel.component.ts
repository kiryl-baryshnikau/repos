import { Component, Input } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'mvd-sliding-panel',
    styleUrls: ['./mvd-sliding-panel.component.scss'],
    templateUrl: './mvd-sliding-panel.component.html',
    animations: [
        trigger('slide1',
            [
                state('false', style({ display: 'none' })),
                state('true', style({ display: 'block' })),
                transition('true => false', [
                    style({ display: 'block' }),
                    animate('1ms 500ms', style({ display: 'none' }))
                ])
            ]),
        trigger('slide',
            [
                state('false', style({ transform: 'translateY(-105%)' })),
                state('true', style({ transform: 'translateY(0%)' })),
                transition('true => false', [
                    animate(150)
                ]),
                transition('false => true', [
                    animate(250)
                ])
            ]),
        trigger('overlayTrigger',
            [
                state('false', style({ display: 'none' })),
                state('true', style({ display: 'block' }))
            ])
    ]
})
export class SlidingPanelComponent {
    @Input() isVisible = false;

    public get isVisibleString(): string {
        return this.isVisible ? 'true' : 'false';
    }
}
