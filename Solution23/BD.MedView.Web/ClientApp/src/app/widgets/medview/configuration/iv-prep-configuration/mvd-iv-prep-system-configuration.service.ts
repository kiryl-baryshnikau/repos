import { Injectable } from '@angular/core';
import { ResourceService } from 'container-framework';

import { IvPrepModels } from '../../../shared/mvd-models';
import * as _ from 'lodash';

@Injectable()
export class IvPrepSystemConfigurationService {

    constructor(private resourceService: ResourceService) { }

    mapStatesMappingViewModel(
        userStates: IvPrepModels.StateMapping[]
        , doseStatesResponse: IvPrepModels.DoseStatesResponse): IvPrepModels.StatesMappingViewModel[] {
        if (!userStates.length) {
            return [];
        }
        const statesViewModel: IvPrepModels.StatesMappingViewModel[] = [];
        const mappedStates = this.transformMappedStates(userStates, doseStatesResponse);
        const unMappedStates = this.transformUnMappedStates(userStates, doseStatesResponse);

        statesViewModel.push(...mappedStates, ...unMappedStates);
        return statesViewModel;
    }

    mapStatesRequest(states: IvPrepModels.StatesMappingViewModel[]):  IvPrepModels.ProviderStateRequest[] {

        const mappedStates: IvPrepModels.ProviderStateRequest[] = [];
        const grouped = _.groupBy(states, 'providerStateId');
        for (const key in grouped) {
            if (grouped.hasOwnProperty(key)) {
                const element = grouped[key];
                const widgetStates = element.map((el) => (<IvPrepModels.StateMapping>{ type: el.ivPrepStatus }));
                const statesRequest = element.map((el) => <IvPrepModels.ProviderStateRequest>{
                    id: Number(key) || 0,
                    designation: el.designation,
                    standardId: el.standardId,
                    stateId: el.stateId,
                    widgetStates: widgetStates
                });

                mappedStates.push(...statesRequest);

            }
        }
        return mappedStates;
    }

    private transformMappedStates(userStates: IvPrepModels.StateMapping[]
        , doseStatesResponse: IvPrepModels.DoseStatesResponse): IvPrepModels.StatesMappingViewModel[] {
        const mappedStates: IvPrepModels.StatesMappingViewModel[] = [];

        userStates.forEach((state) => {
            const viewModelStates = state.providerStates.map((providerState) => {
                return <IvPrepModels.StatesMappingViewModel>{
                    providerStateId: providerState.id,
                    widgetStateId: state.id,
                    designation: providerState.designation,
                    stateId: providerState.stateId,
                    standardId: providerState.standardId,
                    ivPrepStatus: state.type,
                    designationDisplayName: this.mapDesignationDisplayName(providerState, doseStatesResponse.DoseStates),
                    tooltipText: this.mapTooltipText(providerState)
                };
            }, state);
            mappedStates.push(...viewModelStates);
        }, mappedStates);
        return mappedStates;
    }

    private transformUnMappedStates(userStates: IvPrepModels.StateMapping[]
        , doseStatesResponse: IvPrepModels.DoseStatesResponse): IvPrepModels.StatesMappingViewModel[] {
        const currentStateIds = _.flatMap(userStates, (state) => state.providerStates.map(p => p.stateId));
        const customStates = doseStatesResponse.DoseStates
            .filter(state => !state.StandardId && !currentStateIds.some((id) => state.Id === id));

        return customStates.map((c) => {
            return <IvPrepModels.StatesMappingViewModel>{
                providerStateId: 0,
                widgetStateId: 0,
                designation: c.Designation,
                stateId: c.Id,
                standardId: null,
                ivPrepStatus: 'UNMAPPED',
                designationDisplayName: c.Designation,
                tooltipText: this.resourceService.resource('stateTooltipText_CustomState')
            };
        });
    }

    private mapTooltipText(providerState: IvPrepModels.ProviderState): string {
        const stateId = providerState.standardId !== null ?
                        providerState.standardId :
                        'CustomState';
        return this.resourceService.resource(`stateTooltipText_${stateId}`);
    }

    private mapDesignationDisplayName(providerState: IvPrepModels.ProviderState, doseStates: IvPrepModels.IvPrepState[]) {
        if (providerState.standardId === null) {
            const customState = doseStates.find(dose => dose.Id === providerState.stateId);
            return customState ? customState.Designation : providerState.designation;
        }
        const doseState = doseStates.find(dose => dose.StandardId === providerState.standardId);
        return doseState ? doseState.Designation : providerState.designation;
    }

}
