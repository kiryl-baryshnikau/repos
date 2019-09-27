import { Directive, OnInit, OnDestroy, Output, EventEmitter, ElementRef, Input } from '@angular/core';
import { DomActivityService } from '../services/dom-activity.service/dom-activity.service';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';




@Directive({
    selector: '[click-outside]'
})

export class ClickOutside implements OnInit, OnDestroy {
    private listening: boolean;
    private globalClick: any;

    @Input('stopListening') stopListening: boolean = false;
    @Output('clickOutside') clickOutside: EventEmitter<Object>;

    constructor(private _elRef: ElementRef, private domActivityService: DomActivityService) {
        this.listening = false;
        this.clickOutside = new EventEmitter();
    }

    ngOnInit() {
        this.globalClick = this.domActivityService
            .globalClick().pipe(
                filter(it => !this.stopListening),
                tap(() => {
                    this.listening = true;
                })
            )
            .subscribe((event: MouseEvent) => {
                this.onGlobalClick(event);
            });
    }

    ngOnDestroy() {
        this.globalClick.unsubscribe();
    }

    onGlobalClick(event: MouseEvent) {
        if (event instanceof MouseEvent && this.listening === true) {
            if (this.isDescendant(this._elRef.nativeElement, event.target) === false) {
                this.clickOutside.emit({
                    target: (event.target || null),
                    value: true
                });
            }
        }
    }

    isDescendant(parent: any, child: any) {
        let node = child;
        while (node !== null) {
            if (node === parent) {
                return true;
            } else {
                node = node.parentNode;
            }
        }

        return false;
    }
}
