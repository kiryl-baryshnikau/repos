import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

import { SelectItem } from 'primeng/primeng';

import { ResourceService } from 'container-framework';

import { MvdMedMinedDataService } from '../../../services/mvd-medmined-data.service';
import { MedminedTransformationService } from '../../../services/medmined-transformation.service';


@Component({
    selector: 'medmined-system-settings',
    templateUrl: './medmined-system-settings.component.html',
    styleUrls: [
        './medmined-system-settings.component.scss'
    ],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: MedminedSystemSettingsComponent,
        multi: true
    }]
})
export class MedminedSystemSettingsComponent implements OnInit, OnDestroy, ControlValueAccessor {
    @Input()
    appCode: string;

    @Input()
    widgetId: string;

    onChange: Function = () => { };
    onTouched: Function = () => { };
    value: any;

    private dataSubscription: Subscription;

    @Input()
    subscribedAlerts: SelectItem[];

    @Input()
    unsubscribedAlerts: SelectItem[];

    resources = {
        medminedSettingsTitle: this.resourceService.resource('medminedSystemSettingsTitle'),
        subscribeListLabel: this.resourceService.resource('subscribeAlertsListLabel'),
        unsubscribeListLabel: this.resourceService.resource('unsubscribeAlertsListLabel'),
    };

    constructor(private resourceService: ResourceService,
        private transformationService: MedminedTransformationService) {
    }

    ngOnInit() {
        
    }

    ngOnDestroy() {
    }

    unsubscribeSelected(items: any[]) {
        items.forEach(item => {
            _.remove(this.subscribedAlerts, (d) =>
                d.value.category === item.category && d.value.title === item.title
            );
            if (this.unsubscribedAlerts.findIndex(d => d.value.category === item.category && d.value.title === item.title) < 0)
                this.unsubscribedAlerts.push(this.transformationService.transformAlertSubscriptionItem(item));
        });
        if (this.onChange) {
            this.onChange(
                this.getListAlertsSubscriptions()
            );
        }
    }

    unsubscribeAll() {
        _.remove(this.subscribedAlerts, (d) => {
            if (this.unsubscribedAlerts.findIndex(item => d.value.category === item.value.category && d.value.title === item.value.title) < 0)
                this.unsubscribedAlerts.push(d);
            return true;
        });

        if (this.onChange) {
            this.onChange(
                this.getListAlertsSubscriptions()
            );
        }
    }

    subscribeSelected(items: any[]) {
        items.forEach(item => {
            _.remove(this.unsubscribedAlerts, (d) =>
                d.value.category === item.category && d.value.title === item.title
            );
            if (this.subscribedAlerts.findIndex(d => d.value.category === item.category && d.value.title === item.title) < 0)
                this.subscribedAlerts.push(this.transformationService.transformAlertSubscriptionItem(item));
        });
        if (this.onChange) {
            this.onChange(
                this.getListAlertsSubscriptions()
            );
        }
    }

    subscribeAll() {
        _.remove(this.unsubscribedAlerts, (d) => {
            if (this.subscribedAlerts.findIndex(item => d.value.category === item.value.category && d.value.title === item.value.title) < 0)
                this.subscribedAlerts.push(d);
            return true;
        });
        if (this.onChange) {
            this.onChange(
                this.getListAlertsSubscriptions()
            );
        }
    }

    writeValue(value) {
        this.value = value;
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    registerOnTouched(fn) {
        this.onTouched = fn;
    }

    private getListAlertsSubscriptions() {
        let parseSubscribed = this.subscribedAlerts.map(item => ({ category: item.value.category, title: item.value.title, status: "Enabled" }));
        let parseUnsubscribed = this.unsubscribedAlerts.map(item => ({ category: item.value.category, title: item.value.title, status: "Disabled" }));
        return [...parseSubscribed, ...parseUnsubscribed];
    }
}
