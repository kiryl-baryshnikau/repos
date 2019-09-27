import { Injectable } from "@angular/core";
import { ResourceService } from "container-framework";

@Injectable()
export class FacilityManagementTransformationService {
    constructor(private resourcesService: ResourceService) {

    }

    transform(item, sourcesEnabled: any[]) {
        let mapitem = {
            id: item.id,
            masterFacilityName: item.name,
            dataSources:
            sourcesEnabled.map(source => {
                if (item.synonyms.some(o => o.providerId === source.id)) {
                    return item.synonyms.filter(o => o.providerId === source.id).map((synonymItem: any) => {
                        return {
                            source: this.getProviderDisplayName(synonymItem.provider.name),
                            sourceValue: synonymItem.provider.name,
                            name: synonymItem.name,
                            facilityId: synonymItem.key,
                            synonymId: synonymItem.id,
                            providerId: synonymItem.providerId,
                            elementId: synonymItem.elementId
                        }
                    })[0];
                }
                else {
                    return {
                        source: this.getProviderDisplayName(source.value),
                        sourceValue: source.value,
                        name: '',
                        facilityId: '',
                        synonymId: 0,
                        providerId: source.id,
                        elementId: 0
                    };
                }
            })

        };
        return mapitem;
    }

    getProviderDisplayName(id: string): string {
        return this.resourcesService.resource('provider_' + (id || '').toLocaleLowerCase());
    }
}
