import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'def-default-lib',
  template: `
    <p>
      default-lib works!!!
    </p>
  `,
  styles: []
})
export class DefaultLibComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
