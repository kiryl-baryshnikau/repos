import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiCall, GatewayService, ResourceService } from 'container-framework';
import * as _ from 'lodash';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { StateMappingConfigurationService } from '../../../services/mvd-state-mapping-configuration.service';
import { IvPrepModels } from '../../../shared/mvd-models';
import { IvPrepSystemConfigurationService } from './mvd-iv-prep-system-configuration.service';


@Component({
    selector: 'mvd-iv-prep-configuration',
    templateUrl: './mvd-iv-prep-configuration.component.html',
    styleUrls: ['./mvd-iv-prep-configuration.component.scss']
})
export class IvPrepConfigurationComponent implements OnInit {

    @Input() appCode: string;
    @Input() widgetId: string;

    @Output() changed: EventEmitter<void> = new EventEmitter<void>();

    resources: any;
    stateMappingsViewModel: IvPrepModels.StatesMappingViewModel[];
    viewModelOriginalData: IvPrepModels.StatesMappingViewModel[];

    constructor(private resourceService: ResourceService
        , private gatewayService: GatewayService
        , private stateMappingConfigurationService: StateMappingConfigurationService
        , private ivPrepSystemConfigurationService: IvPrepSystemConfigurationService
            ) { }

    ngOnInit() {
        this.resources = this.getResources();
    }

    onStateClick() {
        this.changed.emit();
    }

    getStatesMappings(): IvPrepModels.StatesMappingViewModel[] {
        return this.stateMappingsViewModel;
    }

    updateStateMappings$() {
        const states = this.ivPrepSystemConfigurationService
                           .mapStatesRequest(this.stateMappingsViewModel);
        const updateMappings$ = this.stateMappingConfigurationService.updateUserStatesMappings(states);
        return updateMappings$;
    }

    isModelStateValid(): boolean {
        return !this.stateMappingsViewModel
                .some((state: IvPrepModels.StatesMappingViewModel) => state.ivPrepStatus === 'UNMAPPED');
    }

    getInitialiData$() {

        const dosesStates$ = this.gatewayService.loadData(this.getDoseStatesRequestParams());
        const configuration$ = this.stateMappingConfigurationService.getConfiguration();
        const ensureUserMappigns$ = this.stateMappingConfigurationService.ensureProviderStates();

        return forkJoin(dosesStates$).pipe(
            switchMap(([doseStates]) => this.synchDeletedStates$(doseStates)),
            switchMap(([doseStates]) => {
                return configuration$.pipe(map((configuration) => [doseStates, configuration]));
            }),
            switchMap(([doseStates, configuration]) => {
                const [states] = doseStates;
                const providerStates = _.flatMap(configuration, (item) => item.providerStates);
                const isUserMappingsInitialized = providerStates.length > 0;

                if (!states.DoseStates.length) {
                    throwError('Unable to get DosesStates data');
                }

                if (isUserMappingsInitialized) {
                    return of([states, configuration]);
                }

                const providerStatesBody = this.mapToProviderStates(states);
                return this.stateMappingConfigurationService
                    .synchProviderStates(providerStatesBody).pipe
                    (
                        switchMap(() => ensureUserMappigns$),
                        switchMap(() => configuration$),
                        map((configurationResponse) => ([states, configurationResponse])),
                        catchError((error) => throwError(error))
                    );
            }),
            catchError((error) => throwError(error))
        );
    }

    initializeComponent(response: any) {
        const [dosesStatesResponse, userStatesMappings] = response;
        this.stateMappingsViewModel = this.ivPrepSystemConfigurationService
                .mapStatesMappingViewModel(userStatesMappings, dosesStatesResponse);
        this.viewModelOriginalData = _.cloneDeep(this.stateMappingsViewModel);
    }

    reset() {
        this.stateMappingsViewModel = _.cloneDeep(this.viewModelOriginalData);
    }

    private synchDeletedStates$(doseStates: any) {
        const [states] = doseStates;
        const providerStates = this.mapToProviderStates(states);

        return this.stateMappingConfigurationService
                        .synchDeletedStates(providerStates).pipe(map(() => [doseStates]));
    }

    private mapToProviderStates(doseStates: IvPrepModels.DoseStatesResponse): IvPrepModels.ProviderState[] {
        return doseStates.DoseStates.map((state) => {
            return <IvPrepModels.ProviderState>{
                designation: state.Designation,
                standardId: state.StandardId,
                stateId: state.Id
            };
        });
    }

    private getDoseStatesRequestParams(): ApiCall[] {
        return <ApiCall[]>[
            <ApiCall>{
                widgetId: this.widgetId,
                appCode: this.appCode,
                api: 'ivprepdosestates'
            }
        ];
    }

    private getResources() {
        return {
            medicationStatesInIvPrep: this.resourceService.resource('medicationStatesInIvPrep')
            , unMapped: this.resourceService.resource('unMapped')
            , hsvStatus: this.resourceService.resource('hsvStatus')
            , queuedForPrep: this.resourceService.resource('queuedForPrep')
            , readyForPrep: this.resourceService.resource('readyForPrep')
            , inPrep: this.resourceService.resource('inPrep')
            , readyForCheck: this.resourceService.resource('readyForCheck')
            , readyForDelivery: this.resourceService.resource('readyForDelivery')
            , delivery: this.resourceService.resource('delivery')
            , pixysIvPrepSettingsTittle: this.resourceService.resource('pixysIvPrepSettingsTittle')
            , unMappedStates: this.resourceService.resource('unMappedStates')
            , unMappedStatesWarningDialogMessage: this.resourceService.resource('unMappedStatesWarningDialogMessage')
            , completed: this.resourceService.resource('completed')
        };
    }

}
