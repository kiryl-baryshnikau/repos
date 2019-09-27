import { Injectable } from "@angular/core";
import { MvdConstants } from '../shared';
import * as UserPreferencesModels from '../../services/bd-medview-configuration-entities';
import * as _ from 'lodash';
import {
    AppMenuService,
    continuousInfusion,
    deliveryTracking,
    ivStatus,
    ivPrep,
    clinicalOverview
} from '../../services/app-menu.service';
import { AuthorizationService } from "../../services/authorization.service";
import { take } from "rxjs/operators";
import { UserConfigurationService } from "../../services/user-configuration.service";

@Injectable()
export class TopMenuUserSettingsService {

    constructor(private appMenuService: AppMenuService,
        private authorizationService: AuthorizationService,
        private userConfigurationService: UserConfigurationService
    ) {

    }

    processUserPreferencesMenu(userPreferences) {
        this.authorizationService.authorize().pipe(
            take(1)
        ).subscribe(authConfig => {
            this.updateTabMenu(userPreferences, authConfig);
        });
    }

    private updateTabMenu(userPreferences, authorizationConfig) {

        userPreferences = this.userConfigurationService.cleanUpFacilities(authorizationConfig, userPreferences);

        const facilities: UserPreferencesModels.Facility[] = _.get(userPreferences, 'facilities', []);
        let allFacilitiesSelected = false;
        const selectedFacilities = facilities.filter(a => {
            if (a.selected && a.id === MvdConstants.ALL_FACILITIES_KEY) {
                allFacilitiesSelected = true;
            }
            return a.selected;
        });

        let widgets: UserPreferencesModels.Widget[] = [];
        let dispensingProvider = false, infusionProvider = false, catoProvider = false, medminedProvider = false;

        if (allFacilitiesSelected && selectedFacilities.length > 0) {
            widgets = selectedFacilities.find(a => a.id === MvdConstants.ALL_FACILITIES_KEY).widgets
                .filter(w => w.enabled && w.id.indexOf(MvdConstants.FACILITY_WIDGET_ID_PREFIX) >= 0);
            dispensingProvider = authorizationConfig.some(ac => ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.DISPENSING_PROVIDER_NAME));
            infusionProvider = authorizationConfig.some(ac => ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.INFUSION_PROVIDER_NAME));
            catoProvider = authorizationConfig.some(ac => ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.CATO_PROVIDER_NAME));
            medminedProvider = authorizationConfig.some(ac => ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.MEDMINED_PROVIDER_NAME));
        }
        else {
            widgets = selectedFacilities.reduce((selectedWidgets: UserPreferencesModels.Widget[], facility) => {

                if (!dispensingProvider) {
                    dispensingProvider = authorizationConfig.some(ac => `${ac.id}` === facility.id && ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.DISPENSING_PROVIDER_NAME));
                }
                if (!infusionProvider) {
                    infusionProvider = authorizationConfig.some(ac => `${ac.id}` === facility.id && ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.INFUSION_PROVIDER_NAME));
                }
                if (!catoProvider) {
                    catoProvider = authorizationConfig.some(ac => `${ac.id}` === facility.id && ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.CATO_PROVIDER_NAME));
                }
                if (!medminedProvider) {
                    medminedProvider = authorizationConfig.some(ac => `${ac.id}` === facility.id && ac.synonyms.some(s => s.source.toLowerCase() === MvdConstants.MEDMINED_PROVIDER_NAME));
                }

                facility.widgets.filter(w => w.enabled && w.id.indexOf(MvdConstants.FACILITY_WIDGET_ID_PREFIX) >= 0).forEach(w => {
                    if (!selectedWidgets.some(s => s.id === w.id)) {
                        selectedWidgets.push(w);
                    }
                });
                return selectedWidgets;
            }, []);
        }

        let priorityWidgets = false, clinicalAlertWidget = false, ivPrepWidget = false, deliveryTrackingWidget = false, ivStatusWidget = false;
        widgets.forEach(w => {
            if ((w.id === MvdConstants.DOSEREQUEST_WIDGET_KEY ||
                w.id === MvdConstants.ATTENTIONNOTICES_WIDGET_KEY ||
                w.id === MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY) && (dispensingProvider || infusionProvider)) {
                priorityWidgets = true;
                return;
            }
            if (w.id === MvdConstants.CLINICALOVERVIEW_WIDGET_KEY && medminedProvider) {
                priorityWidgets = true;
                clinicalAlertWidget = true;
                return;
            }
            if (w.id === MvdConstants.IVPREP_WIDGET_KEY && catoProvider) {
                ivPrepWidget = true;
                return;
            }
            if (w.id === MvdConstants.DELIVERYTRACKING_WIDGET_KEY && dispensingProvider) {
                deliveryTrackingWidget = true;
                return;
            }
            if (w.id === MvdConstants.IVSTATUS_WIDGET_KEY && infusionProvider) {
                ivStatusWidget = true;
                return;
            }
        });

        if (!priorityWidgets) {
            console.log('Hide ContinuousInfusion menu');
            this.appMenuService.hideTopMenuItem(continuousInfusion);
        } else {
            this.appMenuService.showTopMenuItem(continuousInfusion);
        }

        if (!deliveryTrackingWidget) {
            console.log('Hide DeliveryTracking menu');
            this.appMenuService.hideTopMenuItem(deliveryTracking);
        } else {
            this.appMenuService.showTopMenuItem(deliveryTracking);
        }

        if (!ivStatusWidget) {
            console.log('Hide IVStatus menu');
            this.appMenuService.hideTopMenuItem(ivStatus);
        } else {
            this.appMenuService.showTopMenuItem(ivStatus);
        }

        if (!ivPrepWidget) {
            console.log('Hide IVPrep menu');
            this.appMenuService.hideTopMenuItem(ivPrep);
        } else {
            this.appMenuService.showTopMenuItem(ivPrep);
        }

        if (!clinicalAlertWidget) {
            console.log('Hide Clinical Overview menu');
            this.appMenuService.hideTopMenuItem(clinicalOverview);
        } else {
            this.appMenuService.showTopMenuItem(clinicalOverview);
        }
    }
}
