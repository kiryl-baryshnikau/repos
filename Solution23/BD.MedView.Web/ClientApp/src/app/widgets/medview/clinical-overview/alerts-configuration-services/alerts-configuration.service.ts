import { Inject, Injectable, Optional } from '@angular/core';
import { Subscription, Observable, of } from "rxjs";
import { map, concatMap } from 'rxjs/operators';
import { MvdConstants } from '../../../shared/mvd-constants';
import { MvdMedMinedDataService } from "../../../services/mvd-medmined-data.service";
import { UserConfigurationService } from "../../../../services/user-configuration.service";

@Injectable()
export class AlertsConfigurationService{

    private clinicalOverviewWidgetName = MvdConstants.CLINICALOVERVIEW_WIDGET_KEY;

    constructor(
        private dataService: MvdMedMinedDataService,
        private userConfigurationService: UserConfigurationService){
    }


    applyConfiguration$(userConfigurations: any, alertCategoriesCofiguration: any) {
        if (userConfigurations && alertCategoriesCofiguration.length) {
            const widgets = userConfigurations.userPreferences.generalSettings || [];
            const clinicalOverviewWidget = widgets.findIndex((widget) => widget.id === this.clinicalOverviewWidgetName);

            if (clinicalOverviewWidget >= 0) {
                userConfigurations.userPreferences.generalSettings[clinicalOverviewWidget] = {
                    id: this.clinicalOverviewWidgetName,
                    configuration: {
                        alertCategories: alertCategoriesCofiguration
                    }
                };
            } else {
                userConfigurations.userPreferences.generalSettings.push({
                    id: this.clinicalOverviewWidgetName,
                    configuration: {
                        alertCategories: alertCategoriesCofiguration
                    }
                });
            }
        }

        return this.userConfigurationService.setUserPreferences(userConfigurations.userPreferences);
    }

    getAlertsData$(appCode, widgetId, facilityKeys): Observable<any>{
        let alertCategories = null;
        return this.dataService.getMedMinedAlertsMetadata$(appCode, widgetId, facilityKeys).pipe(
            concatMap(data => this.userConfigurationService.getCurrentConfig()
                .pipe(map(configuration =>({data, configuration})))),
                concatMap(({data, configuration}) => {
                    const widgets = configuration.userPreferences.generalSettings || [];
                    const clinicalOverviewWidget = widgets.find((widget) => widget.id === this.clinicalOverviewWidgetName);
                    let alertCategoriesCofiguration = null;

                    if (clinicalOverviewWidget && clinicalOverviewWidget.configuration && clinicalOverviewWidget.configuration.alertCategories) {
                        alertCategoriesCofiguration = [...clinicalOverviewWidget.configuration.alertCategories];
                    }

                    if(data){
                       alertCategories = data.results.reduce((arr, x) => {
                            x.categories.forEach((item) => {
                                let catArray = arr.find((i) => i.category === item.category);                                
                        
                                if(catArray) {
                                    let userConfigCategory = alertCategoriesCofiguration? alertCategoriesCofiguration.find(x => x.category === item.category) : null;
                                    item.titles.forEach(i => {
                                        let title = catArray.alerts.find(a => a.title === i);
                                        if(!title){
                                            let alertConfig = userConfigCategory? userConfigCategory.alerts.find(x => x.title === i) : null;
                                            catArray.alerts.push({ title: i, status: alertConfig? alertConfig.status : '1'});
                                        }
                                    })
                                }
                                else {
                                    let userConfigCategory = alertCategoriesCofiguration? alertCategoriesCofiguration.find(x => x.category === item.category) : null;
                                    let catArray = {
                                        category: item.category,
                                        alerts: item.titles.map(i => {
                                            let alertConfig = userConfigCategory? userConfigCategory.alerts.find(x => x.title === i) : null;
                                            return { title: i, status: alertConfig? alertConfig.status : '1'};
                                        })
                                    };
                                    arr.push(catArray);
                                }
                            });
                            return arr;
                        }, []);
                    }
                    return of({alertCategories, configuration});
                }));
    }
}
