import { Action } from "@ngrx/store";
import { MedMinedAlert, MedMinedModels } from "../../shared/medmined-models";
import { MvdListElement, ColumnOption } from "../../shared/mvd-models";

export enum ClinicalDashboardActionTypes {
    
    ClinicalDashboardClearData = '[Clinical Dashboard Component] Data Cleared',
    ClinicalDashboardItemSelected = '[Clinical Dashboard Summary] Item Selected',
    ClinicalDashboardDetailsRequested = '[Clinical Dashboard Component] Item Selected',
    ClinicalDashboardDetailsLoaded = '[Clinical Dashboard Summary] Details Data Loaded',
    ClinicalAlertSummaryDataLoaded = '[Clinical Alert Summary] Summary data loaded',
    ClinicalAlertSummaryPriorityFilter = '[Clinical Alert Summary] Filter summary data',
    ClinicalDashboardColumnConfig = '[Clinical Overview Datatable] Column configuration loaded',
    ClinicalDashboardInitialDataLoad = '[Clinical Overview] Set initial data'
}


export class ClinicalDashboardClearData implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalDashboardClearData;
}

export class ClinicalDashboardItemSelected implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalDashboardItemSelected;

    constructor(public payload: { itemSelected: MvdListElement, fromSummary: boolean }) {

    }
}

export class ClinicalDashboardDetailsRequested implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalDashboardDetailsRequested;
}

export class ClinicalDashboardDetailsLoaded implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalDashboardDetailsLoaded;

    constructor(public payload: { data: MedMinedModels.AlertsDetailsHeaderResults }) {

    }
}

export class ClinicalAlertSummaryDataLoaded implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalAlertSummaryDataLoaded;

    constructor(public payload: { data: MedMinedModels.AlertSummariesResponse }) {

    }
}

export class ClinicalAlertSummaryPriorityFilter implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalAlertSummaryPriorityFilter;

    constructor(public payload: { selectedPriorityFilter: string }) {

    }
}

export class ClinicalDashboardColumnConfig implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalDashboardColumnConfig;

    constructor(public payload: { columnOptions: ColumnOption[] }) {

    }
}

export class ClinicalDashboardInitialDataLoad implements Action {
    readonly type = ClinicalDashboardActionTypes.ClinicalDashboardInitialDataLoad;

    constructor(public payload: { columnOptions: ColumnOption[], dataSummary: MedMinedModels.AlertSummariesResponse }) {

    }
}



export type ClinicalDashboardActions =
    ClinicalDashboardClearData
    | ClinicalDashboardItemSelected
    | ClinicalDashboardDetailsLoaded
    | ClinicalDashboardDetailsRequested
    | ClinicalAlertSummaryDataLoaded
    | ClinicalAlertSummaryPriorityFilter
    | ClinicalDashboardColumnConfig
    | ClinicalDashboardInitialDataLoad;
