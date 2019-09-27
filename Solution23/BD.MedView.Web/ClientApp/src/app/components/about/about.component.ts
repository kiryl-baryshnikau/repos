import { Component, Input } from '@angular/core';
import { ResourcesService } from '../../services/cfw-resources.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'mvd-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent {
    private api = 'api/resources';
    private resourceId = 'MedViewAbout';

    display = false;

    resources = {
        medViewAbout_Header: '',
        medViewAbout_Version: '',
        medViewAbout_CopyRights: '',
        medViewAbout_Support: '',
        medViewAbout_Close: '',
        medViewAbout_Help: '',
        medViewAbout_Title: '',
    };

    @Input()
    aboutIconTitle: Observable<string>;

    nativeResources: any;

    constructor(private resourcesService: ResourcesService) {
    }

    showDialog() {
        this.display = true;
        if (!this.nativeResources) {
            this.resourcesService.getResources(this.resourceId).subscribe((data) => {
                this.nativeResources = data || {};
                this.setResources();
            });
        }
    }

    hideDialog() {
        this.display = false;
    }

    getHelpPages() {
        window.open(window['hsvOnlineHelpUrl'], '_blank');
    }

    private adjustYear(text: string): string {
        return (text || '').replace('{{fullYear}}', new Date().getFullYear().toString());
    }

    private resource(id: string): string {
        return this.resourcesService.mapResource(this.nativeResources, id);
    }

    private setResources() {
        this.resources = {
            medViewAbout_Header: this.resource('medViewAbout_Header'),
            medViewAbout_Version: this.resource('medViewAbout_Version'),
            medViewAbout_CopyRights: this.adjustYear(this.resource('medViewAbout_CopyRights')),
            medViewAbout_Support: this.resource('medViewAbout_Support'),
            medViewAbout_Close: this.resource('medViewAbout_Close'),
            medViewAbout_Help: this.resource('medViewAbout_Help'),
            medViewAbout_Title: this.resource('medViewAbout_Title'),
        };
    }
}
