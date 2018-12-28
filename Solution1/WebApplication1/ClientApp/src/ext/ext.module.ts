import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CalculatorComponent } from './calculator/calculator.component';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [
    CalculatorComponent,
    LoaderComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'loader', pathMatch: 'full' },
      { path: 'calculator', component: CalculatorComponent },
      { path: 'loader', component: LoaderComponent }
    ])
  ],
  providers: []
})
export class ExtModule { }
