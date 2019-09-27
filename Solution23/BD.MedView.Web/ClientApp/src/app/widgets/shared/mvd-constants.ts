export class MvdConstants {

    public static get INFUSION_PROVIDER_NAME(): string { return 'infusion'; }
    public static get DISPENSING_PROVIDER_NAME(): string { return 'dispensing'; }
    public static get CATO_PROVIDER_NAME(): string { return 'cato'; }
    public static get MEDMINED_PROVIDER_NAME(): string { return 'medmined'; }
    public static get ALL_FACILITIES_KEY(): string { return '00000000000000000000000000000000'; }
    public static get ATTENTIONNOTICES_WIDGET_KEY(): string { return 'BD.MedView.Web.Widgets.Attention Notices'; }
    public static get IVSTATUS_WIDGET_KEY(): string { return 'BD.MedView.Web.Widgets.IV Status'; }
    public static get IVPREP_WIDGET_KEY(): string { return 'BD.MedView.Web.Widgets.IV Prep'; }
    public static get CONTINUOUSINFUSIONS_WIDGET_KEY(): string { return 'BD.MedView.Web.Widgets.Continuous Infusions'; }
    public static get DELIVERYTRACKING_WIDGET_KEY(): string { return 'BD.MedView.Web.Widgets.Delivery Tracking'; }
    public static get DOSEREQUEST_WIDGET_KEY(): string { return 'BD.MedView.Web.Widgets.Dose Requests'; }
    public static get CLINICALOVERVIEW_WIDGET_KEY(): string { return 'BD.MedView.Web.Widgets.Clinical Overview'; }

    public static get FACILITY_WIDGET_ID_PREFIX(): string { return 'BD.MedView.Web.Widgets.'; }

    public static get PHARMACIST_ROLE_ID(): string { return 'BD.MedView.Web.Screens.Pharmacist'; }
    public static get CLINICIAN_ROLE_ID(): string { return 'BD.MedView.Web.Screens.Clinician'; }
    public static get CLINICAL_PHARMACIST_ROLE_ID(): string { return 'BD.MedView.Web.Screens.ClinicalPharmacist'; }
    public static get TECHNICIAN_ROLE_ID(): string { return 'BD.MedView.Web.Screens.Technician'; }
    public static get AUTHORIZATION_ROOT_ID(): string { return 'BD.MedView.Authorization'; }

    public static get PIPE_TYPES_DECIMAL(): string { return 'decimal'; }
    public static get PIPE_TYPES_NUMBER(): string { return 'number'; }
    public static get PIPE_TYPES_TIME(): string { return 'time'; }
    public static get PIPE_TYPES_DATETIME(): string { return 'datetime'; }
    public static get PIPE_TYPES_DATE(): string { return 'date'; }
    public static get PIPE_TYPES_LOCALTIME(): string { return 'localtime'; }
    public static get PIPE_TYPES_TEXT(): string { return 'text'; }
    public static get DASHBOARD_APP_CODES(): string[] {
        return ['MedView', 'MedViewPriorities', 'MedViewDeliveryTracking', 'MedViewIVPrep', 'MedViewConfiguration', 'MedViewClinicalDashboard'];
    }

    public static get PRIORITIES_MENU_CODE(): string { return 'ContinuousInfusion'; }
    public static get IV_STATUS_MENU_CODE(): string { return 'IVStatus'; }
    public static get DELIVERY_TRACKING_MENU_CODE(): string { return 'DeliveryTracking'; }
    public static get IV_PREP_MENU_CODE(): string { return 'IVPrep'; }
    public static get CONFIGURATION_MENU_CODE(): string { return 'Configuration'; }
    public static get CLINICALOVERVIEW_MENU_CODE(): string { return 'ClinicalOverview'; }

    public static get ALERT_SYSTEM_OWNERSHIP(): string { return 'System'; }

    public static get ORDER_SERVICE_DEFAULT_VARIANCE(): number { return 10; }
    public static get WRITE_ACCESS_PERMISSION(): string { return 'Change'; }
    public static get READ_ACCESS_PERMISSION(): string { return 'View'; }

    public static get MEDMINED_ALERT_STATE_NEW(): string { return 'New'; }
}
