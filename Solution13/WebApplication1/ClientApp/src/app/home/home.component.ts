import { Component } from '@angular/core';
import { ConfigurationService } from '../services/configuration.service';
import { AuthorizationService } from '../services/authorization.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {

  constructor(private configurationService: ConfigurationService, private authorizationService: AuthorizationService) {
  }

  get authorizationUrl(): string { return this.configurationService.authorizationUrl; }
  get name(): string { return this.authorizationService.name; }
  get authorized(): boolean { return this.authorizationService.authorized; }
  get roles(): string[] { return this.authorizationService.roles; }

}
