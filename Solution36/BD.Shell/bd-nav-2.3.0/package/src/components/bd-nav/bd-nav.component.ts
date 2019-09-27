import { Component, ViewEncapsulation } from '@angular/core'
import { ApplicationConfigurationService } from '../../services/application-configuration.service/application-configuration.service';

@Component({
    selector: 'bd-nav',
    templateUrl: './bd-nav.component.html',
    styleUrls: ['./bd-nav.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { id: 'bdshell', "class": 'bdshell-container' }
})
export class BdNavComponent {
    constructor() {
    }
}
