import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { DataTransformationService } from './services/mvd-data-transformation-service';
import { ContinuousInfusionsTransformationService } from './medview/continuous-infusions/mvd-continuous-infusions-transformation.service';
import { ContinuousInfusionsConfigurationService } from './medview/continuous-infusions/mvd-continuous-infusions-configuration.service';
import { MvdOrderService } from './medview/continuous-infusions/mvd-order-service.service';
import { ConfigurationService } from './services/mvd-configuration-service';
import { PersistentConfigurationService } from './services/mvd-persistent-configuration.service';
import { DataConfigurationService } from './services/mvd-data-configuration.service';
import { SortingService } from './services/mvd-sorting-service';
import { InfusionDataFiltersService } from './services/mvd-infusion-data-filters.service';
import { DeliveryTrackingConfigurationService } from './medview/delivery-tracking/shared/mvd-delivery-tracking-configuration.service';
import { DeliveryTrackingTransformationService } from './medview/delivery-tracking/shared/mvd-delivery-tracking-data-transformation.service';
import { DispensingDataTransformationService } from './services/mvd-dispensing-data-transformation-service';
import { DoseRequestTransformationService } from './medview/dose-request/shared/mvd-dose-request-transformation.service';
import { DoseRequestDetailTransformationService } from './medview/dose-request/shared/mvd-dose-request-detail-transformation.service';
import { DoseRequestDetailConfigurationService } from './medview/dose-request/shared/mvd-dose-request-detail-configuration.service';
import { AttentionNoticesTransformationService } from './medview/attention-notices/shared/mvd-attention-notices-transformation.service';
import { AttentionNoticesConfigurationService } from './medview/attention-notices/shared/mvd-attention-notices-configuration.service';
import { MvdCfwConfigurationService } from './services/mvd-cfw-configuration.service';
import { MvdFacilitySelectionTransformService } from './services/mvd-facility-selection-transformation.service';

import { AttentionNoticesConfiguration } from './medview/attention-notices/attention-notices-configuration/mvd-attention-notices-configuration.component';
import { AttentionNoticesExtendedViewComponent } from './medview/attention-notices/attention-notices-extendedview/mvd-attention-notices-extendedview.component';
import { AttentionNoticesItemComponent } from './medview/attention-notices/attention-notices-extendedview/mvd-attention-notices-item.component';
import { FacilitySelectionComponent } from './medview/configuration/medview-facility-selection/facility-selection.component';
import { IVStatusConfigurationComponent } from './medview/configuration/iv-status-configuration/mvd-iv-status-configuration.component';
import { ContinuousInfusionsConfigurationComponent } from './medview/configuration/continuos-infusions-configuration/mvd-continuous-infusions-configuration.component';

import { SearchBox } from './shared/search-box/mvd-search-box.component';
import { TextTooltipComponent } from './shared/text-tooltip/mvd-text-tooltip.component';
import { MvdListPrioritiesComponent } from './shared/list-component/mvd-list-priorities.component';
import { ColumnToggle } from './shared/filters/mvd-column-toggle.component';
import { DateRangePicker } from './shared/filters/mvd-date-range-picker.component';
import { DataFormatPipe } from './pipes/mvd-data-format.pipe';

import { SharedModule} from 'primeng/primeng';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { ListboxModule } from 'primeng/listbox';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { SpinnerModule } from 'primeng/spinner';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { TreeModule } from 'primeng/tree';
import { GrowlModule } from 'primeng/growl';
import { DataTableModule } from 'primeng/datatable';

import { MedViewWidgetsService } from './services/widgets.service';
import { WidgetsList } from './services/widgets.service';
import { CollapseModule, BsDropdownModule, ButtonsModule, TooltipModule, ModalModule, BsModalService } from 'ngx-bootstrap';
import { AlertModule } from 'ngx-bootstrap/alert';
import { MultipleValueFilter } from './shared/multi-value-filter/mvd-column-multiple-value.component';
import { MultipleValueFilterComponent } from './shared/multi-value-filter-new/mvd-column-multiple-value-new.component';
import { RadioButtonGroupComponent } from './shared/radio-button-group/mvd-radio-button-group.component';
import { GuardRailAlertsModule } from './medview/iv-status/guardrailcom/mvd-guardrail-alerts.module';
import { TimeUntilEmptyWarningsComponent } from './medview/iv-status/time-until-empty-warnings/mvd-time-until-empty-warnings.component';
import { AttentionNoticesDataTableComponent } from './medview/attention-notices/attention-notices-detail/mvd-attention-notices-datatable.component';
import { AttentionNoticesSummaryComponent } from './medview/attention-notices/attention-notices-summary/mvd-attention-notices-summary.component';
import { RadioButtonListComponent } from './shared/radio-button-list/radio-button-list.component';
import { CheckboxListComponent } from './shared/checkbox-list/checkbox-list.component';
import { ButtonSelectionComponent } from './shared/button-selection/button-selection.component';
import { CheckboxPicklistComponent } from './shared/checkbox-picklist/mvd-checkbox-picklist.component';
import { WidgetToolbarComponent } from './shared/widget-toolbar/widget-toolbar.component';
import { SlidingPanelComponent } from './shared/sliding-panel/mvd-sliding-panel.component';
import { ExportTableComponent } from './shared/export-table/mvd-export-table.component';
import { MvdTimeTransformService } from './services/mvd-time-transform.service';

import { MedviewConfigurationComponent } from './medview/configuration/medview-configuration/medview-configuration.component';
import { MedviewAuthorizationComponent } from './medview/configuration/medview-authorization/medview-authorization.component';
import { MedviewFacilityManagementComponent } from './medview/configuration/medview-facility-management/medview-facility-management.component';
import { MedViewSystemAdminConfigComponent } from './medview/configuration/medview-system-admin/medview-system-admin.component';

import { DoseRequestDetailComponent } from './medview/dose-request/dose-request-detail/mvd-dose-request-detail.component';
import { DoseRequestSummaryComponent } from './medview/dose-request/dose-request-detail/dose-request-summary/mvd-dose-request-summary.component';
import { DoseRequestTableComponent } from './medview/dose-request/dose-request-detail/dose-request-table/mvd-dose-request-table.component';
import { DispensingFacilityKeyTranslatorService } from './services/mvd-dispensing-facility-key-translator.service';
import { DashboardHeaderService } from './services/mvd-dashboard-header.service';
import { PorletCountHandlerService } from './services/mvd-porletcount-handler.service';
import { SystemAdminConfigurationService } from './medview/configuration/medview-system-admin/system-admin-configuration.service';
import { FacilitySelectionDataService } from './medview/configuration/medview-facility-selection/facility-selection-data.service';

import { MvdFacilitymgmtModalComponent } from './medview/configuration/mvd-facilitymgmt-modal/mvd-facilitymgmt-modal.component';
import { MasterFacilityModalComponent } from './medview/configuration/mvd-facilitymgmt-modal/mvd-masterfacility-modal.component';
import { FacilityMappingModalComponent } from './medview/configuration/mvd-facilitymgmt-modal/mvd-facilitymapping-modal.component';
import { FacilityManagementService } from './services/mvd-facility-management.service';
import { FacilityManagementTransformationService } from './services/mvd-facility-management-transformation.service';
import { DisableDatasourceModalComponent } from './medview/configuration/medview-facility-management/mvd-disabledatasource-dialog.component';
import { MvdAdtInformationModalComponent } from './medview/iv-status/adt-information-modal/mvd-adt-information-modal.component';
import { WarningDialogComponent } from './medview/iv-status/warning-dialog/mvd-warning-dialog.component';

import { IvPrepTableComponent } from './medview/iv-prep/iv-prep-table/mvd-iv-prep-table.component';
import { IvPrepTransformationService } from './medview/iv-prep/mvd-iv-prep-transformation.service';
import { IvPrepConfigurationService } from './medview/iv-prep/mvd-iv-prep-configuration.service';
import { IvPrepBtnfiltersComponent } from './medview/iv-prep/iv-prep-btnfilters/iv-prep-btnfilters.component';
import { IvPrepIconsComponent } from './medview/iv-prep/iv-prep-icons/iv-prep-icons.component';
import { IvPrepTableIconsComponent } from './medview/iv-prep/iv-prep-icons/iv-prep-table-icons.component';
import { StateMappingConfigurationService } from './services/mvd-state-mapping-configuration.service';
import { CatoDataFiltersService } from './medview/iv-prep/mvd-cato-data-filters.service';
import { IvPrepDlgService } from './medview/iv-prep/iv-prep-confirm-dlg/iv-prep-dlg.service';
import { IvPrepConfirmDlgContentComponent } from './medview/iv-prep/iv-prep-confirm-dlg/iv-prep-confirm-content.component';
import { IvPrepErrorDlgContentComponent } from './medview/iv-prep/iv-prep-confirm-dlg/iv-prep-error-dlg-content.component';
import { HoursFrameFilterComponent } from './shared/hours-frame-filter/mvd-hours-frame-filter.component';
import { IvPrepConfigurationComponent } from './medview/configuration/iv-prep-configuration/mvd-iv-prep-configuration.component';
import {IvPrepSystemConfigurationService} from
    './medview/configuration/iv-prep-configuration/mvd-iv-prep-system-configuration.service';
import { IvPrepConfigurationDialogComponent } from './medview/configuration/iv-prep-configuration-dialog/iv-prep-configuration-dialog.component';
import { IvPrepSettingsComponent } from './medview/iv-prep/iv-prep-settings/iv-prep-settings.component';

import { reducers, metaReducers } from './store/index';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { environment } from '../../environments/environment.prod';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ClinicalDashboardEffects } from './store/clinical-dashboard/clinical-dashboard.effects';
import { ClinicalOverviewSummaryComponent } from './medview/clinical-overview/clinical-overview-summary/clinical-overview-summary.component';
import { ClinicalOverviewDatatableComponent } from './medview/clinical-overview/clinical-overview-datatable/clinical-overview-datatable.component';
import { ClinicalOverviewFormComponent } from './medview/clinical-overview/clinical-overview-form/clinical-overview-form.component';
import { ClinicalOverviewPatientFormComponent } from './medview/clinical-overview/clinical-overview-patient-form/clinical-overview-patient-form.component';
import { ClinicalOverviewListComponent } from './medview/clinical-overview/clinical-overview-summary/clinical-overview-list.component';
import { MvdMedMinedDataService } from './services/mvd-medmined-data.service';
import { ProviderFacilitiesDataService } from './medview/configuration/medview-facility-management/provider-facilities-data.service';
import { MedminedTransformationService } from './services/medmined-transformation.service';
import { SelectFacilityModalComponent } from './medview/configuration/mvd-facilitymgmt-modal/mvd-selectfacility-modal.component';
import { TabConfigurationService } from './medview/configuration/medview-configuration/medview-tab-configuration.service';
import { EmailDlgComponent } from './medview/configuration/medview-authorization/email-dlg/email-dlg.component';
import { SortingPipe } from './pipes/mvd-sorting.pipe';
import { AlertsDlgComponent } from './medview/clinical-overview/alerts-dlg/alerts-dlg.component';
import { AlertsConfigurationService } from './medview/clinical-overview/alerts-configuration-services/alerts-configuration.service';
import { MedminedSystemSettingsComponent } from './medview/configuration/medmined-system-settings/medmined-system-settings.component';
import { ContinuousInfusionsDataService } from './medview/continuous-infusions/mvd-continuous-infusions-data.service';
import { IvPrepTimeFilterComponent } from './shared/iv-prep-time-filter/mvd-iv-prep-time-filter.component';
import { NgxTextOverflowClampModule } from 'ngx-text-overflow-clamp';
import { PatientAlertComponent } from './shared/patient-alert-modal/patient-alert-modal.component';
import { ClinicalOverviewConfigurationService } from './medview/clinical-overview/mvd-clinical-overview-configuration.service';
import { PatientAlertIconComponent } from './shared/patient-alert-icon/mvd-patient-alert-icon.component';
import { MvdMedMinedSecondaryDataService } from './services/mvd-medmined-secondary-data.service';
import { MvdMedMinedSecondaryDataMapperService } from './services/mvd-medmined-secondary-data-mapper.service';
import { WindowRef } from './services/windowref.service';

import { AttentionNoticeKeyGeneratorService } from './services/mvd-attention-notice-key-generator.service';
import { AttentionNoticeStatusesService } from './services/mvd-attention-notice-statuses.service';
import { RolePermissionsValidatorService } from './services/mvd-role-permissions.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        SpinnerModule,
        ButtonModule,
        MessageModule,
        MessagesModule,
        DataTableModule,
        RadioButtonModule,
        CalendarModule,
        SharedModule,
        DropdownModule,
        TabViewModule,
        GuardRailAlertsModule,
        CollapseModule.forRoot(),
        BsDropdownModule.forRoot(),
        ButtonsModule.forRoot(),
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        ListboxModule,
        ReactiveFormsModule,
        GrowlModule,
        TreeModule,
        CheckboxModule,
        TableModule,
        SelectButtonModule,
        AlertModule.forRoot(),
        ToastModule,
        StoreModule.forRoot(reducers, { metaReducers }),
        EffectsModule.forRoot([ClinicalDashboardEffects]),
        StoreDevtoolsModule.instrument(),
        AccordionModule,
        NgxTextOverflowClampModule,
        PaginatorModule
    ],
    declarations: [
        ...WidgetsList,
        TimeUntilEmptyWarningsComponent,
        DataFormatPipe,
        ColumnToggle,
        SearchBox,
        DateRangePicker,
        MultipleValueFilter,
        MultipleValueFilterComponent,
        MedviewConfigurationComponent,
        MedViewSystemAdminConfigComponent,
        MedviewAuthorizationComponent,
        MedviewFacilityManagementComponent,
        RadioButtonGroupComponent,
        MvdListPrioritiesComponent,
        AttentionNoticesDataTableComponent,
        DoseRequestDetailComponent,
        DoseRequestSummaryComponent,
        DoseRequestTableComponent,
        AttentionNoticesConfiguration,
        TextTooltipComponent,
        AttentionNoticesSummaryComponent,
        AttentionNoticesExtendedViewComponent,
        AttentionNoticesItemComponent,
        MvdFacilitymgmtModalComponent,
        MasterFacilityModalComponent,
        FacilityMappingModalComponent,
        DisableDatasourceModalComponent,
        MvdAdtInformationModalComponent,
        RadioButtonListComponent,
        ButtonSelectionComponent,
        FacilitySelectionComponent,
        CheckboxPicklistComponent,
        WidgetToolbarComponent,
        SlidingPanelComponent,
        ExportTableComponent,
        IVStatusConfigurationComponent,
        ContinuousInfusionsConfigurationComponent,
        IvPrepTableComponent,
        IvPrepIconsComponent,
        IvPrepBtnfiltersComponent,
        IvPrepTableIconsComponent,
        IvPrepConfirmDlgContentComponent,
        IvPrepErrorDlgContentComponent,
        WarningDialogComponent,
        ClinicalOverviewSummaryComponent,
        ClinicalOverviewDatatableComponent,
        ClinicalOverviewFormComponent,
        ClinicalOverviewPatientFormComponent,
        SelectFacilityModalComponent,
        ClinicalOverviewListComponent,
        HoursFrameFilterComponent,
        EmailDlgComponent,
	    SortingPipe,
        HoursFrameFilterComponent,
        IvPrepConfigurationComponent,
        IvPrepConfigurationDialogComponent,
        IvPrepSettingsComponent,
        IvPrepTimeFilterComponent,
        AlertsDlgComponent,
        MedminedSystemSettingsComponent,
        PatientAlertComponent,
        PatientAlertIconComponent,
        CheckboxListComponent
    ],
    entryComponents: [
        ...WidgetsList,
        AttentionNoticesConfiguration,
        MvdFacilitymgmtModalComponent,
        MasterFacilityModalComponent,
        FacilityMappingModalComponent,
        DisableDatasourceModalComponent,
        MvdAdtInformationModalComponent,
        IVStatusConfigurationComponent,
        ContinuousInfusionsConfigurationComponent,
        IvPrepTableComponent,
        IvPrepConfirmDlgContentComponent,
        IvPrepErrorDlgContentComponent,
        WarningDialogComponent,
        IvPrepConfigurationDialogComponent,
        IvPrepSettingsComponent,
        ClinicalOverviewFormComponent,
        ClinicalOverviewPatientFormComponent,
        SelectFacilityModalComponent,
        EmailDlgComponent,
        AlertsDlgComponent,
        PatientAlertComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        DialogModule,
        ...WidgetsList,
        DataTableModule,
        RadioButtonModule,
        DropdownModule,
        CalendarModule,
        TabViewModule,
        SharedModule,
        GuardRailAlertsModule,
        CollapseModule,
        BsDropdownModule,
        ListboxModule,
        TableModule
    ],
    providers: [
        BsModalService,
        ContinuousInfusionsTransformationService,
        ContinuousInfusionsConfigurationService,
        MvdOrderService,
        DataTransformationService,
        ConfigurationService,
        PersistentConfigurationService,
        DataConfigurationService,
        SortingService,
        DecimalPipe,
        DataFormatPipe,
        DatePipe,
        MedViewWidgetsService,
        InfusionDataFiltersService,
        DeliveryTrackingConfigurationService,
        DeliveryTrackingTransformationService,
        DispensingDataTransformationService,
        DoseRequestTransformationService,
        DoseRequestDetailTransformationService,
        DoseRequestDetailConfigurationService,
        AttentionNoticesTransformationService,
        AttentionNoticesConfigurationService,
        DispensingFacilityKeyTranslatorService,
        DashboardHeaderService,
        PorletCountHandlerService,
        FacilityManagementService,
        FacilityManagementTransformationService,
        MvdCfwConfigurationService,
        SystemAdminConfigurationService,
        MvdFacilitySelectionTransformService,
        FacilitySelectionDataService,
        IvPrepTransformationService,
        IvPrepConfigurationService,
        StateMappingConfigurationService,
        CatoDataFiltersService,
        MvdTimeTransformService,
        IvPrepDlgService,
        IvPrepSystemConfigurationService,
        ContinuousInfusionsDataService,
        MvdMedMinedDataService,
        ProviderFacilitiesDataService,
        TabConfigurationService,
        MedminedTransformationService,
        SortingPipe,
        AlertsConfigurationService,
        ClinicalOverviewConfigurationService,
        MvdMedMinedSecondaryDataService,
        MvdMedMinedSecondaryDataMapperService,
        WindowRef,
        RolePermissionsValidatorService,
        AttentionNoticeKeyGeneratorService,
        AttentionNoticeStatusesService
    ]
})
export class WidgetsModule { }
