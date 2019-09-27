import { Directive, ElementRef, OnInit, Input, HostListener } from '@angular/core';

@Directive({
    selector: '[bdx-overflow-tooltip]'
})

export class OverflowTooltip implements OnInit {
    @Input() overflowTooltip: string;

    constructor(private _elRef: ElementRef) {

    }
    ngOnInit() {

    }
    @HostListener('mouseenter')
    onMouseEnter(): void {
        let nativeElement = this._elRef.nativeElement;
        let overflowExists = nativeElement.offsetWidth < nativeElement.scrollWidth;

        if (overflowExists) {

            nativeElement.title = this.overflowTooltip;
        }
        else {
            nativeElement.title = "";
        }
    }

}
