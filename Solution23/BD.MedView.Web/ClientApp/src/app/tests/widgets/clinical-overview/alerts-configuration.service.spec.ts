import { Subscription, Observable, of } from "rxjs";
import {TestBed, ComponentFixture} from '@angular/core/testing';
import * as _ from 'lodash';
import {Injectable} from '@angular/core';
import { AlertsConfigurationService } from '../../../widgets/medview/clinical-overview/alerts-configuration-services/alerts-configuration.service';
import { MvdMedMinedDataService } from "../../../widgets/services/mvd-medmined-data.service";
import { UserConfigurationService } from "../../../services/user-configuration.service";

@Injectable()
class MockUserConfigurationService{
    setUserPreferences(userPreferences: any): Observable<any>{
        return of(userPreferences);
    }

    getCurrentConfig(): Observable<any>{
        const userConifg = {
            userPreferences :{
                id: 1,
                user: 'user-test',
                sessionTimeout: 0,
                facilities: [
                    {
                        id: '00000000000000000000000000000000',
                        selected: true,
                        widgets: [
                        {
                            id: 'BD.MedView.Web.Screens.Super',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.System',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Admin',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Clinician',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Clinical Overview',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Continuous Infusions',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Delivery Tracking',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Dose Requests',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.IV Prep',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.IV Status',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.ClinicalPharmacist',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Attention Notices',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Technician',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Pharmacist',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        }
                        ],
                        units: []
                    },
                    {
                        id: '1',
                        selected: false,
                        widgets: [
                        {
                            id: 'BD.MedView.Web.Screens.Super',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.System',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Admin',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        }
                        ],
                        units: []
                    },
                    {
                        id: '2',
                        selected: false,
                        widgets: [
                        {
                            id: 'BD.MedView.Web.Screens.Super',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.System',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Admin',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Clinician',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Clinical Overview',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Continuous Infusions',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Delivery Tracking',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.IV Prep',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.IV Status',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.ClinicalPharmacist',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Attention Notices',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Technician',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Dose Requests',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        }
                        ],
                        units: []
                    },
                    {
                        id: '3',
                        selected: false,
                        widgets: [
                        {
                            id: 'BD.MedView.Web.Screens.Super',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.System',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Admin',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Clinician',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Clinical Overview',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Dose Requests',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.IV Prep',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Pharmacist',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Attention Notices',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.ClinicalPharmacist',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Screens.Technician',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Continuous Infusions',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.Delivery Tracking',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        },
                        {
                            id: 'BD.MedView.Web.Widgets.IV Status',
                            enabled: true,
                            'default': false,
                            configuration: null,
                            route: null
                        }
                        ],
                        units: []
                    }
                ],
                generalSettings: [],
                filters: {
                facilityFilters: [
                    {
                    facilityId: 'M2HSVFacility',
                    units: []
                    }
                ]
                },
                columnOptions: [],
                maskData: true,
                lastActiveRoute: ''
            }
        }
        return of(userConifg);
    }
}

@Injectable()
class MockMvdMedMinedDataService {

    getMedMinedAlertsMetadata$(appCode: string, widgetId: string){
        const alertsData ={
          results: [
            {
              facility_id: 1760,
              categories: [
                {
                  category: 'Anticoagulation',
                  titles: [
                    'No platelet after Start of Heparin',
                    'High INR and Warfarin'
                  ]
                },
                {
                  category: 'Antimicrobial',
                  titles: [
                    'Infection marker without treatment',
                    'Susceptibility Mismatch'
                  ]
                },
                {
                  category: 'Custom Alerts',
                  titles: [
                    'Ertapenem and no ESBM',
                    'Immune globulin order',
                    'Cefazolin'
                  ]
                }
              ]
            },
            {
              facility_id: 1761,
              categories: [
                {
                  category: 'Anticoagulation',
                  titles: [
                    'INR and Vitamin K',
                    'High INR and Warfarin'
                  ]
                },
                {
                  category: 'Antimicrobial',
                  titles: [
                    'Pathogen',
                    'Type Mismatch'
                  ]
                },
                {
                  category: 'Custom Alerts',
                  titles: [
                    'Carbapenem Use',
                    'Daptomycin',
                    'Linezolid'
                  ]
                }
              ]
            }
          ]
        }

        return of(alertsData);
    }
}

describe('Service: AlertsConfigurationService', () => {

    let alertsConfigurationService: AlertsConfigurationService;
    let userConfigurationService: UserConfigurationService;
    let mvdMedMinedDataService: MvdMedMinedDataService;
    let alertsData: any;
    let userConfigs: any;

    const expectedUserConifg = {
        userPreferences :{
            id: 1,
            user: 'user-test',
            sessionTimeout: 0,
            facilities: [
                {
                    id: '00000000000000000000000000000000',
                    selected: true,
                    widgets: [
                    {
                        id: 'BD.MedView.Web.Screens.Super',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.System',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Admin',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Clinician',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Clinical Overview',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Continuous Infusions',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Delivery Tracking',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Dose Requests',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.IV Prep',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.IV Status',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.ClinicalPharmacist',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Attention Notices',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Technician',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Pharmacist',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    }
                    ],
                    units: []
                },
                {
                    id: '1',
                    selected: false,
                    widgets: [
                    {
                        id: 'BD.MedView.Web.Screens.Super',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.System',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Admin',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    }
                    ],
                    units: []
                },
                {
                    id: '2',
                    selected: false,
                    widgets: [
                    {
                        id: 'BD.MedView.Web.Screens.Super',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.System',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Admin',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Clinician',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Clinical Overview',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Continuous Infusions',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Delivery Tracking',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.IV Prep',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.IV Status',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.ClinicalPharmacist',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Attention Notices',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Technician',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Dose Requests',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    }
                    ],
                    units: []
                },
                {
                    id: '3',
                    selected: false,
                    widgets: [
                    {
                        id: 'BD.MedView.Web.Screens.Super',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.System',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Admin',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Clinician',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Clinical Overview',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Dose Requests',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.IV Prep',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Pharmacist',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Attention Notices',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.ClinicalPharmacist',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Screens.Technician',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Continuous Infusions',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.Delivery Tracking',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    },
                    {
                        id: 'BD.MedView.Web.Widgets.IV Status',
                        enabled: true,
                        'default': false,
                        configuration: null,
                        route: null
                    }
                    ],
                    units: []
                }
            ],
            generalSettings: [
                {
                    id: 'BD.MedView.Web.Widgets.Clinical Overview',
                    configuration: {
                        alertCategories: [
                            {
	                        category: 'Anticoagulation',
	                        alerts: [
	                            {
		                        title: 'No platelet after Start of Heparin',
		                        status: '1'
	                            },
	                            {
		                        title: 'High INR and Warfarin',
		                        status: '1'
	                            },
	                            {
		                        title: 'INR and Vitamin K',
		                        status: '1'
	                            }
	                        ]
                            },
                            {
	                        category: 'Antimicrobial',
	                        alerts: [
	                            {
		                        title: 'Infection marker without treatment',
		                        status: '1'
	                            },
	                            {
		                        title: 'Susceptibility Mismatch',
		                        status: '1'
	                            },
	                            {
		                        title: 'Pathogen',
		                        status: '1'
	                            },
	                            {
		                        title: 'Type Mismatch',
		                        status: '1'
	                            }
	                        ]
                            },
                            {
	                        category: 'Custom Alerts',
	                        alerts: [
	                            {
		                        title: 'Ertapenem and no ESBM',
		                        status: '1'
	                            },
	                            {
		                        title: 'Immune globulin order',
		                        status: '1'
	                            },
	                            {
		                        title: 'Cefazolin',
		                        status: '1'
	                            },
	                            {
		                        title: 'Carbapenem Use',
		                        status: '1'
	                            },
	                            {
		                        title: 'Daptomycin',
		                        status: '1'
	                            },
	                            {
		                        title: 'Linezolid',
		                        status: '1'
	                            }
	                        ]
                            }
                        ]
                    }
                }
            ],
            filters: {
            facilityFilters: [
                {
                facilityId: 'M2HSVFacility',
                units: []
                }
            ]
            },
            columnOptions: [],
            maskData: true,
            lastActiveRoute: ''
        }
    }

    const expectedAlertCategories = [
      {
	    category: 'Anticoagulation',
	    alerts: [
	      {
		    title: 'No platelet after Start of Heparin',
		    status: '1'
	      },
	      {
		    title: 'High INR and Warfarin',
		    status: '1'
	      },
	      {
		    title: 'INR and Vitamin K',
		    status: '1'
	      }
	    ]
      },
      {
	    category: 'Antimicrobial',
	    alerts: [
	      {
		    title: 'Infection marker without treatment',
		    status: '1'
	      },
	      {
		    title: 'Susceptibility Mismatch',
		    status: '1'
	      },
	      {
		    title: 'Pathogen',
		    status: '1'
	      },
	      {
		    title: 'Type Mismatch',
		    status: '1'
	      }
	    ]
      },
      {
	    category: 'Custom Alerts',
	    alerts: [
	      {
		    title: 'Ertapenem and no ESBM',
		    status: '1'
	      },
	      {
		    title: 'Immune globulin order',
		    status: '1'
	      },
	      {
		    title: 'Cefazolin',
		    status: '1'
	      },
	      {
		    title: 'Carbapenem Use',
		    status: '1'
	      },
	      {
		    title: 'Daptomycin',
		    status: '1'
	      },
	      {
		    title: 'Linezolid',
		    status: '1'
	      }
	    ]
      }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
              AlertsConfigurationService,
              { provide: UserConfigurationService, useClass: MockUserConfigurationService },
              { provide: MvdMedMinedDataService, useClass: MockMvdMedMinedDataService }
            ]
        });

        alertsConfigurationService = TestBed.get(AlertsConfigurationService);
        userConfigurationService= TestBed.get(UserConfigurationService);
        mvdMedMinedDataService= TestBed.get(MvdMedMinedDataService);
    });

    it('Should be defined', () => {
        expect(alertsConfigurationService).toBeDefined();
    });

    it('Alerts should be equal', async() => {
        return alertsConfigurationService.getAlertsData$('appCode', 'widgetId', 'facilityKeys')
            .toPromise()
            .then(data => {
                userConfigs = data.configuration;
                alertsData = data.alertCategories;
                let result = _.isEqual(expectedAlertCategories, alertsData);
                expect(result).toEqual(true);
            });
    });

    it('User Configuration should be equal', async() => {

        return alertsConfigurationService.getAlertsData$('appCode', 'widgetId', 'facilityKeys')
            .toPromise()
            .then(data => {
                userConfigs = data.configuration;
                alertsData = data.alertCategories;
            })
            .then(() => {
                return alertsConfigurationService.applyConfiguration$(userConfigs, alertsData).toPromise();
            })
            .then(data => {
                let result = _.isEqual(expectedUserConifg.userPreferences, data);
                expect(result).toEqual(true);
            });
    });

});
