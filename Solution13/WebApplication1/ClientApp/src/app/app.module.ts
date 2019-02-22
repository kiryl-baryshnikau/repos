import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { of } from 'rxjs';
import { ConfigurationService } from './services/configuration.service';
import { AuthorizationService } from './services/authorization.service';
import { flatMap } from 'rxjs/operators';

function appInitializerFactory(configurationService: ConfigurationService, authorizationService: AuthorizationService): Function {
  return () => configurationService.initialize().pipe(flatMap(configuration => authorizationService.initialize())).toPromise();
}

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
    ])
  ],
  providers: [
    ConfigurationService,
    AuthorizationService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [ConfigurationService, AuthorizationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
