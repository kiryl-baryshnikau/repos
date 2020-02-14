import { Component } from '@angular/core';

@Component({
  selector: 'app-toolbar-component',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent {
  public currentCount = 0;

  public incrementCounter() {
    this.currentCount++;
  }
}
