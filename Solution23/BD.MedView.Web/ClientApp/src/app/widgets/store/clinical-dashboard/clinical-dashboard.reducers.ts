import { MedMinedModels } from '../../shared/medmined-models';
import { ClinicalDashboardActions, ClinicalDashboardActionTypes } from './clinical-dashboard.actions';
import { MvdListElement, ColumnOption } from '../../shared/mvd-models';
import * as _ from 'lodash';

export interface ClinicalDashboardState {
    dataSummary: MedMinedModels.AlertSummariesResponse,
    alertDetailsColumnConfiguration: ColumnOption[],
    currentAlertDetailsData?: MedMinedModels.AlertsDetailsHeaderResults,
    itemSelected?: MvdListElement,
    itemSelectedFromSummaryWidget: boolean,
    selectedPriorityId: string
}

export const initialClinicalOverviewState: ClinicalDashboardState = {
    dataSummary: undefined,
    alertDetailsColumnConfiguration: [],
    itemSelectedFromSummaryWidget: false,
    selectedPriorityId: '-'
};

export function clinicalDashboardReducer(state = initialClinicalOverviewState, action: ClinicalDashboardActions): ClinicalDashboardState {
    switch (action.type) {
        case ClinicalDashboardActionTypes.ClinicalDashboardItemSelected:
            return {
                ...state,
                itemSelected: { ...action.payload.itemSelected },
                itemSelectedFromSummaryWidget: action.payload.fromSummary
            };
        case ClinicalDashboardActionTypes.ClinicalDashboardDetailsLoaded:
            return {
                ...state,
                currentAlertDetailsData: { ...action.payload.data }
            };
        case ClinicalDashboardActionTypes.ClinicalDashboardClearData:
            return {
                ...initialClinicalOverviewState,
                itemSelected: state.itemSelected ? state.itemSelected : undefined
            };
        case ClinicalDashboardActionTypes.ClinicalAlertSummaryDataLoaded:
            return {
                ...state,
                dataSummary: { ...action.payload.data }
            };
        case ClinicalDashboardActionTypes.ClinicalAlertSummaryPriorityFilter:
            return {
                ...state,
                selectedPriorityId: action.payload.selectedPriorityFilter
            };
        case ClinicalDashboardActionTypes.ClinicalDashboardColumnConfig:
            return {
                ...state,
                alertDetailsColumnConfiguration: action.payload.columnOptions
            };
        case ClinicalDashboardActionTypes.ClinicalDashboardInitialDataLoad:
            return {
                ...state,
                itemSelected: state.itemSelected ? { ...state.itemSelected } : undefined,
                alertDetailsColumnConfiguration: action.payload.columnOptions,
                dataSummary: { ...action.payload.dataSummary }
            };
        default:
            return state;
    }
}
