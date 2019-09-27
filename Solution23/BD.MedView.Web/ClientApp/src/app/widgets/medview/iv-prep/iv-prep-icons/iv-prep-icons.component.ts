import {Component, AfterViewInit, Input, ViewChildren, OnChanges, SimpleChanges } from '@angular/core';
import * as D3 from 'd3';

import { Observable, timer } from 'rxjs';

import { IVPrepTypes } from './iv-prep-icons.types';


@Component({
    selector: 'iv-prep-icons',
    template: '<div #iconcontainer style="max-height: 30px; display: flex;"></div>',
    styleUrls: ['./iv-prep-icons.component.scss']
})
export class IvPrepIconsComponent implements AfterViewInit, OnChanges {
    private prepMaxCounter = 5;
    private deliveryMaxCounter = 3;

    private prepCounter: number;
    private deliveryCounter: number = undefined;
    private offset: number = 0;

    @Input()
    statusValue: 'COMPLETED' | 'QUEUEDPREP' | 'READYPREP' | 'INPREP' | 'READYCHECK' | 'READYDELIVERY' | 'DELIVERY';

    @Input()
    withDelivery: boolean = true;

    @Input()
    selected: boolean = false;

    @Input()
    dataDisplay: boolean = true;

    @Input()
    priority: boolean = false;

    @Input()
    statText: string = "S";

    @Input()
    onHoldText: string = "ON HOLD";

    @ViewChildren('iconcontainer')
    iconcontainer;

    private translateContainer(index) {
        return `translate(${(index - 1) * 20 + 15 + this.offset}, 18)`;
    }

    private setCircle(container: any, index: number): void {

        let iconContainer = container.append('g')
            .attr('transform', this.translateContainer(index));
        iconContainer.append('circle')
            .attr('r', '8')
            .attr('stroke-width', '1')
            .attr('stroke', `${this.selected ? 'white' : '#004593'}`)
            .attr('fill',
                () => {
                    if (index <= this.prepCounter) {
                        return `${this.selected ? 'white' : '#004593'}`;
                    } else {
                        return `${!this.selected ? 'white' : '#004593'}`;
                    }
            });
    }

    private setTriangle(container: any, index: number): void {
        const newindex = index + this.prepMaxCounter;

        let iconContainer = container.append('g')
            .attr('transform', this.translateContainer(newindex));

        iconContainer.append('polygon')
            .attr('points', () => `-5,-8 -5,9 10,0`)
            .attr('stroke-width', '1')
            .attr('stroke', `${this.selected ? 'white' : '#39B549'}`)
            .attr('fill',
                () => {
                    if (index <= this.deliveryCounter) {
                        return `${this.selected ? 'white' : '#39B549'}`;
                    } else {
                        return `${!this.selected ? 'white' : '#004593'}`;
                    }
                });
    }

    private setCircleWithTick(container: any, index: number) {
        let iconContainer = container.append('g')
            .attr('transform', this.translateContainer(index));
        iconContainer.append('circle')
            .attr('r', '8')
            .attr('stroke-width', '1')
            .attr('stroke', '#39B54A')
            .attr('fill',
                () => {
                    if (index <= this.prepCounter) {
                        return '#39B54A';
                    } else {
                        return 'white';
                    }
                });

        iconContainer.append('text')
            .attr('x', () => `-5`)
            .attr('y', '4')
            .attr('fill', '#FFFFFF')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', '10px')
            .text('\uf00c');

    }

    private renderGraphics() {
        this.prepCounter = IVPrepTypes[this.statusValue].prepValue;
        this.deliveryCounter = IVPrepTypes[this.statusValue].deliveryValue;
        timer(0).subscribe(() => {
            const svgChart = D3.select(this.iconcontainer.first.nativeElement)
            .html('')
                .append('svg')
                .attr('preserveAspectRatio', 'xMinYMin meet')
                .attr('width', `${this.iconcontainer.first.nativeElement.offsetWidth}`)
                .attr('height', '20')
                .attr('viewBox', `0 0 ${this.withDelivery ? 160 : 125} ${this.withDelivery ? 15 : 20}`)
                .classed('svg-content', true);


            const mainContainer: any = svgChart.append('g')
                .attr('class', 'icon-container')
                .attr('transform', 'translate(-6, -7)');

            this.offset = !this.withDelivery ? 15 : 0;

            for (let i = 1; i <= this.prepMaxCounter; i++) {
                if (!this.withDelivery && this.statusValue === 'DELIVERY' && i === this.prepMaxCounter) {
                    this.setCircleWithTick(mainContainer, i);
                } else {
                    this.setCircle(mainContainer, i);
                }
            }

            if (this.deliveryCounter !== undefined && this.withDelivery) {
                for (let i = 1; i <= this.deliveryMaxCounter; i++) {
                    this.setTriangle(mainContainer, i);
                }
            }

            if (this.dataDisplay) {

                let widthContainer = mainContainer.node().getBBox();
                mainContainer.attr("transform", `translate(${this.withDelivery ? 1 : -15}, -5.5) scale(0.9)`);

                if (this.priority) {

                    const statContainer = svgChart.append('g')
                        .attr('class', 'icon-container')
                        .attr('transform', 'translate(1, 1)');
                    statContainer.append("rect")
                        .attr("width", `${widthContainer.width}`)
                        .attr("height", "19")
                        .attr("style", "fill:transparent; stroke-width:1; stroke:red");
                    statContainer.append("rect")
                        .attr("transform", `translate(${widthContainer.width}, -2)`)
                        .attr("width", "15")
                        .attr("height", "21")
                        .attr("style", "fill:red; stroke-width:1; stroke:red");

                    statContainer.append('text')
                        .attr('x', () => `${widthContainer.width + 2}`)
                        .attr('y', '16')
                        .attr('fill', '#FFFFFF')
                        .attr('font-family', 'Roboto')
                        .attr('font-size', '16px')
                        .text(`${this.statText}`);
                }
            }
        });
    }

    ngAfterViewInit() {
        this.renderGraphics();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (changes.selected && changes.selected.previousValue !== undefined) {
                this.renderGraphics();
            }
            if (changes.priority && changes.priority.previousValue !== undefined) {
                this.renderGraphics();
            }
            if (changes.withDelivery && changes.withDelivery.previousValue !== undefined) {
                this.renderGraphics();
            }
        }
    }
}
