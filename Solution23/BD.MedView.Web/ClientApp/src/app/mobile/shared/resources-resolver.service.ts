import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ResourceService } from 'container-framework';
import { of } from 'rxjs';
import { CfwResourcesService } from './cfw-resources.service';
import { tap, catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class ResourcesResolverService implements Resolve<any> {

    private resourcesRoutesDictionary = {
         AttentionNotices: 'MedViewPriorities',
         DefaultKey: 'MedViewPriorities'
    };
    private defaults = { app: '', common: [] };

    constructor(private resourcesService: ResourceService,
        private cfwResourceService: CfwResourcesService) { }

    // Since there is no CFW, resources need to be manually initialized
    // There is dependency on it from desktop services
    resolve(route: ActivatedRouteSnapshot) {

        const routeKey = route.routeConfig.path;
        const resourceKey = this.resourcesRoutesDictionary[routeKey] || this.resourcesRoutesDictionary.DefaultKey;

        return resourceKey ? this.syncResources$(resourceKey) : of([]);
    }

    private syncResources$(resourceKey: string) {
        return this.cfwResourceService.getResources$(resourceKey).pipe(
            switchMap((resources) => of(this.resourcesService.setResources(resources))),
            catchError((error) => {
                console.log('Error initializing resources on Mobile', error);
                this.resourcesService.setResources(this.defaults);
                return of([]);
            })
        );
    }
}
