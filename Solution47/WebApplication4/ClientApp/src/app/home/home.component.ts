import { Component } from '@angular/core';
import { resources } from './../resources';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  subsubtitile: string = "Hello i18n!";
  constructor() {
    this.subsubtitile = resources["messageA"] || this.subsubtitile;
  }
}
