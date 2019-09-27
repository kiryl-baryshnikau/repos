import { Component, Input, OnChanges, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ResourceService, WidgetsAuthorizationService } from 'container-framework';
import * as _ from 'lodash';
import { Message, SelectItem } from 'primeng/primeng';

import { AuthenticationService } from 'bd-nav/core';
import { UserConfigurationService } from '../../../../services/user-configuration.service';
import { AuthorizationService } from '../../../../services/authorization.service';
import { WidgetsAuthorization } from '../../../../services/widget-authorization';
import { MvdConstants } from '../../../shared/mvd-constants';
import { RadioButtonListComponent } from '../../../shared/radio-button-list/radio-button-list.component';
import {
    AttentionNoticesConfiguration,
} from '../../attention-notices/attention-notices-configuration/mvd-attention-notices-configuration.component';
import { FacilitySelectionComponent } from '../medview-facility-selection/facility-selection.component';
import { IvPrepConfigurationComponent } from '../iv-prep-configuration/mvd-iv-prep-configuration.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { take, switchMap, concatMap } from 'rxjs/operators';
import { IvPrepConfigurationDialogComponent } from '../iv-prep-configuration-dialog/iv-prep-configuration-dialog.component';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { TabConfigurationService } from './medview-tab-configuration.service';
import { TopMenuUserSettingsService } from '../../../services/topmenu-usersettings.service';


@Component({
    moduleId: module.id,
    selector: 'medview-configuration',
    templateUrl: './medview-configuration.component.html',
    styleUrls: ['./medview-configuration.component.scss']
})
export class MedviewConfigurationComponent implements OnChanges, OnInit {
    @Input() isStandardUser: boolean;
    @Input() appCode: string;
    @Input() widgetId: string;
    @Input() user: string;
    @Input() isInfusionSectionEnabled = true;

    @ViewChild('attentionNoticesComponent') attentionNoticesComponent: AttentionNoticesConfiguration;
    @ViewChild('template') template: TemplateRef<any>;
    @ViewChild('mvdFacilitySelection') facilitySelectionComponent: FacilitySelectionComponent;

    private dashboardId = 'MedviewConfigurationComponent';
    private widgetPrefix = MvdConstants.FACILITY_WIDGET_ID_PREFIX;
    private apiUrl = window['mvdAuthorizationServiceUrl'];
    private data = 'n/a';
    private allFacilitiesKey = MvdConstants.ALL_FACILITIES_KEY;
    private displayAttentionNoticesConfig = false;

    maskDataEnabled = false;
    msgs: Message[] = [];
    currentConfiguration: any;
    currentFacilitiesSelectedId: string[];
    authorizationConfig: any[];

    facilities: SelectItem[] = [];
    selectedFacilities: string[] = [];
    selectedFacilityName: string;

    widgetsAvailables = [];
    widgetsChecked = [];

    sessionTimeOut: string;
    enableTimeOut: boolean;

    loadingData = false;

    minValueTimeOut = 1;
    maxValueTimeOut = 480;
    displayRangeError = false;
    rangeErrorMessage = '';
    displayErrorWidgets = false;
    defaultWidget = '';
    public isFormTouched = false;
    shouldResetIvPrepSettings = false;

    resources: any;
    attentionNoticesWidget: string = MvdConstants.ATTENTIONNOTICES_WIDGET_KEY;
    continuousInfusionsWidget: string = MvdConstants.CONTINUOUSINFUSIONS_WIDGET_KEY;
    deliveryTrackingWidget: string = MvdConstants.DELIVERYTRACKING_WIDGET_KEY;
    doseRequestWidget: string = MvdConstants.DOSEREQUEST_WIDGET_KEY;
    ivStatusWidget: string = MvdConstants.IVSTATUS_WIDGET_KEY;
    ivPrepWidget: string = MvdConstants.IVPREP_WIDGET_KEY;
    clinicalOverviewWidget: string = MvdConstants.CLINICALOVERVIEW_WIDGET_KEY;

    modalRef: BsModalRef;

    private warningModalOptions: ModalOptions = {
        class: 'modal-md',
        keyboard: false,
        ignoreBackdropClick: true,
        animated: true,
        focus: true,
    };

    constructor(private resourcesService: ResourceService,
                private authenticationService: AuthenticationService,
                private userConfigurationService: UserConfigurationService,
                private widgetConfigService: WidgetsAuthorizationService,
        private tabConfigurationService: TabConfigurationService,
        private authorizationService: AuthorizationService,
        private topMenuUserSettingsService: TopMenuUserSettingsService,
                private modalService: BsModalService) {
        const userInfo = <any>this.authenticationService.accessToken;
        this.setResources();
    }

    ngOnInit() {
        console.log('MedviewConfigurationComponent:ngOnInit');
        this.getConfiguration(this.user);
    }

    updateConfiguration(user: string) {
        this.getConfiguration(user, true);
    }

    private getConfiguration(user: string, update = false) {
        this.loadingData = true;
        if (update) {
            this.userConfigurationService.clearUserPreferencesCache();
        }
        (update ? this.userConfigurationService.getUpdatedConfig() : this.userConfigurationService.getCurrentConfig())
            .pipe(
                take(1)
            )
            .subscribe((response) => {
                if (response) {
                    this.doUpdateConfig(response);
                } else {
                    console.log('MedviewConfigurationComponent:getConfiguration: error');
                }
            }, () => {
                this.loadingData = false;
            });
    }

    private doUpdateConfig(response: any) {
        this.authorizationConfig = _.clone((response.authorizationConfig || []).filter(e => e.parentId));

        // Fix mismatch between ID datatypes in Auth and userPrefs
        this.authorizationConfig.forEach(e => {
            if (e.id) {
                e.id = e.id.toString();
            }
        });


        this.currentConfiguration = _.cloneDeep(response);
        this.setFacilities();
        this.currentFacilitiesSelectedId = this.getCurrentFacilitiesSelectedId(response);

        this.sessionTimeOut = this.currentConfiguration.userPreferences.sessionTimeout !== 0 ?
            (this.currentConfiguration.userPreferences.sessionTimeout / 60).toString() : '';
        this.enableTimeOut = this.currentConfiguration.userPreferences.sessionTimeout !== 0;

        if (this.currentConfiguration.userPreferences.facilities) {

            const selected = this.currentConfiguration.userPreferences.facilities.filter(a => a.selected && a.id !== MvdConstants.ALL_FACILITIES_KEY);
            if (selected && selected.length > 0) {
                this.selectedFacilities = selected.map(s => `${s.id}`);
            }
            else {
                this.currentConfiguration.userPreferences
                    .facilities.filter(a => a.id === MvdConstants.ALL_FACILITIES_KEY)[0].selected = true;
                this.selectedFacilities = this.currentConfiguration.userPreferences
                    .facilities.filter(a => a.id !== MvdConstants.ALL_FACILITIES_KEY).map(a => `${a.id}`);
            }
            
        } else {
            this.selectedFacilities = undefined;
        }
        if (this.isStandardUser) {
            setTimeout(() => {
                this.mapWidgets();
            }, 0);
        }

        this.maskDataEnabled = this.currentConfiguration.userPreferences.maskData;
        if (this.isStandardUser && this.isInfusionSectionEnabled) {
            setTimeout(() => {
                this.facilitySelectionComponent.loadData(response, this.facilities.map(si => si.value.id), this.selectedFacilities);
            }, 0);
        }
        this.loadingData = false;
    }

    private getCurrentFacilitiesSelectedId(response: any): string[] {
        const facilities = _.get(response, 'userPreferences.facilities', []);
        return facilities.filter(f => f.selected);
    }

    private setFacilities() {
        if (this.authorizationConfig) {
            if (!this.facilities) {
                this.facilities = new Array<SelectItem>();
            }

            // Clear the array.
            this.facilities.length = 0;

            let allFacilitiesChecked = this.currentConfiguration.userPreferences.facilities.some(d => d.id === MvdConstants.ALL_FACILITIES_KEY && d.selected);

            this.authorizationConfig.filter((item) => item.parentId === 1).forEach((item) => {
                let widgets;
                if (item.permissions) {
                    widgets = item.permissions.filter(a => a.resource.indexOf(this.widgetPrefix) >= 0);
                }
                
                if (widgets && widgets.length > 0) {

                    this.facilities.push({
                        label: item.name,
                        value: {
                            id: item.id,
                            checked: allFacilitiesChecked || this.currentConfiguration.userPreferences.facilities.some(d => d.id === item.id && d.selected)
                        }
                    });
                }
            });
            this.facilities.unshift({
                label: this.resources.allFacilities,
                value: {
                    id: MvdConstants.ALL_FACILITIES_KEY,
                    checked: allFacilitiesChecked
                }
            });
        }
    }

    private getSortedWidgets() {
        return [
            {
                id: this.attentionNoticesWidget,
                name: this.resources.attentionNoticesLabel,
                checked: false,
                enabled: false
            },
            {
                id: this.continuousInfusionsWidget,
                name: this.resources.continuousInfusionLabel,
                checked: false,
                enabled: false
            },
            {
                id: this.doseRequestWidget,
                name: this.resources.doseRequestLabel,
                checked: false,
                enabled: false
            },
            {
                id: this.clinicalOverviewWidget,
                name: this.resources.clinicalOverviewLabel,
                checked: false,
                enabled: false
            },
            {
                id: this.ivPrepWidget,
                name: this.resources.ivPrepLabel,
                checked: false,
                enabled: false
            },
            {
                id: this.deliveryTrackingWidget,
                name: this.resources.deliveryTrackingLabel,
                checked: false,
                enabled: false
            },
            {
                id: this.ivStatusWidget,
                name: this.resources.ivStatusLabel,
                checked: false,
                enabled: false
            }
        ];
    }

    private syncWidgets(authConfig, userConfig) {
        let innerUserConfig = _.cloneDeep(userConfig);
        let widgetsDistinct = [];
        userConfig.userPreferences.facilities.filter(d => d.id !== MvdConstants.ALL_FACILITIES_KEY)
            .forEach(facility => {

                let widgetsAuthorized = [];
                let authFacility = authConfig.find(auth => {
                    widgetsAuthorized = auth.permissions.filter(a => a.resource.indexOf(this.widgetPrefix) >= 0);
                    return auth.id === facility.id && widgetsAuthorized && widgetsAuthorized.length > 0;
                });

                let facilityIndex = innerUserConfig.userPreferences.facilities.findIndex(a => a.id === facility.id);

                if (authFacility) {
                    innerUserConfig.userPreferences.facilities[facilityIndex].widgets = [];

                    widgetsAuthorized.forEach(w => {
                        let currentWidget = facility.widgets.find(uw => uw.id === w.resource);
                        let newWidget = {
                            id: currentWidget ? currentWidget.id : w.resource,
                            enabled: currentWidget ? currentWidget.enabled : false,
                            default: currentWidget ? currentWidget.default : false,
                            configuration: currentWidget ? currentWidget.configuration : null,
                            Route: currentWidget ? currentWidget.Route : null
                        };
                        if (widgetsDistinct.findIndex(wd => wd.id === newWidget.id) < 0) {
                            widgetsDistinct.push(newWidget);
                        }
                        if (innerUserConfig.userPreferences.facilities[facilityIndex].widgets.findIndex(iw => iw.id === newWidget.id) < 0) {
                            innerUserConfig.userPreferences.facilities[facilityIndex].widgets.push(newWidget);
                        }
                    });
                }
                else {
                    
                    innerUserConfig.userPreferences.facilities.splice(facilityIndex, 1);
                }
            });
        let allFacilitiesItem = userConfig.userPreferences.facilities.find(d => d.id === MvdConstants.ALL_FACILITIES_KEY);
        if (allFacilitiesItem) {
            let newAllFacilitiesItem = innerUserConfig.userPreferences.facilities.find(d => d.id === MvdConstants.ALL_FACILITIES_KEY);
            newAllFacilitiesItem.widgets = [];
            widgetsDistinct.forEach(w => {
                let currentWidget = allFacilitiesItem.widgets.find(uw => uw.id === w.id);
                let newWidget = {
                    id: w.id,
                    enabled: w.enabled,
                    default: w.default,
                    configuration: currentWidget ? currentWidget.configuration : null,
                    Route: currentWidget ? currentWidget.Route : null
                };
                if (newAllFacilitiesItem.widgets.findIndex(d => d.id === newWidget.id) < 0) {
                    newAllFacilitiesItem.widgets.push(newWidget);
                }
            })
        }

        return innerUserConfig;
    }

    private mapWidgets() {
        if (this.authorizationConfig) {
            const sortedWidgets = this.getSortedWidgets();
            
            this.currentConfiguration = this.syncWidgets(this.authorizationConfig, this.currentConfiguration);

            let mergedWidgets = [];
            this.currentConfiguration.userPreferences.facilities
                .filter(f => f.selected)
                .reduce((mergedWidgets, facility) => {
                    facility.widgets.forEach(w => {
                        let mwidget = mergedWidgets.find(m => m.id === w.id)
                        if (!mwidget) {
                            mergedWidgets.push({ ...w });
                        }
                        else {
                            mwidget.enabled = mwidget.enabled || w.enabled;
                            mwidget.default = mwidget.default || w.default;
                        }
                    });
                    return mergedWidgets;

                }, mergedWidgets);

            this.widgetsAvailables = [];

            sortedWidgets.forEach((widget) => {
                let cWidget = mergedWidgets.find(d => d.id === widget.id);
                if (cWidget) {
                    this.widgetsAvailables.push({ ...cWidget, name: widget.name, checked: cWidget.enabled, enabled: true });
                    
                }
            });
            let defaultWidget = this.widgetsAvailables.find(x => x.default);
            if (defaultWidget) {
                let tab = this.tabConfigurationService.getTabById(defaultWidget.id);
                this.defaultWidget = tab.routeUrl;
            }
            else {
                let tabNone = this.tabConfigurationService.getTabNone();
                this.defaultWidget = tabNone.routeUrl;
            }

            this.getCheckedWidgets();
        }
    }

    ngOnChanges(changes: any) {
    }

    checkedWidgetChanged(event: any, widget: any) {

        this.isFormTouched = true;
        const isIvPrepWidget = widget.id === MvdConstants.IVPREP_WIDGET_KEY;
        if (isIvPrepWidget) {
            this.shouldResetIvPrepSettings = true;
        }

        if (this.currentConfiguration.userPreferences) {
            this.currentConfiguration.userPreferences.facilities
                .filter(a => a.selected)
                .forEach(facility => {
                    let currentWidget = facility.widgets.find((a) => a.id == widget.id);
                    if (currentWidget) {
                        currentWidget.enabled = widget.checked;
                    }
                });

            this.getCheckedWidgets();
        }
    }

    changeFacility(event: SelectItem[]) {

        
        this.isFormTouched = false;
        //this.selectedFacility = event.value;
        //this.selectedFacilityName = event.label;
        
        this.displayErrorWidgets = false;
        this.selectedFacilities = undefined;

        let isFacilityChecked = event.some(d => d.value.checked);

        if (isFacilityChecked) {
            this.isFormTouched = true;
        }

        this.currentConfiguration.userPreferences.facilities.forEach(facility => {
            facility.selected = event.some(d => d.value.id === facility.id && d.value.checked)
            if (facility.selected && facility.id != MvdConstants.ALL_FACILITIES_KEY) {
                if (!this.selectedFacilities) {
                    this.selectedFacilities = [];
                }
                this.selectedFacilities.push(`${facility.id}`);
            }
        });

        this.shouldResetIvPrepSettings = this.evaluateShouldResetIvPrepSettings(this.currentConfiguration
            , this.currentFacilitiesSelectedId
            , event.map(f => f.value.id));

        if (this.isStandardUser && this.isInfusionSectionEnabled) {
            this.facilitySelectionComponent.loadData(this.currentConfiguration, this.facilities.map(si => si.value.id), this.selectedFacilities, isFacilityChecked);
        }

        this.mapWidgets();
    }

    private evaluateShouldResetIvPrepSettings(currentConfiguration: any
        , currentFacilitiesSelectedId: string[]
        , selectedFacilitiesIds: string[]): boolean {

        console.log(currentConfiguration, currentFacilitiesSelectedId, selectedFacilitiesIds);
        const isAllFacilitiesCurrentSelection = currentFacilitiesSelectedId.some(s => s === MvdConstants.ALL_FACILITIES_KEY);
        const isAllFacilitiesSelected = selectedFacilitiesIds.some(s => s === MvdConstants.ALL_FACILITIES_KEY);

        if (isAllFacilitiesCurrentSelection && isAllFacilitiesSelected ||
            _.isEqual(_.sortBy(currentFacilitiesSelectedId), _.sortBy(selectedFacilitiesIds))) {
                return false;
            }

            const ivPrepFacilities = currentConfiguration.authorizationConfig
            .filter((a) => a.name !== MvdConstants.AUTHORIZATION_ROOT_ID &&
                this.hasProvider(a.synonyms, MvdConstants.CATO_PROVIDER_NAME) &&
                this.hasPermissions(a.permissions, MvdConstants.IVPREP_WIDGET_KEY));
        const facilityInfo = ivPrepFacilities.find((a) => selectedFacilitiesIds.some(f => f === (a.id || '').toString()));

            return !!(facilityInfo || isAllFacilitiesSelected && ivPrepFacilities.length);
    }

    private hasProvider(synonyms: any[], providerName: string): boolean {
        return synonyms.some((s) => (s.source || '').toLowerCase() === (providerName || '').toLowerCase());
    }

    private hasPermissions(permissions: any[], resourceName: string) {
        return permissions.some((p) => (p.resource || '').toLowerCase() === (resourceName || '').toLowerCase());
    }


    checkedChangeTimeOut(event: any) {
        this.isFormTouched = true;
        if (!event) {
            this.sessionTimeOut = '';
            this.displayRangeError = false;
            this.rangeErrorMessage = '';
        }
    }

    applyConfig() {
        console.log('MedviewConfigurationComponent: applying configuration');
        if (this.currentConfiguration.userPreferences) {
            if (this.validateTimeOut() && ((!this.isStandardUser) || this.validateWidgets()) && this.selectedFacilities && this.selectedFacilities.length > 0) {
                this.loadingData = true;
                if (this.enableTimeOut) {
                    this.currentConfiguration.userPreferences.sessionTimeout = (parseFloat(this.sessionTimeOut) * 60) || 0;
                } else {
                    this.currentConfiguration.userPreferences.sessionTimeout = 0;
                }
                this.currentConfiguration.userPreferences.maskData = this.maskDataEnabled;

                let allFacilitiesSelected = this.currentConfiguration.userPreferences.facilities
                    .find(a => a.id === MvdConstants.ALL_FACILITIES_KEY && a.selected);
                if (allFacilitiesSelected) {
                    this.currentConfiguration.userPreferences.facilities
                        .filter(facility => facility.id !== MvdConstants.ALL_FACILITIES_KEY)
                        .forEach(facility => {
                            facility.widgets.filter(a => a.id.indexOf(this.widgetPrefix) >= 0).forEach(widget => {
                                const w = allFacilitiesSelected.widgets.find(a => a.id === widget.id);
                                widget.enabled = w ? w.enabled : true;
                            });
                        });
                }

                // Add facility filters to current configuration (only for standard users)
                if (this.isStandardUser && this.isInfusionSectionEnabled && this.facilitySelectionComponent.isTouched) {
                    const facilityFilter = this.facilitySelectionComponent.getFacilityFilters(this.selectedFacilities);
                    this.currentConfiguration
                        .userPreferences
                        .filters = { facilityFilters: facilityFilter };
                }

                console.log('MedviewConfigurationComponent: applying configuration: setUserPreferences');
                if (this.shouldResetIvPrepSettings) {
                    this.currentConfiguration.userPreferences = this.resetIvPrepSeetings(this.currentConfiguration.userPreferences);
                }

                this.userConfigurationService.setUserPreferences(this.currentConfiguration.userPreferences)
                    .pipe(
                        take(1)
                    )
                    .subscribe(
                    () => {
                        this.topMenuUserSettingsService.processUserPreferencesMenu(this.currentConfiguration.userPreferences);
                        console.log('MedviewConfigurationComponent: applying configuration: setUserPreferences: SUCCESS');
                        this.loadingData = false;
                        if (this.isStandardUser && this.isInfusionSectionEnabled && this.facilitySelectionComponent.isTouched) {
                            this.facilitySelectionComponent
                                .onSaved(this.currentConfiguration, this.facilities.map(si => si.value.id), this.selectedFacilities);
                        }
                    },
                    () => {
                        console.log('MedviewConfigurationComponent: applying configuration: setUserPreferences: FAILED');
                        this.loadingData = false;
                        if (this.isStandardUser && this.isInfusionSectionEnabled && this.facilitySelectionComponent.isTouched) {
                            this.facilitySelectionComponent
                                .onCancel(this.currentConfiguration, this.facilities.map(si => si.value.id), this.selectedFacilities);
                        }
                    },
                    () => console.log('MedviewConfigurationComponent: applying configuration: setUserPreferences: COMPLETED')
                );

                this.isFormTouched = false;
                const widConf = <WidgetsAuthorization>this.widgetConfigService;
                widConf.refreshWidgetToShow(this.widgetsAvailables.filter(a => a.checked));

                this.applyCompleted();
            }
        }
    }

    private resetIvPrepSeetings(userPreferences: any): any {

        const generalSettings = _.get(userPreferences, 'generalSettings', []);
        if (!generalSettings || !generalSettings.length) {
            return userPreferences;
        }

        const ivPrepSettings = generalSettings.find(s => s.id === MvdConstants.IVPREP_WIDGET_KEY);
        if (!ivPrepSettings) {
            return userPreferences;
        }
        ivPrepSettings.configuration.unitsSettings = null;

        userPreferences
            .generalSettings = generalSettings;

        return userPreferences;
    }

    applyCompleted() {
        console.log('MedviewConfigurationComponent: applying configuration: applyCompleted()');

        this.msgs = [{ severity: 'success', summary: '', detail: this.resources.applyDetail }];
    }

    private validateWidgets() {
        let oneChecked = false;
        this.widgetsAvailables.forEach(widget => {
            if (widget.checked) {
                oneChecked = true;
                return;
            }
        });
        this.displayErrorWidgets = !oneChecked;
        return oneChecked;
    }

    cancelConfig() {
        this.selectedFacilities = undefined;
        this.getConfiguration(this.user, true);
        
        this.selectedFacilityName = '';
        this.isFormTouched = false;
        this.displayErrorWidgets = false;
    }

    onKeyDownTimeOut(event: any) {
        return ((!isNaN(event.key) ||
            event.keyCode === 8 ||
            event.keyCode === 46 ||
            event.keyCode === 37 ||
            event.keyCode === 39) && this.enableTimeOut);
    }

    onKeyUpTimeOut(event: any) {
        this.isFormTouched = true;
        this.sessionTimeOut = event.target.value;
    }

    checkedChangeMaskData() {
        this.isFormTouched = true;
    }

    validateTimeOut() {
        const currentValue = parseInt(this.sessionTimeOut) || 0;
        if (this.enableTimeOut && (currentValue < this.minValueTimeOut || currentValue > this.maxValueTimeOut)) {
            this.displayRangeError = true;
            this.rangeErrorMessage = this.populateRangeErrorMessage();
            return false;
        } else {
            this.displayRangeError = false;
            this.rangeErrorMessage = '';
            return true;
        }
    }

    populateRangeErrorMessage() {
        return this.resources.rangeErrorMessageFormat
            .replace('{{minValueTimeOut}}', this.minValueTimeOut)
            .replace('{{maxValueTimeOut}}', this.maxValueTimeOut);
    }

    onElementChange() {
        this.isFormTouched = true;
    }

    private setResources() {
        this.resources = {
            maskphi: this.resourcesService.resource('maskphi'),
            timeoutUnit: this.resourcesService.resource('timeoutUnit'),
            globalUserSettings: this.resourcesService.resource('globalUserSettings'),
            effectNextSignIn: this.resourcesService.resource('effectNextSignIn'),
            sessionTimeout: this.resourcesService.resource('sessionTimeout'),
            widgetsToDisplay: this.resourcesService.resource('widgetsToDisplay'),
            selectFacility: this.resourcesService.resource('selectFacility'),
            noUnitsAvailable: this.resourcesService.resource('noUnitsAvailable'),
            units: this.resourcesService.resource('units'),
            applyDetail: this.resourcesService.resource('applyDetail'),
            apply: this.resourcesService.resource('apply'),
            cancel: this.resourcesService.resource('cancel'),
            selectAllUnits: this.resourcesService.resource('selectAllUnits'),
            rangeErrorMessageFormat: this.resourcesService.resource('rangeErrorMessageFormat'),
            otherSettings: this.resourcesService.resource('otherSettings'),
            attentionNoticesLabel: this.resourcesService.resource('bD.MedView.Web.Widgets.Attention Notices'),
            continuousInfusionLabel: this.resourcesService.resource('bD.MedView.Web.Widgets.Continuous Infusions'),
            deliveryTrackingLabel: this.resourcesService.resource('bD.MedView.Web.Widgets.Delivery Tracking'),
            doseRequestLabel: this.resourcesService.resource('bD.MedView.Web.Widgets.Dose Requests'),
            ivStatusLabel: this.resourcesService.resource('bD.MedView.Web.Widgets.IV Status'),
            ivPrepLabel: this.resourcesService.resource('bD.MedView.Web.Widgets.IV Prep'),
            clinicalOverviewLabel: this.resourcesService.resource('bD.MedView.Web.Widgets.Clinical Overview'),
            allFacilities: this.resourcesService.resource('allFacilities'),
            userSystemSettingsTitle: this.resourcesService.resource('userSystemSettingsTitle'),
            alarisDataSettings: this.resourcesService.resource('alarisDataSettings'),
            userSystemSettingsHelpText: this.resourcesService.resource('userSystemSettingsHelpText'),
            allFacilitiesOverrideHelpText: this.resourcesService.resource('allFacilitiesOverrideHelpText'),
            allFacilitiesPartialSelectionHelpText: this.resourcesService.resource('allFacilitiesPartialSelectionHelpText'),
            selectAtLeastOneWidget: this.resourcesService.resource('selectAtLeastOneWidget'),
            selectAtLeastOneFacility: this.resourcesService.resource('selectAtLeastOneFacility'),
            edit: this.resourcesService.resource('edit'),
            setDefaultPageText: this.resourcesService.resource('setDefaultPageText'),
            pixysIvPrepSettingsTittle: this.resourcesService.resource('pixysIvPrepSettingsTittle')
        };
    }

    setDefaultWidget(tab: any): void {
        
        this.isFormTouched = true;
        if (this.currentConfiguration.userPreferences) {
            let currentFacilities = this.currentConfiguration.userPreferences.facilities
                .filter(a => a.id === MvdConstants.ALL_FACILITIES_KEY || this.selectedFacilities.some(f => f === a.id));
            if (currentFacilities) {
                currentFacilities.forEach(facility => {
                    facility.widgets.forEach(widget => {
                        if (tab.routeName != 'None' && tab.widgets && tab.widgets.some(w => w === widget.id)) {
                            widget.default = true;
                            widget.route = tab.routeUrl;
                        } else {
                            widget.default = false;
                            widget.route = null;
                        }
                    });
                });
            }
        }
    }

    private getCheckedWidgets(): void {
        //this.widgetsChecked = this.widgetsAvailables.filter(widget => widget.checked);

        let selectedWidgets = this.widgetsAvailables.filter(widget => widget.checked).map(widget => {
            if(widget.checked){
                return widget.id;
            }
        });

        if (!selectedWidgets || selectedWidgets.length === 0) {
            this.displayErrorWidgets = true;
        } else {
            this.displayErrorWidgets = false;
        }

        this.widgetsChecked = this.tabConfigurationService.getTabs(selectedWidgets);
    }

    disableApplyButton() {
        return !this.isFormTouched ||
            !this.selectedFacilities || this.selectedFacilities.length === 0 ||
            this.displayErrorWidgets;
    }
}
