import { Component, OnInit } from '@angular/core';
import { ResourceService } from 'container-framework';

@Component({
    styleUrls: ['./unauthorized-mobile.component.scss'],
    templateUrl: './unauthorized-mobile.component.html',
    selector: 'mvd-unauthorized-mobile',
})
export class UnauthorizedMobileComponent implements OnInit {

    resources: any;

    constructor(private resourcesService: ResourceService) {
    }

    ngOnInit(): void {
        this.resources = this.getResources();
    }

    private getResources() {
        return {
            unauthorized: this.resourcesService.resource('unauthorized'),
            unauthorizedMessage: this.resourcesService.resource('unauthorizedMessage'),
            attentionNotices : this.resourcesService.resource('medViewAttentionNotices')
        };
    }
}
