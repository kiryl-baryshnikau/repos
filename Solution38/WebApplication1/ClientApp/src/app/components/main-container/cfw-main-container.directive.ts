import { Directive, DoCheck, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';

export class  MainContainerView {
    private _created = false;

    constructor(
        private _viewContainerRef: ViewContainerRef, private _templateRef: TemplateRef<Object>) { }

    create(): void {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    }

    destroy(): void {
        this._created = false;
        this._viewContainerRef.clear();
    }

    enforceState(created: boolean) {
        if (created && !this._created) {
            this.create();
        } else if (!created && this._created) {
            this.destroy();
        }
    }
}

@Directive({ selector: '[widgetSet]' })
export class WidgetSet {
    private _setViews : MainContainerView[] = [];
    private _drillViews : MainContainerView[] = [];
    private _widgetSet: Array<string> = [];
    private _widgetDrill: string | null = '';

    @Input()
    set widgetSet(newValue: Array<string>) {
        this._widgetSet = newValue;
    }

    @Input()
    set widgetDrill(newValue: string) {
        this._widgetDrill = newValue;
    }

    _addSetCase(view: MainContainerView): void {
        this._setViews.push(view);
    }
    _addDrillCase(view: MainContainerView): void {
        this._drillViews.push(view);
    }

    _matchSetCase(value: Array<string>): boolean {
        const matched = (this._widgetDrill == null || this._widgetDrill.length == 0) && (JSON.stringify(value.sort()) == JSON.stringify(this._widgetSet.sort()));
        return matched;
    }

    _matchDrillCase(value: string): boolean {
        const matched = (this._widgetDrill != null && this._widgetDrill.length != 0) && (value == this._widgetDrill);
        return matched;
    }
}

@Directive({ selector: '[widgetSetCase]' })
export class WidgetSetCase implements DoCheck {
    private _view: MainContainerView;
    @Input()
    widgetSetCase: Array<string>;

    constructor(
        viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>,
        @Host() private widgetSet: WidgetSet) {
        this._view = new MainContainerView(viewContainer, templateRef);
        widgetSet._addSetCase(this._view);
    }
    ngDoCheck() { this._view.enforceState(this.widgetSet._matchSetCase(this.widgetSetCase)); }
}

@Directive({ selector: '[widgetDrillCase]' })
export class WidgetDrillCase {
    private _view: MainContainerView;
    @Input()
    widgetDrillCase: string;

    constructor(
        viewContainer: ViewContainerRef, templateRef: TemplateRef<Object>,
        @Host() private widgetSet: WidgetSet) {
        this._view = new MainContainerView(viewContainer, templateRef);
        widgetSet._addDrillCase(this._view);
    }
    ngDoCheck() { this._view.enforceState(this.widgetSet._matchDrillCase(this.widgetDrillCase)); }
}
