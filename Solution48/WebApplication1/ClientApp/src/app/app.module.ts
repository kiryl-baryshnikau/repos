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

//#region Example One
import { ShowErrorsComponent } from './example-one/show-errors.component';

import { BirthYearValidatorDirective } from './example-one/validators/birth-year-validator.directive';
import { TelephoneNumberFormatValidatorDirective } from './example-one/validators/telephone-number-format-validator.directive';
import { CountryCityValidatorDirective } from './example-one/validators/country-city-validator.directive';
import { TelephoneNumbersValidatorDirective } from './example-one/validators/telephone-numbers-validator.directive';
import { UniqueNameValidatorDirective } from './example-one/validators/name-unique-validator.directive';

import { ExampleOneComponent } from './example-one/example-one.component';
//#endregion

@NgModule({
  declarations: [
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,

    //#region Example One
    ShowErrorsComponent,
    BirthYearValidatorDirective,
    TelephoneNumberFormatValidatorDirective,
    CountryCityValidatorDirective,
    TelephoneNumbersValidatorDirective,
    UniqueNameValidatorDirective,
    ExampleOneComponent,
    //#endregion

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
      { path: 'example-one', component: ExampleOneComponent },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
