import { Component } from '@angular/core';

import { ConfigurationService, Configuration } from './../services/configuration.service';
import { AuthorizationService, Authorization } from './../services/authorization.service';
import { DirectoryService, Directory } from './../services/directory.service';
import { PreferenceService, Preference } from './../services/preference.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(
      private configurationService: ConfigurationService
    , private authorizationService: AuthorizationService
    , private directoryService: DirectoryService
    , private preferenceService: PreferenceService
  ) { }

  get configuration(): Configuration {
    return this.configurationService.value;
  }

  get authorization(): Authorization {
    return this.authorizationService.value;
  }

  get directory(): Directory {
    return this.directoryService;
  }

  get preference(): Preference {
    return this.preferenceService;
  }

  onClick(area: string): void {
    switch (area) {
      case 'Configuration': this.configurationService.refresh(); break;
      case 'Authorization': this.authorizationService.refresh(); break;
      //case 'Directory': this.directoryService.doRefresh(); break;
      //case 'ConfiguraPreferencetion': this.preferenceService.doRefresh(); break;
    }
  }
}
