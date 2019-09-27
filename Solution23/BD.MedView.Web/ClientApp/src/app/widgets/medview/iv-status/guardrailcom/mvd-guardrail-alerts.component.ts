// Exact copy except import UserService from core
import { Component, Input, OnInit }      from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'mvd-guardrailalert',
  templateUrl: './mvd-guardrail-alerts.component.html',
  styleUrls: [ './mvd-guardrail-alerts.style.scss' ]
})
export class GuardRailAlertsComponent implements OnInit {
    @Input() totalRailGuards: number = 0;
    @Input() messages: Array<string>;
    imgURL: string = "./dist/app/widgets/medview/iv-status/guardrailcom/guardrailalerticon.png";

    ngOnInit() {
  }
}
