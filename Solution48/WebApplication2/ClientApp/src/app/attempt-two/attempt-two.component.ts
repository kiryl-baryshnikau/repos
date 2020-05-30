import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-attempt-two-component',
  templateUrl: './attempt-two.component.html'
})
export class AttemptTwoComponent {
  model: any = { phonenumber: "619-777-3030" };
  constructor() {
  }
}
