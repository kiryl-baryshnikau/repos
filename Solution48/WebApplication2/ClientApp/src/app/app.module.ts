import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';

import { AttemptOneComponent } from './attempt-one/attempt-one.component';
import { AttemptOneErrorsComponent } from './attempt-one/attempt-one-errors.component';
import { TrackByExpressionPipe } from './attempt-one/track-by-expression.pipe';


import { AttemptTwoComponent } from './attempt-two/attempt-two.component';
import { AttemptTwoCustomInputComponent } from './attempt-two/attempt-two-custom-input.component';
import { AttemptTwoErrorsComponent } from './attempt-two/attempt-two-errors.component';
import { TelephoneNumberFormatValidatorDirective } from './attempt-two/telephone-number-format-validator.directive';


@NgModule({
  declarations: [
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,

    AttemptOneComponent,
    AttemptOneErrorsComponent,
    TrackByExpressionPipe,

    AttemptTwoComponent,
    AttemptTwoCustomInputComponent,
    AttemptTwoErrorsComponent,
    TelephoneNumberFormatValidatorDirective,

    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'attempt-one', component: AttemptOneComponent },
      { path: 'attempt-two', component: AttemptTwoComponent },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
