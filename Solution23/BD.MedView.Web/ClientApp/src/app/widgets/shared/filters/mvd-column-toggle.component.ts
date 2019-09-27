import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ContextConstants, ContextService, EventBusService, GatewayService, ResourceService } from 'container-framework';

@Component({
    moduleId: module.id,
    selector: 'mvd-column-toggle',
    styleUrls: ['./mvd-widget-filters.scss'],
    templateUrl: './mvd-column-toggle.component.html',
})
export class ColumnToggle {

    private _options: any[];
    public get options(): any[] {
        return this._options;
    }
    @Input()
    public set options(v: any[]) {
        if (!v) {
            this._options = undefined;
            return;
        }
        this._options = v.filter(p => !p.hideOptions.hide);
    }

    @Output() onToggle = new EventEmitter();

    resources: any;
    public status: { isopen: boolean } = { isopen: false };

    constructor(private resourceService: ResourceService) {

        this.resources = this.getResources();
    }

    toggleColumn(event: any, value: any) {
        if (event.target.id) {
            event.preventDefault();
        }
        const selectedColumn = this.options.filter((column) => column.field === value);
        if (selectedColumn.length > 0) {
            const column = selectedColumn[0];
            if (column.hideOptions.enabled) {
                column.hideOptions.visible = !column.hideOptions.visible;
            }
        }
        this.onToggle.emit({ selectedColumn: selectedColumn, columnOptions: this.options });
    }

    closeDropdown(event: any) {
        event.preventDefault();
        this.status.isopen = false;
    }

    onShow() {
        this.status.isopen = true;
    }

    getResources() {
        return {
            showHideColumns: this.resourceService.resource('showHideColumns'),
            ok: this.resourceService.resource('ok')
        };
    }
}
