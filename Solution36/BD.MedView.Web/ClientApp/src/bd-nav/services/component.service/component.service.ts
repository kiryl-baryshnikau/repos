import { ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class ComponentService {
    private widgets = {};
    private lockWidgets$ = new ReplaySubject(1);
    private widgetsLocked = false;

    // Register Dynamic Component
    registerDynamicComponent(componentName: string, componentType: any) {
        if (this.widgetsLocked) return;

        this.widgets[componentName] = componentType;
    }

    getDynamicComponent(componentName: string) {
        return this.widgets[componentName];
    }

    // restrict further component registeration
    lockRegistration() {
        if (this.widgetsLocked) return;

        this.lockWidgets$.next(true);
    }

    onRegistrationComplete() { return this.lockWidgets$.asObservable(); }
}
