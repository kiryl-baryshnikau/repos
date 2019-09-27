import { MvdListData, ColumnOption } from './mvd-models';
import { SelectItem } from 'primeng/primeng';

export interface MedMinedAlert {
    id: string;
    patientId: string;
    priority: string;
    type: {
        id: string,
        name: string
    };
    date: Date;
}
export declare module MedMinedModels {
    export interface FacilitiesResponse {
        facilities: {
            facility_id: number;
            facility_name: string;
        }[];
    }

    export type FacilitySelectItem = {
        label: string;
        value: {
            id: string;
            name: string;
        }
    }

    export type SummaryCategory = {
        category: string;
        selected: boolean;
        summary: MvdListData;
    }

    export interface AlertSummaryItem {
        category: string;
        title: string;
        facility_id: number;
        total_alerts: number;
        priorities: AlertSummaryPriorityCount[];
        statuses: any[];
        ownership: string;
        updated_on: string;
        units?: any[];
        masterFacility?: string;
        priorityText?: string;
        subscriptionType: string;
    }

    export interface AlertSummariesResponse {
        summaries: AlertSummaryItem[];
    }

    export interface AlertSummaryPriorityCount {
        priority: string;
        new: number;
        read: number;
        pending: number;
        documented: number;
    }

    export interface Patient {
        name: string;
        account_number: string;
        mrn: string;
        born_on: string;
        location: string;
        bed: string;
    }

    export interface Drug {
        prescription_number: string;
        placer_order_number?: any;
        drug: string;
        started_on: Date;
        stopped_on: Date;
        days: number;
        route: string;
        mapped_route: string;
        give_per?: any;
        give_rate_amount: number;
        give_rate_units: string;
        give_strength: number;
        give_strength_units: string;
        give_strength_volume?: any;
        give_strength_volume_units?: any;
        ordering_physician?: string;
        components?: Component[];
    }



    export interface AlertDetailsHeader {
        alert_id: number;
        facility_id: number;
        priority: string;
        status: string;
        ownership: string;
        created_on: Date;
        updated_on: Date;
        patient: Patient;
        drugs: Drug[];
        subscription_type: string;
        hasWriteAccess?: boolean;
    }

    export interface AlertsDetailsHeaderResults {
        page_number: number;
        page_size: number;
        category: string;
        title: string;
        alerts: AlertDetailsHeader[];
    }

    export interface AlertsDetailsHeaderResponse {
        results: AlertsDetailsHeaderResults;
    }

    export interface AlertDetailHeaderItem {
        id: string;
        patientName: string;
        patientId: string;
        status: string;
        drug: string;
        dose: string;
        interval: string;
        location: string;
        bed: string;
        date: string;
        category: string;
        mmFacilityId: string;
        masterFacility?: string;
        originalStatus: string;
    }

    export interface AlertCategory {
        category: string;
        alerts: Alert[];
    }

    export interface Alert {
        title: string;
        status: string;
    }

    export interface AlertSubscriptionItem {
        category: string;
        title: string;
        status: string;
    }

    export interface AlertsSubscriptions {
        facility_id: string;
        subscriptions: AlertSubscriptionItem[];
    }

    export interface AlertsSubscriptionsView {
        subscribedAlerts: SelectItem[],
        unsubscribedAlerts: SelectItem[]
    }

    export interface AlertStatusUpdateRequest {
        alert_id: string;
        status: string;
    }

    export interface Patient {
        name: string;
        account_number: string;
        mrn: string;
        born_on: string;
        location: string;
        bed: string;
    }

    export interface LabResult {
        test_name: string;
        resulted_date: Date;
        raw_value: string;
        interpretation?: any;
        reference_range: string;
    }

    export interface Component {
        drug_code: string;
        med_id: string;
    }


    export interface Susceptibility {
        interpretation: string;
        drug: string;
    }

    export interface Organism {
        resulted_date: Date;
        organism: string;
        mapped_source_test: string;
        site_test: string;
        susceptibilities: Susceptibility[];
    }

    export interface AlertDetail {
        alert_id: number;
        facility_id: number;
        priority: string;
        status: string;
        ownership: string;
        created_on: Date;
        updated_on: Date;
        patient: Patient;
        lab_results: LabResult[];
        drugs: Drug[];
        organisms: Organism[];
        subscription_type: string;
    }

    export interface IdInfo {
        idKind: string;
        value: string;
    }

    export interface ConcentrationInfo {
        amount: string;
        amountUnits: string;
        volume?: string;
        volumeUnits?: string;
    }

    export interface PatientInfo {
        id: string;
        medMinedfacilityId?: string;
        idInfo?: IdInfo[];
        patientFirstName?: string;
        patientLastName?: string;
        placerOrderNumber?: string;
        primaryDrugId?: string;
        primaryDrugName?: string;
        medicationStartDateTime?: string;
        concentration?: ConcentrationInfo;
        medMinedAlert?: MedMinedAlertHeader[];
    }

    export interface PageInfoList {
        pageSource: string;
        pageInfo: PatientInfo[];
    }

    export interface MedMinedAlertsRequestData<T> {
        widgetKey: string;
        dataset: T[];
        recordsPerPage: number;
        startPage: number;
    }

    export interface MedMinedAlertHeader {
        medMinedfacilityId: string;
        alertId: string;
        alertCategory: string;
        alertTitle: string;
        status: string;
    }

    export interface MedMinedSecondaryDataItem {
        uuid?: string;
        medMinedFacilityId?: string;
        medMinedAlerts: MedMinedAlertHeader[];
    }

    export interface SessionConfiguration {
        options: any;
        columns: ColumnOption[];
        filters: ColumnOption[];
        expandedAlertsIds: string[];
        expandedCategories?: string[];
    }
}
