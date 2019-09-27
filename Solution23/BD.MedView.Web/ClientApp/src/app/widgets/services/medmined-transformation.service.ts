import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { SelectItem } from 'primeng/primeng';
import { MedMinedModels } from '../shared/medmined-models';
import { MvdListElement, ColumnOption } from '../shared/mvd-models';
import { DataFormatPipe } from '../pipes/mvd-data-format.pipe';
import { MvdConstants } from '../shared/mvd-constants';
import { ResourceService } from 'container-framework';
import { SortingService } from './mvd-sorting-service';
import { FacilityLookUpService } from '../../services/facility-look-up.service';
import * as _ from 'lodash';
import { RolePermissionsValidatorService } from './mvd-role-permissions.service';

enum MaskField {
    patientName,
    patientId
}


@Injectable()
export class MedminedTransformationService {
    private facilitySourceProvider = MvdConstants.MEDMINED_PROVIDER_NAME;

    private resources;

    private setResources() {
        this.resources = {
            oldestValue: this.resourceService.resource('oldest'),
            unknown: this.resourceService.resource('unknown'),
            facility: this.resourceService.resource('facility'),
            category: this.resourceService.resource('category'),
            patientName: this.resourceService.resource('patientName'),
            patientId: this.resourceService.resource('patientId'),
            status: this.resourceService.resource('status'),
            drug: this.resourceService.resource('drug'),
            dose: this.resourceService.resource('dose'),
            interval: this.resourceService.resource('interval'),
            location: this.resourceService.resource('location'),
            bed: this.resourceService.resource('bed'),
            date: this.resourceService.resource('date'),
            priority: this.resourceService.resource('priority'),
            alertCategory: this.resourceService.resource('alertCategory'),
            alertType: this.resourceService.resource('alertType'),
            new: this.resourceService.resource('new'),
            read: this.resourceService.resource('acknowledged'),
            pending: this.resourceService.resource('pending'),
            documented: this.resourceService.resource('documented'),
        };
    }

    constructor(
        private dataFormat: DataFormatPipe,
        private sortingService: SortingService,
        private facilityLookUpService: FacilityLookUpService,
        private resourceService: ResourceService,
        private rolePermissionsValidator: RolePermissionsValidatorService
    ) {
        
    }


    public dataSummaryTransform(summaries: MedMinedModels.AlertSummaryItem[]): MedMinedModels.SummaryCategory[] {
        if (!summaries)
            return [];

        this.setResources();
        let summary = summaries.reduce((summary: MedMinedModels.SummaryCategory[], item: MedMinedModels.AlertSummaryItem) => {
            
            let catItem = summary.find(ci => ci.category === item.category);            


            let expandedItems = [];

            if (!item.priorities && item.priorities.length === 0) {
                return summary;
            }

            item.priorities.forEach(d => {
              
                let totalCount = d.new + d.read + d.documented + d.pending;
                if (totalCount === 0) {
                    return;
                }
                if (d.priority === 'None') {
                    d.priority = 'Low';
                }
                    let newItem: MvdListElement = {
                        key: `title=${item.title}&category=${item.category}&priority=${d.priority}&ownership=${item.ownership}`,
                        priority: item.ownership === 'System' ? 'S' : d.priority.substr(0, 1),
                        counter: {
                            total: totalCount,
                            new: d.new || 0,
                            read: d.read || 0,
                            documented: d.documented || 0,
                            pending: d.pending || 0
                        },
                        title: item.title,
                        label: `${this.resources.oldestValue}:`,
                        value: `${this.dataFormat.transform(this.getDateDiff(item.updated_on), MvdConstants.PIPE_TYPES_TIME)}`,
                        facilityKeys: [`${item.facility_id}`],
                        priorityText: d.priority
                    }

                    if (!catItem) {
                        expandedItems.push(newItem);
                    } else {
                        let currentItem = catItem.summary.data.find(d => d.key === newItem.key);
                        if (currentItem) {
                            currentItem.counter.total += newItem.counter.total;
                            currentItem.counter.new += newItem.counter.new;

                            currentItem.counter.read += newItem.counter.read;
                            currentItem.counter.documented += newItem.counter.documented;
                            currentItem.counter.pending += newItem.counter.pending;

                            if (currentItem.facilityKeys.indexOf(`${item.facility_id}`) < 0) {
                                currentItem.facilityKeys.push(`${item.facility_id}`);
                            }
                        }
                        else {
                            catItem.summary.data.push(newItem);
                        }
                    }
                
            });

            if (!catItem) {
                summary.push({
                    category: item.category,
                    selected: false,
                    summary: {
                        data: [...expandedItems]
                    }
                });
            }

            return summary;

        }, []);

        summary = summary.filter(d => d.summary.data && d.summary.data.length > 0)

        summary = this.sortingService.sortDataByField("category", 1, "alphabetical", summary);
        summary.forEach(d => {
            d.summary.data = _.sortBy(d.summary.data, [function (s) {
                return s.priority === 'S' ? 1 :
                    s.priority === 'H' ? 2 :
                        s.priority === 'M' ? 3 :
                            4;
            }, 'title']);

        });
        return summary;
    }

    alertsDetailsTransform(alerts: MedMinedModels.AlertDetailsHeader[]
        , category: string
        , userPreferences: any): MedMinedModels.AlertDetailHeaderItem[] {

        if (!alerts || !userPreferences) {
            return [];
        }

        this.setResources();

        const maskData = userPreferences.userPreferences.maskData === true;

        const authorizationConfig = _.get(userPreferences, 'authorizationConfig', [])
                                    .filter(item => item.name !== MvdConstants.AUTHORIZATION_ROOT_ID);

        const alertsDetails = alerts.map((item: MedMinedModels.AlertDetailsHeader) => ({
            id: `${item.alert_id}`,
            patientName: this.maskPHI((item.patient === null || item.patient.name === undefined) ?
                                                    undefined :
                                                    item.patient.name, MaskField.patientName, maskData),
            patientId: this.maskPHI((item.patient === null || item.patient === undefined) ?
                                                    undefined :
                                                    item.patient.mrn, MaskField.patientId, maskData),
            status: this.resources[item.status.toLowerCase()],
            drug: item.drugs.length > 0 ? item.drugs[0].drug : '',
            dose: this.mapDose(item),
            orderid: item.drugs.length > 0 ? item.drugs[0].placer_order_number || item.drugs[0].prescription_number || '' : '',
            interval: this.mapInterval(item),
            location: (item.patient === null || item.patient.location === undefined) ? '' : item.patient.location,
            bed: (item.patient === null || item.patient.bed === undefined) ? '' : item.patient.bed,
            date: this.toLocalDate(item.created_on),
            category,
            mmFacilityId: `${item.facility_id}`,
            masterFacility: this.getMasterFacility(`${item.facility_id}`, userPreferences) || this.resources.unknown,
            subscriptionType: item.subscription_type,
            priority: item.priority,
            hasWriteAccess: this.mapWriteAccess(item.facility_id, authorizationConfig),
            originalStatus: this.resources[item.status.toLowerCase()]
        }));

        return alertsDetails;

    }

    mapWriteAccess(facilityId: number, authorizationConfig: any[]): boolean {
        return this.rolePermissionsValidator.hasWriteAccess(MvdConstants.CLINICALOVERVIEW_WIDGET_KEY, authorizationConfig,
            `${facilityId}`, MvdConstants.MEDMINED_PROVIDER_NAME);
    }

    public getMasterFacility(facilityId, { authorizationConfig }) {
        return this.facilityLookUpService.masterFacilityNameLookUp(facilityId,
            authorizationConfig,
            this.facilitySourceProvider);
    }

    private mapDose(item: MedMinedModels.AlertDetailsHeader): string {
        if (item && item.drugs && item.drugs.length > 0)
            return item.drugs[0].give_strength && item.drugs[0].give_strength_units
                ? `${item.drugs[0].give_strength} ${item.drugs[0].give_strength_units}`
                : this.resources.unknown;
        return ''
    }

    private mapInterval(item: MedMinedModels.AlertDetailsHeader): string {
        if (item && item.drugs && item.drugs.length > 0)
            return item.drugs[0].give_rate_amount && item.drugs[0].give_rate_units
                ? `${item.drugs[0].give_rate_amount} ${item.drugs[0].give_rate_units}`
                : this.resources.unknown;

        return '';
    }

    private toLocalDate(date: Date): string {
        let isoDate = moment(date);
        let utcDate = isoDate.utcOffset(isoDate.utcOffset());
        return this.dataFormat.transform(utcDate, 'localtime');
    }

    private getDateDiff(isoDate: string): number {
        let lastUpdateIso = moment(isoDate);
        let dateDiff = moment(new Date()).utc().utcOffset("+0").diff(lastUpdateIso.utcOffset(lastUpdateIso.utcOffset()));
        return dateDiff;

    }

    public getAlertsSubscriptions(data: MedMinedModels.AlertsSubscriptions[]): MedMinedModels.AlertsSubscriptionsView {
        if (!data)
            return { subscribedAlerts: [], unsubscribedAlerts: [] };

        let alertsSubscriptions = data.reduce((subs: MedMinedModels.AlertsSubscriptionsView, alertSubscription) => {

            alertSubscription.subscriptions.forEach((item) => {
                if (item.status === "Enabled") {
                    if (subs.subscribedAlerts.findIndex(i => i.value.category === item.category && i.value.title === item.title) < 0) {
                        subs.subscribedAlerts.push(this.transformAlertSubscriptionItem(item));
                    }
                }
                else {
                    if (subs.unsubscribedAlerts.findIndex(i => i.value.category === item.category && i.value.title === item.title) < 0) {
                        subs.unsubscribedAlerts.push(this.transformAlertSubscriptionItem(item));
                    }
                }
            });
            return subs;

        }, { subscribedAlerts: [], unsubscribedAlerts: [] });

        return alertsSubscriptions;
    }

    public transformAlertSubscriptionItem(item: MedMinedModels.AlertSubscriptionItem): SelectItem {
        return {
            label: `${item.category} - ${item.title}`,
            value: {
                category: item.category,
                title: item.title
            }
        };
    }

    private maskPHI(value: string, field: MaskField, mask: boolean = false): string {
        if (!mask) {
            return value;
        }
        if (typeof value === "undefined" || value == null || value == "") {
            return value;
        }
        if (field == MaskField.patientId) {
            return "";
        }
        if (field == MaskField.patientName) {
            let firstName = "";
            //"Last_Name"
            let lastName = value.trim();
            //"Last_Name, First_Name"
            let index = value.indexOf(',');
            if (index != -1) {
                lastName = value.substr(0, index).trim();
                firstName = value.substr(index + 1).trim();
            }
            else {
                //"First_Name Last_Name"
                index = value.indexOf(' ');
                if (index != -1) {
                    firstName = value.substr(0, index).trim();
                    lastName = value.substr(index + 1).trim();
                }
            }
            let maskedPatientFirstName = (firstName || "").substr(0, 2);
            return (lastName || "").substr(0, 1) + (maskedPatientFirstName ? ", " + maskedPatientFirstName : "");
        }
        return value;
    }

    processFacilities(userConfig) {
        let authorizationConfig = userConfig.authorizationConfig;
        let facilitiesConfig = userConfig.userPreferences.facilities;
        let facilities = this.translateFacilityKeys(facilitiesConfig, authorizationConfig);
        return { facilities, userConfig };
    }

    private translateFacilityKeys(masterFacilities: any[], authorizationConfig: any) {
        let facilityKeys = [];
        let allFacilities = masterFacilities.find(x => x.id === MvdConstants.ALL_FACILITIES_KEY);

        masterFacilities.filter(a => a.id !== MvdConstants.ALL_FACILITIES_KEY && (allFacilities.selected || a.selected)).forEach(master => {
            let facilityKey = this.translateMasterToSynonym(master.id, authorizationConfig);
            if (facilityKey) {
                facilityKeys.push(facilityKey);
            }
        });
        return facilityKeys;
    }

    private translateMasterToSynonym(masterFacilityName: string, authConfiguration: any): string {
        if (!masterFacilityName || !authConfiguration) {
            return '';
        }
        if (this.isProviderRegistered(masterFacilityName, authConfiguration, MvdConstants.MEDMINED_PROVIDER_NAME) ||
            masterFacilityName === MvdConstants.ALL_FACILITIES_KEY) {
            return this.facilityLookUpService
                .nativeFacilityLookUp(masterFacilityName, authConfiguration, MvdConstants.MEDMINED_PROVIDER_NAME);
        }
        return '';
    }

    private isProviderRegistered(masterFacility, authConfiguration: any, providerName: string) {
        let masterFacilityInfo = authConfiguration.find((config: any) => config.id == masterFacility);
        if (!masterFacilityInfo) {
            return false;
        }
        let nativeFacility = masterFacilityInfo
            .synonyms
            .find(synonym => (synonym.source || "").toLocaleLowerCase() === providerName);

        return !!nativeFacility;
    }

    public mapDrugDose(drug: MedMinedModels.Drug): string {
        return drug.give_strength && drug.give_strength_units
            ? `${drug.give_strength} ${drug.give_strength_units}`
            : this.resources.unknown;

    }

    public mapDrugInterval(drug: MedMinedModels.Drug): string {
        return drug.give_rate_amount && drug.give_rate_units
            ? `${drug.give_rate_amount} ${drug.give_rate_units}`
            : this.resources.unknown;
    }

    public getDrugComponents(components: MedMinedModels.Component[]) {
        let stringComponents: string = '';
        if(!components) {
            return stringComponents;
        }
        components.forEach((d) => {
            if (stringComponents !== '')
                stringComponents += '<br />';
            stringComponents += `${d.drug_code}: ${d.med_id}`;
        })
        return stringComponents;
    }

}
