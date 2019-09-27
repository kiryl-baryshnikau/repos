import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClinicalDashboardState } from './clinical-dashboard.reducers';


export const selectClinicalDashboardState = createFeatureSelector<ClinicalDashboardState>("clinicalDashboard");

export const selectDataSummary = createSelector(
    selectClinicalDashboardState,
    (state) => state.dataSummary
);

export const selectCurrentAlertDetailsData = createSelector(
    selectClinicalDashboardState,
    (state) => state.currentAlertDetailsData
);

export const selectCurrentAlertDetailsWConfig = createSelector(
    selectClinicalDashboardState,
    (state) => ({
        columns: state.alertDetailsColumnConfiguration,
        data: state.currentAlertDetailsData,
        selectedPriorityId: state.selectedPriorityId
    })
);

export const selectCurrentItemSelected = createSelector(
    selectClinicalDashboardState,
    (state) => state.itemSelected
);

export const selectItemSelectedFromSummary = createSelector(
    selectClinicalDashboardState,
    (state) => ({
        itemSelected: state.itemSelected,
        itemSelectedFromSummaryWidget: state.itemSelectedFromSummaryWidget
    })
);

export const selectPrioritySelectedAndSummary = createSelector(
    selectClinicalDashboardState,
    (state) => ({
        selectedPriorityId: state.selectedPriorityId,
        dataSummary: state.dataSummary,
        itemSelected: state.itemSelected,
        columnConfig: state.alertDetailsColumnConfiguration,
        itemSelectedFromSummaryWidget: state.itemSelectedFromSummaryWidget
    })
);
