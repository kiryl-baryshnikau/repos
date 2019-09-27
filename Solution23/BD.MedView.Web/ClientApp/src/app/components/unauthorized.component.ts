import { Component, OnInit, OnDestroy } from '@angular/core';
import { ResourcesService } from '../services/cfw-resources.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'unauthorized',
    template: `
<div style='position: absolute; top: 50%; left: 50%; transform: translate3d(-50%,-50%,0);'>
    <h2>{{this.resources?.youAreNotAuthorizedMessage}}</h2>
    <br />
    <br />
    <h2>{{this.resources?.contactToYourSystemAdminMessage}}</h2>
</div>`
})
export class UnauthorizedComponent implements OnInit, OnDestroy {

    nativeResources: any;
    resources: any;
    resourcesSubscription: Subscription;
    resourceId = 'MedViewAbout';

    constructor(private resourcesService: ResourcesService) {
    }

    ngOnInit(): void {
        if (!this.nativeResources) {
            this.resourcesSubscription = this.resourcesService.getResources(this.resourceId).subscribe((data) => {
                this.nativeResources = data || {};
                this.resources = this.setResources();
            });
        }
    }

    ngOnDestroy(): void {
        this.resourcesSubscription.unsubscribe();
    }

    setResources() {
        return {
            youAreNotAuthorizedMessage: this.resource('youAreNotAuthorizedMessage'),
            contactToYourSystemAdminMessage: this.resource('contactToYourSystemAdminMessage'),
        };
    }

    private resource(id: string): string {
        return this.resourcesService.mapResource(this.nativeResources, id);
    }
}
