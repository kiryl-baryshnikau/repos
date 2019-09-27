import { Injectable } from '@angular/core';
import { IWidgetAuthorizationService } from 'container-framework';
import { AuthorizationService } from './authorization.service';
import { UserConfigurationService } from './user-configuration.service';

import { MvdConstants } from '../widgets/shared/mvd-constants';
import { Observable, of, iif } from 'rxjs';
import { tap, take, map, publishReplay, refCount, switchMap } from 'rxjs/operators';

// TODO: Hard coded CFW.Widget to auth.Resources mapping
const WidgetAuthorizationNameMappings = {
    medViewIVStatus: MvdConstants.IVSTATUS_WIDGET_KEY,
    medViewIVPrep: MvdConstants.IVPREP_WIDGET_KEY,
    medViewContinuousInfusion: MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY,
    medViewAttentionNotices: MvdConstants.ATTENTIONNOTICES_WIDGET_KEY,
    medViewDeliveryTracking: MvdConstants.DELIVERYTRACKING_WIDGET_KEY,
    medViewDoseRequest: MvdConstants.DOSEREQUEST_WIDGET_KEY,
    medViewClinicalOverview: MvdConstants.CLINICALOVERVIEW_WIDGET_KEY,
    // TODO KB: I believe it should be sepatate one
    medViewCriticalAlerts: MvdConstants.CLINICALOVERVIEW_WIDGET_KEY
};

@Injectable()
export class WidgetsAuthorization implements IWidgetAuthorizationService {
    // TODO: User could manually set this mapping during typescript debug dict to hack visibility of widget.
    constructor(private authorizationService: AuthorizationService,
                private userConfiguration: UserConfigurationService) {
    }

    private _widgetsToShow$;
    private widgetsToShow$(): Observable<any[]> {
        if (!this._widgetsToShow$) {
            this._widgetsToShow$ = this.userConfiguration.getCurrentConfig().pipe(
                take(1),
                map(response => {
                    let allFacilitiesSelected = false;
                    const facilities = response.userPreferences.facilities.filter(facility => {
                        if (facility.selected && facility.id === MvdConstants.ALL_FACILITIES_KEY) {
                            allFacilitiesSelected = true;
                        }
                        return facility.selected;
                    });
                    let widgetsToShow = [];
                    if (facilities && facilities.length > 0) {
                        if (allFacilitiesSelected) {
                            widgetsToShow = facilities.find(f =>
                                f.id === MvdConstants.ALL_FACILITIES_KEY).widgets.filter(widget => widget.enabled);
                        } else {
                            const availableWidgets = facilities.reduce((selectedWidgets, f) => {
                                const widgets = f.widgets ? f.widgets.filter(w => w.enabled) : [];
                                if (widgets) {
                                    widgets.forEach(w => {
                                        if (!selectedWidgets.some(s => s.id === w.id)) {
                                            selectedWidgets.push(w);
                                        }
                                    });
                                }
                                return selectedWidgets;
                            }, []);
                            widgetsToShow = availableWidgets;
                        }
                    }

                    return widgetsToShow;
                }),
                publishReplay(1),
                refCount()
            );
        }

        return this._widgetsToShow$;
    }

    refreshWidgetToShow(widgets) {
        this._widgetsToShow$ = undefined;
    }

    canShowWidget(widgetName: string, widgetType: string): Observable<boolean> {
        console.log(`Trying to verify for widget '${widgetName}'-'${widgetType}'...`);
        if (WidgetAuthorizationNameMappings[widgetName] === undefined) {
            console.log(`Widget '${widgetName}'-'${widgetType}' is not within authorization scope.`);
            return of(true);
        }

        return this.widgetsToShow$().pipe(
            map(widgetsToShow => {
                let wantToShow = true;
                if (widgetsToShow) {
                    wantToShow = widgetsToShow.some(a => a.id === WidgetAuthorizationNameMappings[widgetName]);
                }
                return wantToShow;
            }),
            switchMap(wantToShow => iif(() => !wantToShow,
                of(false).pipe(
                    tap(() => console.log(`Widget ${widgetName}-${widgetType} will not be shown`))
                ),
                this.authorizationService.isAuthorized2(WidgetAuthorizationNameMappings[widgetName]).pipe(
                    tap(res => console.log(`Widget ${widgetName}-${widgetType} authorization status = ${res}`))
                )
            ))
        );
    }
}
