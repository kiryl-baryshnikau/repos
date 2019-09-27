import { Component } from '@angular/core'
import { ApplicationConfigurationService } from '../../services/application-configuration.service/application-configuration.service';

@Component({
    selector: 'helplink',
    templateUrl: './helplink.component.html',
    styleUrls: ['./helplink.component.scss'],
    host: { 'class': 'topbar--action-item' }
})
export class HelpLinkComponent {

    helpLinkUrl: string='';

    constructor(private applicationConfigurationService: ApplicationConfigurationService) {
        this.applicationConfigurationService.get().subscribe(applicationConfigurations => {
            this.helpLinkUrl = applicationConfigurations['helpLinkUrl'];
        });
    }

    onHelpLinkClick() {
        if (this.helpLinkUrl) {
            window.open(this.helpLinkUrl, '_blank');
        }
    }

}
