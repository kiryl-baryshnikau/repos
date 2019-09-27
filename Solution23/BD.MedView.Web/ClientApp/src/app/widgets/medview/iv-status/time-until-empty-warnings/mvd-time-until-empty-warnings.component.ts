import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'mvd-time-until-empty-warnings',
    templateUrl: './mvd-time-until-empty-warnings.component.html',
    styleUrls: ['./mvd-time-until-empty-warnings.component.scss'],
})
export class TimeUntilEmptyWarningsComponent implements OnDestroy, OnInit {

    @Input() timeUntilEmpty: any;
    @Input() infusionConfiguration: any;

    // Default Thresholds in minutes
    //private thresholdCritical = 60;
    //private thresholdWarning = 90;

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    getTimeUntilEmptyThresholdIndicator(): number {
        if (isNaN(this.timeUntilEmpty)) {
            return 0;
        }

        // Convert ms to min
        let value = Math.floor(this.timeUntilEmpty / 60000);

        let thresholdIndicator = value <= this.infusionConfiguration.priorityThreshold ? 1 : (value <= this.infusionConfiguration.warningThreshold ? 2 : 0);

        //console.log(`TimeUntilEmptyWarningsComponent: timeUntilEmpty=${this.timeUntilEmpty} value=${value} thresholdIndicator=${thresholdIndicator}`);

        return thresholdIndicator;
    }
}
