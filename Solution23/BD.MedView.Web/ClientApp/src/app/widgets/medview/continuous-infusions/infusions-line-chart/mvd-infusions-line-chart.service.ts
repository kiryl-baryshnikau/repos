import { Injectable, HostListener } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import * as D3 from 'd3';
import * as _ from 'lodash';

import { ResourceService } from 'container-framework';
import { FacilityLookUpService } from '../../../../services/facility-look-up.service';
import { MvdConstants } from '../../../shared/mvd-constants';
import { IvPrepModels } from '../../../shared/mvd-models';
import { IvPrepTransformationService } from '../../iv-prep/mvd-iv-prep-transformation.service';
import { MvdTimeTransformService } from '../../../services/mvd-time-transform.service';
import { ContinuousInfusionsModels as ciModels } from '../mvd-continuous-infusions-types';

@Injectable()
export class InfusionsLineDrawChartService {

    backgroundPath = 'dist/app/widgets/medview/continuous-infusions/infusions-line-chart/background.png';
    fullInfusionIcon = 'dist/app/widgets/medview/continuous-infusions/infusions-line-chart/header-icon-left.png';
    emptyInfusionIcon = 'dist/app/widgets/medview/continuous-infusions/infusions-line-chart/header-icon-rigth.png';
    arrowIcon = 'dist/app/widgets/medview/continuous-infusions/infusions-line-chart/arrow-icon.png';
    guardRailIcon = 'dist/app/widgets/medview/iv-status/guardrailcom/guardrailalerticon.png';
    infusionIconWidth = 15;
    infusionIconHeight = 30;
    arrowIconWidth = 37;
    arrowIconHeight = 16;

    nameZoneWidth = 300;
    barInfusionIcon = 24;
    headerHeight = 88;
    barHeight = 30;
    marginThresholdsTags = 12;
    thresholdsTagsHeight = 24;
    marginBottom = 30;

    rightPadding = 20;
    percentMargin = 3;

    myResources: any;
    thresholds: any;
    inputData: any;
    selectorBody: string;
    selectorHeader: string;
    displayRows: number;
    expandedTooltip = false;

    private notify = new Subject<any>();
    notifyObservable$ = this.notify.asObservable();

    private orderServiceEnabled = false;
    private selectedOrder: any;
    private selectedIvPrepDose: IvPrepModels.Dose;

    constructor(private resources: ResourceService,
        private facilityLookUpService: FacilityLookUpService,
        private ivPrepTransformationService: IvPrepTransformationService,
        private timeTransformService: MvdTimeTransformService) {
        this.getResources();
    }

    redrawChart(inputData: any, canvasWidth: number, selectorBody: string, selectorHeader: string, displayRows: number,
        infusionConfiguration: any, orderServiceEnabled, authorizationConfig: any) {
        this.orderServiceEnabled = orderServiceEnabled;
        this.defineThresholds(infusionConfiguration);
        this.selectorBody = selectorBody;
        this.selectorHeader = selectorHeader;
        this.inputData = inputData;
        this.renderChart(canvasWidth, authorizationConfig);
        this.displayRows = displayRows;
    }

    drawOrderServices(response: ciModels.OrderServiceResponse,
        ivPrepStateMapping$: Observable<IvPrepModels.StateMapping[]>, authorizationConfig: any) {
        // handle position
        const modalContainer = D3.select('body').select('.modal-container');
        let yPosition = Number.parseInt(modalContainer.style('top').replace('px', ''), 10);

        let positionOffset = 240;
        positionOffset += (response.infusionContainer.isAcknowledged) ? 50 : 0;
        positionOffset += (response.infusionContainer.guardRailWarning &&
            response.infusionContainer.guardRailWarning.countGRViolations > 0)
            ? 20
            : 0;

        const body: any = D3.select('body');
        if (yPosition + positionOffset > (body.node().getBoundingClientRect().height)) {
            let offset = (response.infusionContainer.guardRailWarning &&
                response.infusionContainer.guardRailWarning.countGRViolations > 0)
                ? 20
                : 0;
            offset += (response.infusionContainer.isAcknowledged) ? 50 : 0;
            offset += 200;

            yPosition = yPosition - offset;

            modalContainer.style('top', `${yPosition}px`);
        }

        this.modalMoreInfo(response.infusionContainer, response.orderServices, authorizationConfig);
    }

    closeModalWindow() {
        D3.select('body').selectAll('.modal-container').remove();
        this.expandedTooltip = false;

        // handle scrolling - temp
        const parent: any = D3.select(`.${this.selectorBody}`);
        try {
            if (parent && parent.node()) {
                D3.select(parent.node().parentNode).style('overflow-y', 'auto');
            }
        } catch (ex) {
        }
    }

    displayMessage(acknowledgedBy: string) {
        this.clearModalMoreInfo(true);

        D3.select('#modal-errors-placeholder')
            .html('')
            .append('div')
            .attr('class', 'normalText robotoRegular marginleft')
            .html(acknowledgedBy);

        const buttonContainer = D3.select('#modal-buttons-placeholder');
        buttonContainer.html('');
        buttonContainer.append('button')
            .attr('name', 'closeButton')
            .attr('class', 'btngraph btnsave fixedLineHeight')
            .html(this.myResources.confirmButton)
            .on('click',
                () => {
                    this.closeModalWindow();
                    this.refreshData();
                });
    }

    getNameZoneWidth() {
        return this.nameZoneWidth;
    }

    private getResources() {
        this.myResources = {
            Warning: this.resources.resource('warning'),
            Normal: this.resources.resource('normal'),
            Priority: this.resources.resource('priority'),
            Escalate: this.resources.resource('escalate'),
            Dose: this.resources.resource('dose'),
            Rate: this.resources.resource('rate'),
            Guardrails: this.resources.resource('guardrails'),
            acknowledge: this.resources.resource('acknowledge'),
            close: this.resources.resource('close'),
            replenishmentDetection: this.resources.resource('replenishmentDetection'),
            confirmButton: this.resources.resource('ok'),
            notApplicable: this.resources.resource('notApplicable'),
            orderStatus: this.resources.resource('orderStatus'),
            module: this.resources.resource('module'),
            order: this.resources.resource('order'),
            endTime: this.resources.resource('endTime'),
            endDate: this.resources.resource('endDate'),
            orderedDose: this.resources.resource('orderedDose'),
            startDateTime: this.resources.resource('startDateTime'),
            endDateTime: this.resources.resource('endDateTime'),
            encounterAbbr: this.resources.resource('encounterAbbr'),
            minAbbreviationGraph: this.resources.resource('minAbbreviationGraph'),

            unknown: this.resources.resource('unknown'),
            ivPrepPriority: this.resources.resource('ivPrepPriority'),
            ivPrepState: this.resources.resource('ivPrepState'),

            all: this.resources.resource('all'),
            queuedForPrep: this.resources.resource('queuedForPrep'),
            readyForPrep: this.resources.resource('readyForPrep'),
            inPrep: this.resources.resource('inPrep'),
            readyForCheck: this.resources.resource('readyForCheck'),
            readyForDelivery: this.resources.resource('readyForDelivery'),
            delivery: this.resources.resource('delivery'),
            ivPrepCompleted: this.resources.resource('ivPrepCompleted'),

            ivPrepNormal: this.resources.resource('ivPrepNormal'),
            stat: this.resources.resource('stat'),
            changeToPriorityStat: this.resources.resource('changeToPriorityStat'),

            orderNumber: this.resources.resource('orderNumber'),
            orderInstructions: this.resources.resource('orderInstructions'),
            start: this.resources.resource('start'),
            end: this.resources.resource('end'),

            matchingOrdersFoundInIvPrep: this.resources.resource('matchingOrdersFoundInIvPrep'),
            dispenseId: this.resources.resource('dispenseId'),
            dateTime: this.resources.resource('dateTime'),

            changePriorityToNormalAcknowledge: this.resources.resource('changePriorityToNormalAcknowledge'),
            changePriorityToStatAcknowledge: this.resources.resource('changePriorityToStatAcknowledge'),

            noOrdersMessage: this.resources.resource('noOrdersMessage'),
            matchingOrderFound: this.resources.resource('matchingOrderFound'),
            multipleMatchingOrdersFound: this.resources.resource('multipleMatchingOrdersFound'),
            orderSelected: this.resources.resource('orderSelected'),
            submitNextDoseViaPis: this.resources.resource('submitNextDoseViaPis'),
            ok: this.resources.resource('ok'),

            unableGetOrdersError: this.resources.resource('unableGetOrdersError'),
            unableToRetrieveIvPrepDetails: this.resources.resource('unableToRetrieveIvPrepDetails'),

            infusionAlreadyAcknowledged: this.resources.resource('infusionAlreadyAcknowledged'),
            acknowledgedBy: this.resources.resource('acknowledgedBy'),
            atDateTime: this.resources.resource('atDateTime'),
            noMatchingOrdersFoundInIvPrep: this.resources.resource('noMatchingOrdersFoundInIvPrep'),
            seeMore: this.resources.resource('seeMore'),
            unavailable: this.resources.resource('unavailable')
        };
    }

    private defineThresholds(infusionConfiguration: any) {
        if (infusionConfiguration) {
            this.thresholds = {
                MinValue: 0,
                Escalate: infusionConfiguration.urgentThreshold,
                Priority: infusionConfiguration.priorityThreshold,
                Warning: infusionConfiguration.warningThreshold,
                Normal: infusionConfiguration.warningThreshold + 15
            };
        } else {
            this.thresholds = {
                MinValue: 0,
                Escalate: 30,
                Priority: 60,
                Warning: 90,
                Normal: 105
            };
        }
    }

    private renderChart(canvasWidth: number, authorizationConfig: any) {
        const inputData = this.inputData;

        // thresholds
        const dataBoxes = [
            this.thresholds.MinValue,
            this.thresholds.Escalate,
            this.thresholds.Priority,
            this.thresholds.Warning,
            this.thresholds.Normal
        ];

        // thresholds tags
        const thresholdsTags = [
            { name: this.myResources.Normal, value: this.thresholds.Normal },
            { name: this.myResources.Warning, value: this.thresholds.Warning },
            { name: this.myResources.Priority, value: this.thresholds.Priority }
        ];

        D3.selectAll('svg > *').remove();

        canvasWidth = canvasWidth * ((100 - this.percentMargin) / 100);

        // define new canvas width for right padding
        const paintAreaWidth = canvasWidth - this.rightPadding;

        // define scale
        const x = this.defineScale(dataBoxes, paintAreaWidth, this.nameZoneWidth);

        // ****************draw header

        // define header area
        const headerChart = D3.select(`.${this.selectorHeader}`)
            .attr('width', canvasWidth)
            .attr('height', this.headerHeight);
        // .call(this.responsivefy.bind(this));

        // paint header indicators
        this.paintHeaderIndicators(headerChart, paintAreaWidth);
        // paint thresholds header
        this.paintThresholdsHeader(headerChart, thresholdsTags, x);
        // paint thresholds
        this.paintThresholds(headerChart, inputData, dataBoxes, x, true);

        // define axis
        const xAxis = D3.axisTop(x).ticks(this.thresholds.Normal).tickSize(3);
        headerChart.append('g')
            .attr('class', 'axisContainer')
            .attr('transform', 'translate(' + this.nameZoneWidth + ', ' + this.headerHeight + ')')
            .call(xAxis);

        // paint resume
        this.paintSummary(headerChart, inputData.summary);

        // ****************draw body
        // define canvas
        const chart = D3.select(`.${this.selectorBody}`)
            .attr('pointer-events', 'none')
            .attr('width', canvasWidth)
            .attr('height', this.barHeight * inputData.data.length + this.marginBottom);
        // .call(this.responsivefy.bind(this));

        // draw escalate zone
        this.drawEscalateZone(chart, inputData, x);

        // draw thresholds for body
        this.paintThresholds(chart, inputData, dataBoxes, x, false);

        // define areas for every record
        this.drawData(chart, inputData, paintAreaWidth, x, authorizationConfig);
    }

    private drawEscalateZone(parent: any, inputData: any, scale: any) {

        const warningZoneWidth = scale(this.thresholds.Normal - this.thresholds.Escalate) - scale(this.thresholds.Normal);

        const defs = parent.append('defs');
        const pattern = parent.append('pattern')
            .attr('id', 'diagonal-stripes')
            .attr('width', '25')
            .attr('height', '25')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternTransform', 'rotate(45)')
            .append('rect')
            .attr('width', '13')
            .attr('height', '40')
            .attr('transform', 'translate(0,0)')
            .attr('fill', '#FDE0E5');


        // define escalate zone
        const warningZone = parent.append('g')
            .attr('class', 'lastcontainer')
            .attr('transform', function (d: any, i: number) {
                return 'translate(' + this.offsetDataDisplay(this.thresholds.Escalate, scale) + ', 0)';
            }.bind(this));

        warningZone.append('rect')
            .attr('width', warningZoneWidth)
            .attr('height', this.barHeight * inputData.data.length)
            .attr('fill', 'url(#diagonal-stripes)');
    }

    private drawData(parent: any, inputData: any, canvasWidth: number, scale: any, authorizationConfig: any) {
        try {

            const warningZoneWidth = scale(this.thresholds.Normal - this.thresholds.Escalate) - scale(this.thresholds.Normal);

            const bar = parent.selectAll('g.container')
                .data(inputData.data)
                .enter()
                .append('g')
                .attr('class', 'container')
                .attr('transform', function (d: any, i: number) {
                    return 'translate(0,' + (i * this.barHeight) + ')';
                }.bind(this));

            // paint patients names borders
            parent.append('line')
                .attr('class', 'borderseparators')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', canvasWidth - warningZoneWidth)
                .attr('y2', 0);

            // check if last record
            const lastBorderWidth = function (i: number) {
                if (i === (inputData.data.length - 1)) {
                    return canvasWidth;
                } else {
                    return canvasWidth - warningZoneWidth;
                }
            };

            bar.append('line')
                .attr('class', 'borderseparators')
                .attr('x1', 0)
                .attr('y1', this.barHeight)
                .attr('x2', function (d: any, i: number) { return lastBorderWidth(i); })
                .attr('y2', this.barHeight);

            // paint patients names
            bar.append('rect')
                .attr('class', 'lastcontainer cursorPointer')
                .attr('width', this.nameZoneWidth)
                .attr('height', this.barHeight)
                .attr('x', 0)
                .attr('y', 0)
                .attr('pointer-events', 'all')
                .on('mouseover', function (d: any) {
                    this.onIconMouseOver(d, null, authorizationConfig);
                }.bind(this))
                .on('mousemove', function (d: any) {
                    this.onIconMouseOver(d, null, authorizationConfig);
                }.bind(this))
                .on('mouseout', function (d: any, i: any) {
                    if (!this.expandedTooltip) {
                        D3.select('body').selectAll('.modal-container').remove();
                    }
                }.bind(this))
                .on('click', (d: any) => this.onGraphClick(parent, d, authorizationConfig));

            bar.append('path')
                .attr('class', function (d: any) {
                    return this.defineColor(d.estimatedTimeTillEmpty);
                }.bind(this))
                .attr('d', function (d: any) {
                    return this.returnIconType(d, true, 'estimatedTimeTillEmpty');
                }.bind(this))
                .attr('transform', function (d: any) {
                    if (d.estimatedTimeTillEmpty > this.thresholds.Priority) {
                        return 'translate(20,' + this.barHeight / 2 + ')';
                    } else {
                        return 'translate(20,' + this.barHeight / 2 + ') rotate(-45)';
                    }
                }.bind(this));

            bar.append('text')
                .attr('class', (d: any) => {
                    return 'name' + (d.containerStatus === 1203 || d.isAcknowledged ? ' stoppedname' : '');
                })
                .attr('x', 0)
                .attr('y', this.barHeight / 2)
                .attr('dy', '.35em')
                .text(function (d: any) {
                    return d.patientInformation.length > 75 ? `${d.patientInformation.slice(0, 75)}...` : d.patientInformation;
                });

            bar.selectAll('text.name')
                .call(this.wrap, this.nameZoneWidth - 30);

            // paint bars
            bar.append('line')
                .attr('x1', this.nameZoneWidth)
                .attr('x2', function (d: any) {
                    if (!isNaN(d.estimatedTimeTillEmpty)) {
                        return this.offsetDataDisplay(d.estimatedTimeTillEmpty, scale);
                    }
                }.bind(this))
                .attr('y1', this.barHeight / 2)
                .attr('y2', this.barHeight / 2)
                .attr('class', function (d: any) {
                    if (!isNaN(d.estimatedTimeTillEmpty)) {
                        let cssclass = 'linegraph';
                        if (d.containerStatus === 1203 && d.isAcknowledged) {
                            cssclass += ' stopped-line';
                            if (d.containerStatus === 1203) {
                                cssclass += ' line-dotted';
                            }
                        } else if (d.containerStatus === 1203 && !d.isAcknowledged) {
                            cssclass += ' stopped-line';
                            cssclass += ' line-dotted';
                            cssclass += ' stroke' + this.defineColor(d.estimatedTimeTillEmpty);

                        } else {
                            if (!d.isAcknowledged) {
                                cssclass += ' stroke' + this.defineColor(d.estimatedTimeTillEmpty);
                            } else {
                                cssclass += ' stopped-line';
                            }
                        }

                        return cssclass;
                    }
                }.bind(this));

            // paint label
            bar.append('text')
                .attr('class', function (d: any) {
                    let cssclass = 'labelbars';
                    if (d.containerStatus === 1203 || d.isAcknowledged) {
                        cssclass += ' stoppedname';
                    }
                    return cssclass;
                }.bind(this))
                .attr('x', function (d: any) {
                    if (!isNaN(d.estimatedTimeTillEmpty)) {
                        if ((d.estimatedTimeTillEmpty < (this.thresholds.MinValue + 10)) || d.containerStatus === 1203) {
                            return this.offsetDataDisplay(d.estimatedTimeTillEmpty, scale) - 60;
                        } else {
                            return this.offsetDataDisplay(d.estimatedTimeTillEmpty, scale) + 20;
                        }
                    }
                }.bind(this))
                .attr('y', function (d: any) {
                    if (!isNaN(d.estimatedTimeTillEmpty)) {
                        if ((d.estimatedTimeTillEmpty < (this.thresholds.MinValue + 10)) || d.containerStatus === 1203) {
                            return this.barHeight / 2 - 10;
                        } else {
                            return this.barHeight / 2;
                        }
                    }
                }.bind(this))
                .attr('dy', '.35em')
                .text(function (d: any) { return d.displayStatus; });

            // paint Icon

            bar.append('path')
                .attr('class', function (d: any) {
                    return 'iconBars '
                        + (d.isAcknowledged ? 'acknowledgedColor' : this.defineColor(d.estimatedTimeTillEmpty))
                        + (d.estimatedTimeTillEmpty > this.thresholds.Warning
                            ? ' circle'
                            : d.estimatedTimeTillEmpty > this.thresholds.Priority ? ' triangle' : ' diamond');
                }.bind(this))
                .attr('pointer-events', 'all')
                .attr('d', function (d: any) { return this.returnIconType(d, false, 'estimatedTimeTillEmpty'); }.bind(this))
                .attr('transform', function (d: any) {
                    let value = 'translate(' + (this.offsetDataDisplay(d.estimatedTimeTillEmpty, scale)) + ',' + this.barHeight / 2 + ')';
                    if (d.estimatedTimeTillEmpty <= this.thresholds.Priority) {
                        value = value + ' rotate(-45)';
                    }
                    return value;
                }.bind(this))
                .on('mouseover', function (d: any) {
                    this.onIconMouseOver(d, D3.select(D3.event.currentTarget), authorizationConfig);
                }.bind(this))
                .on('mouseout', function (d: any, i: any) {
                    if (!this.expandedTooltip) {
                        const canvas: any = D3.select('body').selectAll('.modal-container').remove();
                    }
                }.bind(this))
                .on('click', (d: any) => this.onGraphClick(parent, d, authorizationConfig));

            bar.filter((d: any) => {
                return (d.medMinedAlerts && d.medMinedAlerts.length > 0) && !(d.guardRailWarning && d.guardRailWarning.countGRViolations > 0);
            }).append('text')
                .attr('class', (d) => 'textGuardRailWarning ' + `uuid${d.uuid}`)
                .attr('style', 'display: block')
                .attr('transform', function (d: any) {
                    return 'translate(' + (this.offsetDataDisplay(d.estimatedTimeTillEmpty, scale)) + ',' + (this.barHeight / 2 + 4) + ')';
                }.bind(this))
                .text('!');

            bar.filter((d: any) => {
                return !(d.medMinedAlerts && d.medMinedAlerts.length > 0) && (d.guardRailWarning && d.guardRailWarning.countGRViolations > 0);
            })
                .append('text')
                .attr('class', 'textGuardRailWarning')
                .attr('transform', function (d: any) {
                    return 'translate(' + (this.offsetDataDisplay(d.estimatedTimeTillEmpty, scale)) + ',' + (this.barHeight / 2 + 4) + ')';
                }.bind(this))
                .text(`${this.myResources.Guardrails ? this.myResources.Guardrails[0] : 'G'}`);

            bar.filter((d: any) => {
                return (d.medMinedAlerts && d.medMinedAlerts.length > 0) && (d.guardRailWarning && d.guardRailWarning.countGRViolations > 0);
            })
                .append('text')
                .attr('class', 'textGuardRailWarning')
                .attr('transform', function (d: any) {
                    return 'translate(' + (this.offsetDataDisplay(d.estimatedTimeTillEmpty, scale)) + ',' + (this.barHeight / 2 + 4) + ')';
                }.bind(this))
                .text(`2`);

        } catch (e) {
        }
    }

    private onIconMouseOver(data: any, target: any, authorizationConfig: any) {
        if (!this.expandedTooltip) {
            this.createModal(data, authorizationConfig, target);
        }
    }

    private onGraphClick(parent, d: any, authorizationConfig: any) {
        if (!this.hasRole(MvdConstants.PHARMACIST_ROLE_ID, d.adtFacility, authorizationConfig)) {
            return;
        }

        if (!this.expandedTooltip) {
            if (document.getElementsByClassName('modal-container').length !== 1) {
                this.createModal(d, authorizationConfig, null);
            }
            this.expandModalPopUp(parent, d);
        }
    }

    private calcPopupPosition(canvas: any, target: any): { xPosition: number, yPosition: number } {
        const mousePosition = D3.mouse(canvas.node());

        let targetWidth = 0;
        let targetHeight = 0;

        let xPosition = mousePosition[0];
        let yPosition = mousePosition[1];

        if (target) {
            const mouseOverIcon = D3.mouse(target.node());
            targetWidth = target.node().getBBox().width;
            targetHeight = target.node().getBBox().height;
            xPosition = xPosition - mouseOverIcon[0];
            yPosition = yPosition - mouseOverIcon[1];
        }

        const popupWidth = 415;
        const offsetX = 15;

        if (yPosition + 130 > (canvas.node().getBoundingClientRect().height)) {
            yPosition = yPosition - targetHeight / 2 - 150;
        } else {
            yPosition = yPosition + targetHeight / 2 - 100;
        }
        if (xPosition + 420 > canvas.node().getBoundingClientRect().width) {
            xPosition = xPosition - targetWidth / 2 - popupWidth - offsetX;
        } else {
            xPosition = xPosition + targetWidth / 2 + offsetX;
        }
        return { xPosition, yPosition };
    }

    private createModal(data: any, authorizationConfig: any, target?: any) {
        const canvas: any = D3.select('body');
        const { xPosition, yPosition } = this.calcPopupPosition(canvas, target);

        D3.select('body').selectAll('.modal-container').remove();

        const modalContainer = canvas.append('div').attr('class', 'modal-container')
            .style('z-index', '1999')
            .style('position', 'absolute')
            .style('left', xPosition + 'px')
            .style('top', `${yPosition + 45}px`);

        const tooltipContainer = modalContainer.append('div').attr('class', 'tooltip-container');

        // Summary
        tooltipContainer.append('div').attr('class', 'modal-order-summary-placeholder');

        // Acknowledge Placeholder
        tooltipContainer.append('div').attr('class', 'modal-order-acknowledge-placeholder').style('display', 'none');

        // Order service Placeholder
        tooltipContainer.append('div').attr('class', 'modal-order-service-placeholder').style('display', 'none');

        // Iv Prep placeholder
        tooltipContainer.append('div').attr('class', 'modal-iv-prep-placeholder').style('display', 'none');

        // Error messages placeholder
        tooltipContainer.append('div').attr('id', 'modal-errors-placeholder').attr('class', 'flexMarginTop').style('display', 'none');

        // Buttons placeholder
        tooltipContainer.append('div').attr('id', 'modal-buttons-placeholder').attr('class', 'buttonContainer').style('display', 'none');

        this.drawPopupSummary(data, authorizationConfig);
    }

    private drawPopupSummary(data: any, authorizationConfig: any): void {
        const hasGuardrails = data.guardRailWarning && data.guardRailWarning.countGRViolations > 0;

        const summaryPlaceHolder = D3.select('.modal-container .modal-order-summary-placeholder');
        summaryPlaceHolder.html('');

        // Close icon
        const topButtonContainer = summaryPlaceHolder.append('div')
            .attr('class', 'top-bar float-right')
            .style('display', 'none');
        topButtonContainer.append('span')
            .attr('class', 'fa fa-times-circle')
            .attr('title', `${this.myResources.close}`)
            .on('click', () => this.closeModalWindow());

        // Summary Container
        const summaryContainer = summaryPlaceHolder.append('div')
            .attr('class', () => hasGuardrails ? 'summaryContainer withGuardrails' : 'summaryContainer');

        // State image, Title
        const summaryTitleContainer = summaryContainer.append('div')
            .attr('class', 'summary-title-container');
        summaryTitleContainer.append('div')
            .attr('class', () => 'summary-priority-img' + this.definePriorityImgClass(data));
        summaryTitleContainer.append('div')
            .attr('class', 'summary-title')
            .text(`${data.infusionName} (${data.drugAmountDiluentVolume})`);

        // Patient name, Patient Id
        summaryContainer.append('div')
            .attr('class', 'summary-content')
            .text(`${data.patientName} ${data.patientIdDisplay}`);

        // Facility, Unit, Room
        summaryContainer.append('div')
            .attr('class', 'summary-content')
            .text(`${data.masterFacilityUnitRoom}`);

        // Dose - Rate info
        const doseRate = summaryContainer.append('div')
            .attr('class', 'moreInfoContainer')
            .style('margin-top', '5px');
        const leftColumn = doseRate.append('div')
            .attr('class', 'moreInfoColumn');
        const rightColumn = doseRate.append('div')
            .attr('class', 'moreInfoColumn');

        let row = leftColumn.append('div')
            .attr('class', 'moreInfoContainer');
        row.append('div')
            .attr('class', 'summary-content-label')
            .text(this.myResources.Dose);
        row.append('div')
            .attr('class', 'summary-content')
            .text(data.dose);

        row = rightColumn.append('div')
            .attr('class', 'moreInfoContainer');
        row.append('div')
            .attr('class', 'summary-content-label')
            .text(this.myResources.Rate);
        row.append('div')
            .attr('class', 'summary-content')
            .text(data.rate);

        // Guardrails warnings
        if (data.guardRailWarning && data.guardRailWarning.countGRViolations > 0) {
            this.drawGuardRailWarnings(summaryContainer, data);
        }

        if (data.medMinedAlerts && data.medMinedAlerts.length > 0) {
            this.drawMedminedAlerts(summaryContainer, data);
        }
    }

    private drawMedminedAlerts(parent: any, data: any) {

        let alertTitles = '';
        data.medMinedAlerts.forEach((a) => {
            if (alertTitles !== '') {
                alertTitles += ', ';
            }
            alertTitles += a.alertTitle;
        });

        const medminedAlertArea = parent.append('div')
            .attr('class', 'medminedalert-container')
            .style('cursor', 'pointer')
            .on('click', () => this.onMedminedAlertClick(data));

        medminedAlertArea.append('div')
            .attr('class', 'medminedalert-icon');

        medminedAlertArea.append('span')
            .attr('class', 'medminedalert-title-list')
            .text(alertTitles);
    }

    private onMedminedAlertClick(data: any) {
        console.log(`Display alerts for`, data.medMinedAlerts);
        this.closeModalWindow();
        this.notify.next({
            event: 'DisplayMedminedAlert',
            alerts: data.medMinedAlerts
        });
    }

    private drawGuardRailWarnings(parent: any, data: any) {
        let guardrailsMessage = '';
        data.guardRailWarning.messages.forEach((a) => {
            if (guardrailsMessage !== '') {
                guardrailsMessage += ', ';
            }
            guardrailsMessage += a;
        });

        const guardRailArea = parent.append('div')
            .attr('class', 'guardrail-container');

        guardRailArea.append('div')
            .attr('class', 'guardrail-icon');

        guardRailArea.append('span')
            .attr('class', 'guardrail-violation-list')
            .text(guardrailsMessage.toUpperCase());
    }

    private expandModalPopUp(parent: any, infusionData: any) {
        this.expandedTooltip = true;

        D3.select('body')
            .select('.modal-container')
            .select('.tooltip-container')
            .style('display', 'block');

        // Show close icon
        D3.select('.modal-container div.top-bar').style('display', null);

        // Show horizontal line
        D3.select('.modal-container .modal-order-summary-placeholder').append('div')
            .attr('class', () => 'horizontal-line' + this.defineHorizontalLineColor(infusionData));

        // handle scrolling - temp
        D3.select(parent.node().parentNode).style('overflow', 'hidden');

        // Already acknowledged
        if (infusionData.isAcknowledged) {
            this.drawAcknowledgedMessage(infusionData);
            return;
        }

        // No order service enabled -> Show acknowledge button only
        if (!this.orderServiceEnabled) {
            this.drawPopupActionButtons(infusionData, [], [], false);
            return;
        }

        // Get order services
        this.onRequestOrderServices(infusionData);
    }

    private clearModalMoreInfo(clearOrdersPlaceholder: boolean) {
        this.selectedOrder = undefined;
        this.selectedIvPrepDose = undefined;

        const selectors = ['.modal-order-acknowledge-placeholder',
            '.modal-iv-prep-placeholder',
            '#modal-errors-placeholder',
            '#modal-buttons-placeholder'
        ];

        if (clearOrdersPlaceholder) {
            selectors.push('.modal-order-service-placeholder');
        }

        selectors.forEach(selector => {
            const element = D3.select(selector);
            if (element) {
                element.html('');
            }
        });
    }

    private modalMoreInfo(infusionData: any, orders: any, authorizationConfig: any): void {
        this.clearModalMoreInfo(true);

        // No orders
        if (orders.length <= 0) {
            this.drawEmptyOrders();
            this.drawPopupActionButtons(infusionData, [], [], false);
            return;
        }

        // One or more orders found
        this.drawOrders(infusionData, orders);

        // If no cato facilities -> don't query IV Prep
        const hasCatoFacilities = this.hasCatoFacilities(authorizationConfig);
        if (!hasCatoFacilities) {
            this.drawPopupActionButtons(infusionData, orders, [], false);
            return;
        }

        // Single order workflow -> Select first order to trigger query to IV Prep
        if (orders.length === 1) {
            this.onOrderSelected(infusionData, orders[0], false);
            return;
        }

        // Multiple orders workflow -> Wait for user selection
        this.drawPopupActionButtons(infusionData, orders, [], hasCatoFacilities);
    }

    doSelectedOrderWorkflow(response: ciModels.OrderSelectedResponse,
        ivPrepStateMapping$: Observable<IvPrepModels.StateMapping[]>): void {

        this.clearModalMoreInfo(response.isMultipleOrdersWorkflow);
        this.drawOrders(response.infusionData, [response.order], response.isMultipleOrdersWorkflow);
        this.drawIvPrepDoses(response.ivPrepConfig, response.doses, ivPrepStateMapping$);
        this.drawPopupActionButtons(response.infusionData, [response.order], response.doses, true);
    }

    private drawAcknowledgedMessage(infusionData: any): void {
        const placeholder = D3.select('.modal-order-acknowledge-placeholder');
        placeholder.style('display', 'none');
        placeholder.html('');

        const container = placeholder.append('div').attr('class', 'acknowledge-message-container');

        // Title
        container.append('div').style('margin-bottom', '10px')
            .append('span').attr('class', 'acknowledge-title').text(`${this.myResources.infusionAlreadyAcknowledged}`);

        const dataContainer = container.append('div').attr('class', 'acknowledge-data-container');

        // Acknowledged by
        let row = dataContainer.append('div').attr('class', 'moreInfoContainer');
        row.append('div').attr('class', 'acknowledge-label').text(`${this.myResources.acknowledgedBy}:`);
        row.append('div').attr('class', 'text').text(infusionData.acknowledgedBy);

        // At Date/Time
        row = dataContainer.append('div').attr('class', 'moreInfoContainer');
        row.append('div').attr('class', 'acknowledge-label').text(`${this.myResources.atDateTime}:`);
        row.append('div').attr('class', 'text').text(infusionData.acknowledgetAt);

        placeholder.style('display', 'block');
    }

    private getContainer(selector: string, containerClass: string): any {
        const placeholder = D3.select(selector);
        placeholder.html('');
        placeholder.style('display', 'block');
        return placeholder.append('div').attr('class', containerClass);
    }

    private getIvPrepContainer(): any {
        return this.getContainer('.modal-iv-prep-placeholder', 'iv-prep-doses-container');
    }

    private getOrderServicesContainer(): any {
        return this.getContainer('.modal-order-service-placeholder', 'order-services-container');
    }


    drawOrdersErrorMessage(data: ciModels.OrderServiceResponse): void {
        const container = this.getOrderServicesContainer()
            .append('div').style('display', 'flex');

        container.append('div').attr('class', 'ci-counter-container');
        container.append('div').append('span').attr('class', 'dose-error-message').text(`${this.myResources.unableGetOrdersError}`);

        this.drawPopupActionButtons(data.infusionContainer, [], [], false);
    }

    private drawEmptyOrders() {
        const orderServicesContainer = this.getOrderServicesContainer();
        this.drawOrdersCounters(orderServicesContainer, 0);
    }

    private drawOrders(infusionData: any, orders: any[], isMultipleOrdersWorkflow = false) {
        const orderServicesContainer = this.getOrderServicesContainer();

        this.drawOrdersCounters(orderServicesContainer, orders.length, isMultipleOrdersWorkflow);

        const dataContainer = orderServicesContainer.append('div').attr('display', 'flex').style('margin-top', '14px');
        if (orders.length > 1) {
            dataContainer.style('max-height', '315px').style('overflow-y', 'auto');
        }
        const orderServicesDivs = dataContainer.selectAll('div.order-service')
            .data(orders)
            .enter()
            .append('div').attr('class', 'order-service');

        this.drawOrder(orderServicesDivs, infusionData, orders);
    }

    private drawOrdersCounters(orderServiceContainer, count: number, isMultipleOrdersWorkflow = false): void {
        const container = orderServiceContainer.append('div').style('display', 'flex');

        // Counter
        container.append('div').attr('class', 'ci-counter-container')
            .append('span').attr('class', 'counter-text').text(count);

        // label
        const label = isMultipleOrdersWorkflow
            ? this.myResources.orderSelected
            : count <= 0
                ? this.myResources.noOrdersMessage
                : count > 1
                    ? this.myResources.multipleMatchingOrdersFound
                    : this.myResources.matchingOrderFound;

        let labelClass = 'counter-label single-line';
        if (count > 1) { labelClass += ' red'; }
        container.append('div').append('span').attr('class', labelClass).text(label);
    }

    private drawOrder(orderServiceContainer, infusionData: any, orders: any[]) {
        this.drawOrderTitle(orderServiceContainer, infusionData);
        this.drawOrderDetails(orderServiceContainer);
        this.drawOrderInstructions(orderServiceContainer, orders);
    }

    private drawOrderTitle(parent: any, infusionData: any) {
        const mainContainer = parent.append('div').style('display', 'flex').style('min-height', '29px');

        // Radio button
        const radioButtonContainer = mainContainer.append('div').style('margin', '3px 20px 0 18px').style('display', 'flex');
        const radioButton = radioButtonContainer.append('input')
            .attr('type', 'radio')
            .attr('name', 'orderOption')
            .attr('value', order => JSON.stringify(order))
            .on('click', order => {
                this.selectedOrder = order;
            });
        radioButton.filter((d, i) => i === 0)
            .attr('checked', order => {
                this.selectedOrder = order;
                return 'checked';
            });

        const titleDataContainer = mainContainer.append('div')
            .style('display', 'flex').style('flex-direction', 'column');

        // Solution name
        let row = titleDataContainer.append('div').attr('class', 'order-solution-name');
        row.append('span').text((d) => d.solutionName);

        // Patient
        row = titleDataContainer.append('div').attr('class', 'order-patient-data');
        row.append('div').text((d) => `${infusionData.patientName} (${d.patientId})`);
    }

    private drawOrderDetails(parent: any) {
        const details = parent.append('div').style('display', 'flex').style('margin-top', '8px').style('min-height', '43px');
        const leftColumn = details.append('div').attr('class', 'moreInfoColumn');
        const rightColumn = details.append('div').attr('class', 'moreInfoColumn');

        // Encounter
        let row = leftColumn.append('div')
            .attr('class', 'moreInfoContainer');
        row.append('div')
            .attr('class', 'order-label left')
            .text(`${this.myResources.encounterAbbr}:`);
        row.append('div')
            .attr('class', 'text')
            .text((d) => d.encounterId || this.myResources.unavailable);

        // Order #
        row = leftColumn.append('div')
            .attr('class', 'moreInfoContainer');
        row.append('div')
            .attr('class', 'order-label left')
            .text(`${this.myResources.orderNumber}:`);
        row.append('div')
            .attr('class', 'text')
            .text((d) => d.orderNumber || '');

        // Order status
        row = leftColumn.append('div')
            .attr('class', 'moreInfoContainer');
        row.append('div')
            .attr('class', 'order-label left')
            .text(`${this.myResources.orderStatus}:`);
        row.append('div')
            .attr('class', 'text')
            .text((d) => d.orderStatus);


        // Right column

        // Ordered Dose
        row = rightColumn.append('div').attr('class', 'moreInfoContainer');
        row.append('div').attr('class', 'order-label right').text(`${this.myResources.orderedDose}:`);
        const orderedDose = row.append('div').attr('class', 'text').text(null);
        orderedDose.append('tspan').style('display', 'block').text((d) => d.dose);
        orderedDose.append('tspan').text((d) => d.rate);

        // Start date/time
        row = rightColumn.append('div').attr('class', 'moreInfoContainer');
        row.append('div').attr('class', 'order-label right').text(`${this.myResources.start}:`);
        row.append('div').attr('class', 'text').text((d) => d.startDate);

        // End date/time
        row = rightColumn.append('div').attr('class', 'moreInfoContainer');
        row.append('div').attr('class', 'order-label right').text(`${this.myResources.end}:`);
        row.append('div').attr('class', 'text').text((d) => d.endDate);
    }

    private drawOrderInstructions(parent: any, orders: any[]) {
        if (orders.length === 1) { parent.style('max-height', '147px'); }

        const row = parent.append('div').attr('class', 'order-instructions');
        const labelNode = row.append('span').attr('class', 'order-label').text(`${this.myResources.orderInstructions}:`);

        const maxWidth = (row.node().clientWidth * 1.7) - labelNode.node().clientWidth - 60;

        // For short Instructions
        row.filter(d => this.getOrderInstructionsTextWidth(d.orderInstructions) < maxWidth)
            .append('span').attr('class', 'text')
            .text((d) => d.orderInstructions);

        // For long Instructions (Show See more)
        const longInstructionRow = row.filter(d => this.getOrderInstructionsTextWidth(d.orderInstructions) >= maxWidth);
        longInstructionRow.append('span').attr('class', 'text')
            .text(d => `${this.getLongOrderInstructionsText(d.orderInstructions, maxWidth)}... `);

        longInstructionRow.append('a').style('cursor', 'pointer').text( `${this.myResources.seeMore}`)
            .on('click', function (d) {
                const parentNode = D3.select(this.parentNode);
                parentNode.select('a').style('display', 'none');
                parentNode.selectAll('span.text').text(d.orderInstructions);
            });
    }
    private getOrderInstructionsTextWidth(text: string): number {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = '13px Roboto';
        const width = ctx.measureText(text).width;
        return width;
    }

    private getLongOrderInstructionsText(text: string, maxWidth: number): string {
        const seeMoreText = `... ${this.myResources.seeMore}`;
        let result = text;
        while (result.length > 0 && ((this.getOrderInstructionsTextWidth(`${result}${seeMoreText}`)) > maxWidth)) {
            result = result.substring(0, result.length - 1);
        }

        return result;
    }

    drawIvPrepErrorMessage(event: { infusionData: any, order: any, isMultipleOrdersWorkflow: boolean }): void {
        if (event.isMultipleOrdersWorkflow) {
            this.clearModalMoreInfo(true);
            this.drawOrders(event.infusionData, [event.order], true);
        }

        const container = this.getIvPrepContainer().append('div').style('display', 'flex');

        container.append('div').attr('class', 'ci-counter-container');
        container.append('div').append('span').attr('class', 'dose-error-message')
            .text(`${this.myResources.unableToRetrieveIvPrepDetails}`);

        this.drawPopupActionButtons(event.infusionData, [], [], true);
    }

    private drawIvPrepDoses(ivPrepConfig: IvPrepModels.ApiConfig, ivPrepDoses: IvPrepModels.Dose[],
        ivPrepStateMapping$: Observable<IvPrepModels.StateMapping[]>): void {
        const ivPrepPlaceholder = D3.select('.modal-container .modal-iv-prep-placeholder');
        ivPrepPlaceholder.style('display', 'block');
        const dosesContainer = ivPrepPlaceholder.append('div').attr('class', 'iv-prep-doses-container');

        this.drawIvPrepCounters(dosesContainer, ivPrepDoses);

        // Doses information
        if (ivPrepDoses && ivPrepDoses.length > 0) {
            const dataContainer = dosesContainer.append('div').attr('display', 'flex')
                .style('max-height', '180px').style('overflow-y', 'auto').style('margin-top', '14px');
            const ivPrepContainer = dataContainer.selectAll('div.iv-prep-dose')
                .data(ivPrepDoses)
                .enter()
                .append('div').attr('class', 'iv-prep-dose');

            this.drawIvPrepDose(ivPrepContainer, ivPrepStateMapping$, ivPrepConfig);
        }
    }

    private drawIvPrepCounters(doseContainer, ivPrepDoses: IvPrepModels.Dose[]) {
        const container = doseContainer.append('div').style('display', 'flex');

        // Counter
        const count = ivPrepDoses && ivPrepDoses.length > 0 ? ivPrepDoses.length : 0;
        container.append('div').attr('class', 'ci-counter-container')
            .append('span').attr('class', 'counter-text').text(count);

        // Text
        const textContainer = container.append('div').attr('class', 'counter-label-container');
        if (ivPrepDoses.length > 0) {
            textContainer.append('span').attr('class', 'counter-label single-line')
                .text(`${this.myResources.matchingOrdersFoundInIvPrep}`);
        } else {
            textContainer
                .append('span').attr('class', 'counter-label').style('display', 'block')
                .text(`${this.myResources.noMatchingOrdersFoundInIvPrep}`);
            textContainer
                .append('span').attr('class', 'counter-label').style('display', 'block')
                .text(`${this.myResources.submitNextDoseViaPis}`);
        }
    }

    private drawIvPrepDose(ivPrepContainer: any, ivPrepStateMapping$: Observable<IvPrepModels.StateMapping[]>,
        ivPrepConfig: IvPrepModels.ApiConfig): void {
        const dateTimeFormat = 'MM/DD/YY  HH:mm';
        const container = ivPrepContainer.append('div')
            .attr('class', 'dose-container');

        const leftColumn = container.append('div').attr('class', 'moreInfoColumn');
        const rightColumn = container.append('div').attr('class', 'moreInfoColumn');

        // Left column
        let row = leftColumn.append('div').attr('class', 'moreInfoContainer');
        this.drawIvPrepState(row, ivPrepStateMapping$);

        // Right column
        // Dispense ID
        row = rightColumn.append('div').attr('class', 'moreInfoContainer');
        row.append('div').attr('class', 'dose-label right')
            .text(`${this.myResources.dispenseId}:`);
        row.append('div').attr('class', 'text')
            .text((d: IvPrepModels.Dose) => d.DispenseId || '');

        // Date/Time
        row = rightColumn.append('div').attr('class', 'moreInfoContainer');
        row.append('div').attr('class', 'dose-label right')
            .text(`${this.myResources.dateTime}:`);
        row.append('div').attr('class', 'text')
            .text((d: IvPrepModels.Dose) => {
                const adminDateTime = this.timeTransformService.toLocalTime(d.AdminDateTime, ivPrepConfig.TimeZoneOffset);
                return `${adminDateTime.format(dateTimeFormat)}`;
            });
    }

    private drawIvPrepState(container: any, ivPrepStateMapping$: Observable<IvPrepModels.StateMapping[]>) {
        ivPrepStateMapping$.pipe(first()).subscribe(stateMappings => {
            const subContainer = container.append('div').style('display', 'flex');

            // Radio button
            subContainer
                .append('div').attr('class', 'dose-radio-button')
                .append('input')
                .attr('type', 'radio')
                .attr('name', 'doseOption')
                .attr('value', (d: IvPrepModels.Dose, i: number) => {
                    const data = { doseId: d.DoseId, urgent: d.Urgent };
                    return JSON.stringify(data);
                })
                .on('click', (dose: IvPrepModels.Dose) => {
                    this.selectedIvPrepDose = dose;
                    this.setPriorityButtonText(dose);
                })
                .filter((d, i) => i === 0)
                .attr('checked', (dose: IvPrepModels.Dose) => {
                    this.selectedIvPrepDose = dose;
                    this.setPriorityButtonText(dose);
                    return 'checked';
                });

            // Priority - State
            const doseStateContainer = subContainer.append('div').attr('class', 'dose-state-container');
            doseStateContainer.append('div').attr('class', 'dose-state-label')
                .text((dose: IvPrepModels.Dose) => {
                    const priorityText = dose.Urgent ? this.myResources.stat : this.myResources.ivPrepNormal;
                    const stateLabel = this.getIvPrepStateLabel(dose, stateMappings);
                    return `${priorityText} - ${stateLabel}`;
                });

            // Image container
            const imgContainer = doseStateContainer.append('div').attr('class', 'dose-state-img-container');
            // State text
            imgContainer.append('div')
                .attr('class', (dose: IvPrepModels.Dose) => 'dose-state-img-priority' + (dose.Urgent ? ' stat' : ' normal'))
                .append('span')
                .text((dose: IvPrepModels.Dose) => dose.Urgent ? 'S' : 'N');
            // State image
            imgContainer.append('img')
                .attr('class', 'prep-state-img')
                .attr('src', (dose: IvPrepModels.Dose) => this.mapIvPrepImg(dose, stateMappings));
        }
        );
    }

    private getIvPrepStateLabel(dose: IvPrepModels.Dose, stateMappings: IvPrepModels.StateMapping[]): string {
        const hsvStatus = this.ivPrepTransformationService.resolveStatus(dose, stateMappings);
        switch (hsvStatus) {
            case 'DELIVERY':
                return this.myResources.ivPrepCompleted;
            default:
                return this.ivPrepTransformationService.mapStatusDisplayName(hsvStatus);
        }
    }

    private onChangePriorityClick(infusionContainerKey: string, dose: IvPrepModels.Dose) {
        console.log(`Change priority for ContainerKey='${infusionContainerKey}', DoseId='${dose.DoseId}'`);
        this.notify.next({
            event: 'ChangePriorityClick',
            infusionContainerKey: infusionContainerKey,
            ivPrepDose: dose
        });
    }

    private setPriorityButtonText(dose: IvPrepModels.Dose) {
        if (!dose) {
            return;
        }

        const button = D3.select('#modal-buttons-placeholder.buttonContainer button[name="priorityButton"]');
        if (!button) {
            console.error('Unable to find Priority change button text');
            return;
        }

        button.html('');
        const buttonContent = button.append('div').style('display', 'flex');
        buttonContent.append('div')
            .attr('class', 'dose-state-img-priority' + (dose.Urgent ? ' normal' : ' stat'))
            .style('height', '15px').style('width', '30px').style('margin-top', '3px')
            .append('span')
            .style('position', 'relative').style('top', '7px')
            .text(dose.Urgent ? 'N' : 'S');

        buttonContent.append('div').style('text-align', 'left').style('margin-left', '7px')
            .append('span')
            .attr('class', 'change-priority-button-text')
            .text(dose.Urgent ? this.myResources.changePriorityToNormalAcknowledge : this.myResources.changePriorityToStatAcknowledge);

    }

    drawAcknowledgeButton(buttonContainer: any, infusionData: any, buttonHeight: string, buttonWidth: string) {
        buttonContainer.append('button')
            .attr('class', 'btngraph btnsave acknowledge-button')
            .attr('name', 'acknowledgeButton')
            .style('height', buttonHeight)
            .style('width', buttonWidth)
            .text(`${this.myResources.acknowledge}`)
            .on('click', () => {
                this.onAcknowledgeClick(infusionData.infusionContainerKey);
            });
    }

    private drawChangePriorityButton(buttonContainer: any, infusionData: any, buttonHeight: string) {
        buttonContainer.append('button')
            .attr('name', 'priorityButton')
            .attr('class', 'btngraph btnsave change-priority-button')
            .style('height', buttonHeight)
            .style('padding-left', '12px').style('padding-right', '12px')
            .on('click', () => {
                this.onChangePriorityClick(infusionData.infusionContainerKey, this.selectedIvPrepDose);
            });
    }

    private drawPopupActionButtons(infusionData: any, orders: any[], ivPrepDoses: IvPrepModels.Dose[], hasCatoFacilities: boolean): void {
        const buttonPlaceholder = D3.select('#modal-buttons-placeholder.buttonContainer');
        buttonPlaceholder.style('display', 'none');
        buttonPlaceholder.html('');

        if (infusionData.isAcknowledged) {
            // Already acknowledged -> No buttons
            return;
        }

        buttonPlaceholder.style('display', 'block');
        const buttonContainer = buttonPlaceholder.append('div').style('display', 'flex').style('margin-top', '16px');

        let buttonHeight = '30px';
        let acknowledgeButtonWidth = '100%';

        // If order service is not enabled, or no orders found -> Only show Acknowledge button
        if (!this.orderServiceEnabled || orders.length <= 0 || !hasCatoFacilities) {
            this.drawAcknowledgeButton(buttonContainer, infusionData, buttonHeight, acknowledgeButtonWidth);
            return;
        }

        // If multiple orders -> Enter multiple orders workflow: Show only OK button
        if (orders.length > 1) {
            buttonContainer.append('button')
                .attr('class', 'btngraph btnsave')
                .attr('name', 'okButton')
                .style('height', '30px').style('width', '100%')
                .text(`${this.myResources.ok}`)
                .on('click', () => {
                    if (this.selectedOrder) {
                        this.onOrderSelected(infusionData, this.selectedOrder, true);
                    }
                });
            return;
        }

        // Single order workflow, or Order already selected
        if (orders.length === 1 && this.selectedIvPrepDose && ivPrepDoses.length > 0) {
            acknowledgeButtonWidth = '185px';
            buttonHeight = '32px';
            this.drawChangePriorityButton(buttonContainer, infusionData, buttonHeight);
            if (this.selectedIvPrepDose) {
                this.setPriorityButtonText(this.selectedIvPrepDose);
            }
        }

        // Acknowledge button
        this.drawAcknowledgeButton(buttonContainer, infusionData, buttonHeight, acknowledgeButtonWidth);
    }

    private hasRole(roleName: string, nativeFacility: string, authorizationConfig: any): boolean {
        if (!roleName || !authorizationConfig || !authorizationConfig.length) {
            return false;
        }
        let facilities = authorizationConfig.filter((item) => item.name !== MvdConstants.AUTHORIZATION_ROOT_ID);
        if (nativeFacility) {
            const masterFacility = this.facilityLookUpService.masterFacilityNameLookUp(nativeFacility,
                authorizationConfig, MvdConstants.INFUSION_PROVIDER_NAME);
            facilities = facilities.filter(f => f.name === masterFacility);
        }
        const permissions = _.flatMap(facilities, 'permissions');
        if (permissions.length) {
            const result = permissions.some((permission) => permission.resource === roleName);
            return result;
        }
        return false;
    }

    private hasCatoFacilities(authorizationConfig: any): boolean {
        if (!authorizationConfig || !authorizationConfig.length) {
            return false;
        }

        return authorizationConfig.some((item) =>
            item.name !== MvdConstants.AUTHORIZATION_ROOT_ID &&
            item.permissions.some(p => p.resource === MvdConstants.IVPREP_WIDGET_KEY) &&
            item.synonyms.some(s => (s.source || '').toUpperCase() === MvdConstants.CATO_PROVIDER_NAME.toUpperCase())
        );
    }

    private offsetDataDisplay(value: any, scale: any) {
        return this.nameZoneWidth + scale(value);
    }

    private paintThresholds(parent: any, inputData: any, dataBoxes: any, scale: any, header: boolean) {
        const thresholdContainer = parent.append('g').attr('class', 'thresholdContainer');
        thresholdContainer.selectAll('line')
            .data(dataBoxes)
            .enter()
            .append('line')
            .attr('class', function (d: any) {
                return d < this.thresholds.Normal ? 'border-dotted' : 'border-solid';
            }.bind(this))
            .attr('x1', function (d: any) {
                return scale(d) + this.nameZoneWidth;
            }.bind(this))
            .attr('y1', function (d: any) {
                if (header) {
                    return d > 0 && d < this.thresholds.Normal ?
                        this.barInfusionIcon + this.marginThresholdsTags + this.thresholdsTagsHeight :
                        this.headerHeight;
                } else {
                    return 0;
                }
            }.bind(this))
            .attr('x2', function (d: any) {
                return scale(d) + this.nameZoneWidth;
            }.bind(this))
            .attr('y2', function () {
                if (header) {
                    return this.headerHeight;
                } else {
                    return this.barHeight * inputData.data.length;
                }
            }.bind(this));

        if (header) {
            // paint thresholds labels
            thresholdContainer.selectAll('text')
                .data(dataBoxes)
                .enter()
                .append('text')
                .attr('class', (d: any) => {
                    return 'thresholdLabel' + (d <= this.thresholds.Escalate ? ' red' : '');
                })
                .attr('x', function (d: any) {
                    return this.offsetDataDisplay(d, scale) + (d > 0 ? 10 : 0);
                }.bind(this))
                .attr('y', this.headerHeight - 10)
                .text((d: any) => {
                    return d === 0 ? '0' : d < this.thresholds.Normal ? `${d}${this.myResources.minAbbreviationGraph}` : '';
                });
        }
    }

    private paintHeaderIndicators(parent: any, canvasWidth: number) {
        const headerIndicator = parent.append('g')
            .attr('class', 'headerIndicatorsContainer')
            .attr('transform', `translate(${this.nameZoneWidth}, 0)`);
        headerIndicator.append('image')
            .attr('xlink:href', this.fullInfusionIcon)
            .attr('width', this.infusionIconWidth)
            .attr('height', this.infusionIconHeight);
        headerIndicator.append('image')
            .attr('xlink:href', this.emptyInfusionIcon)
            .attr('width', this.infusionIconWidth)
            .attr('height', this.infusionIconHeight)
            .attr('transform', `translate(${canvasWidth - this.nameZoneWidth - this.infusionIconWidth}, 0)`);
        const headerBar = headerIndicator.append('g')
            .attr('class', 'headerBar')
            .attr('transform', `translate(${this.infusionIconWidth + 5}, 0)`);
        headerBar.append('rect')
            .attr('class', 'headerBarRect')
            .attr('width', canvasWidth - this.nameZoneWidth - (this.infusionIconWidth * 2) - 10)
            .attr('height', this.barInfusionIcon);
        headerBar.append('image')
            .attr('xlink:href', this.arrowIcon)
            .attr('width', this.arrowIconWidth)
            .attr('height', this.arrowIconHeight)
            .attr('transform', `translate(${5}, ${(this.barInfusionIcon - this.arrowIconHeight) / 2})`);
        headerIndicator.append('image')
            .attr('xlink:href', this.arrowIcon)
            .attr('width', this.arrowIconWidth)
            .attr('height', this.arrowIconHeight)
            .attr('transform', `translate(${canvasWidth - this.nameZoneWidth - this.infusionIconWidth - this.arrowIconWidth - 10}, 4)`);
    }

    private paintSummary(parent: any, data: any) {
        const resumeContainer = parent.append('g')
            .attr('class', 'resumeContainer')
            .attr('transform', 'translate(0, 0)');

        resumeContainer.append('rect')
            .attr('width', this.nameZoneWidth - 4)
            .attr('height', this.headerHeight - 4);

        const textResumeContainer = resumeContainer.selectAll('g.resumeTextContainer')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'resumeTextContainer')
            .attr('transform', function (d: any, i: number) {
                return 'translate(20, ' + (5 + 20 * i + 3) + ')';
            });

        textResumeContainer.append('text')
            .attr('x', 10)
            .attr('y', this.barHeight / 2)
            .attr('dy', '.35em')
            .append('tspan')
            .attr('class', 'resumeCounter')
            .text(function (d: any) {
                return d.value + '   ';
            })
            .append('tspan')
            .attr('class', function (d: any) {
                return 'labelCounter ' + (d.name === this.myResources.Priority ?
                    'red' : d.name === this.myResources.Warning ?
                        'orange' : 'green');
            }.bind(this))
            .text(function (d: any) {
                return d.name;
            });

        textResumeContainer.append('path')
            .attr('class', function (d: any) {
                return (d.name === this.myResources.Priority ? 'red' : d.name === this.myResources.Warning ? 'orange' : 'green');
            }.bind(this))
            .attr('d', function (d: any) {
                const iconTypes = this.declareIcons();
                return (d.name === this.myResources.Priority ?
                    iconTypes.smalldiamond() :
                    d.name === this.myResources.Warning ?
                        iconTypes.smalltriangle() :
                        iconTypes.smallcircle());
            }.bind(this))
            .attr('transform', function (d: any) {
                if (d.name !== this.myResources.Priority) {
                    return 'translate(0,' + this.barHeight / 2 + ')';
                } else {
                    return 'translate(0,' + this.barHeight / 2 + ') rotate(-45)';
                }
            }.bind(this));
    }

    private paintThresholdsHeader(parent: any, thresholdsTags: any, scale: any) {

        const warningZoneWidth = scale(this.thresholds.Normal - this.thresholds.Escalate) - scale(this.thresholds.Normal);
        // paint thresholds tags container
        const thresholdTagContainer = parent.selectAll('g.thresholdTagsContainer')
            .data(thresholdsTags)
            .enter()
            .append('g')
            .attr('class', 'thresholdTagsContainer')
            .attr('transform', function (d: any, i: number) {
                return 'translate(' + this.offsetDataDisplay(d.value, scale)
                    + ',' + (this.barInfusionIcon + this.marginThresholdsTags) + ')';
            }.bind(this));


        // paint thresholds tags areas
        thresholdTagContainer.append('rect')
            .attr('class', (d: any) => {
                return 'thresholdTag stroke' + this.defineColor(d.value);
            })
            .attr('height', this.thresholdsTagsHeight)
            .attr('width', function (d: any, i: number) {
                return (i < thresholdsTags.length - 1 ? scale(thresholdsTags[i + 1].value) : scale(0))
                    - scale(d.value) - (i === thresholdsTags.length - 1 ? 0 : 3);
            });

        // paint thresholds tags text
        thresholdTagContainer.append('text')
            .attr('class',
                (d: any) => {
                    return 'thresholdTagText ' + this.defineColor(d.value);
                })
            .attr('x',
                (d: any, i: number) => {
                    let areaWidth = (i < thresholdsTags.length - 1 ? scale(thresholdsTags[i + 1].value) : scale(0)) -
                        scale(d.value) -
                        3;
                    if (d.value <= this.thresholds.Priority) {
                        areaWidth = areaWidth - warningZoneWidth;
                    }
                    return areaWidth / 2;
                })
            .attr('y', this.thresholdsTagsHeight / 2)
            .attr('dy', '.35em')
            .text(function (d: any) {
                return d.name;
            });

        // paint thresholds icons

        thresholdTagContainer.append('path')
            .attr('class', (d: any) => {
                return 'nostroke ' + this.defineColor(d.value);
            })
            .attr('d', function (d: any) {
                return this.returnIconType(d, true, 'value');
            }.bind(this))
            .attr('transform', function (d: any, i: number) {
                let offsetIcons = 40;
                let areaWidth = (i < thresholdsTags.length - 1 ? scale(thresholdsTags[i + 1].value) : scale(0)) - scale(d.value) - 3;
                if (d.value <= this.thresholds.Priority) {
                    areaWidth = areaWidth - warningZoneWidth;
                }
                if (d.value > this.thresholds.Priority) {
                    if (d.value >= this.thresholds.Normal) {
                        offsetIcons = 35;
                    }
                    return 'translate(' + (areaWidth / 2 + offsetIcons) + ',' + this.thresholdsTagsHeight / 2 + ')';
                } else {
                    return 'translate(' + (areaWidth / 2 + offsetIcons) + ',' + this.thresholdsTagsHeight / 2 + ') rotate(-45)';
                }
            }.bind(this));

        thresholdTagContainer.selectAll('text.green')
            .call(this.positionThresholdText, scale, thresholdsTags, this.thresholdsTagsHeight);

        // paint escalate area
        const escalateArea = parent.append('g')
            .attr('class', 'escalateAreaContainer')
            .attr('transform', 'translate(' + this.offsetDataDisplay(this.thresholds.Escalate, scale)
                + ', ' + ((this.barInfusionIcon + this.marginThresholdsTags) + 3) + ')');
        escalateArea.append('rect')
            .attr('class', 'escalateRect red')
            .attr('width', warningZoneWidth - 3)
            .attr('height', this.thresholdsTagsHeight - 6);
        escalateArea.append('text')
            .attr('class', 'escalateText')
            .attr('x', warningZoneWidth / 2)
            .attr('y', ((this.thresholdsTagsHeight - 6) / 2))
            .attr('dy', '.35em')
            .text(this.myResources.Escalate.split('').join(' '));
    }

    private defineColor(d: number) {
        return d > this.thresholds.Warning ? 'green' : d > this.thresholds.Priority ? 'orange' : 'red';
    }

    private defineHorizontalLineColor(data: any) {
        if (data.isAcknowledged) {
            return ' gray';
        }

        const d: number = data.estimatedTimeTillEmpty;
        return d > this.thresholds.Warning ? '' : d > this.thresholds.Priority ? ' orange' : ' red';
    }

    private definePriorityImgClass(data: any) {
        const d: number = data.estimatedTimeTillEmpty;
        return d > this.thresholds.Warning
            ? ''
            : d > this.thresholds.Priority
                ? (data.isAcknowledged ? ' gray-triangle' : ' orange-triangle')
                : (data.isAcknowledged ? ' gray-diamond' : ' red-diamond');
    }

    private returnIconType(d: any, small: boolean, field: any) {
        const symbolTypes = this.declareIcons();
        if (small) {
            return d[field] > this.thresholds.Warning ?
                symbolTypes.smallcircle() :
                d[field] > this.thresholds.Priority ?
                    symbolTypes.smalltriangle() : symbolTypes.smalldiamond();
        } else {
            return d[field] > this.thresholds.Warning ?
                symbolTypes.circle() : d[field] >
                    this.thresholds.Priority ?
                    symbolTypes.triangle() : symbolTypes.diamond();
        }
    }

    private defineScale(dataBoxes: Array<any>, canvasWidth: number, nameZoneWidth: number) {
        return D3.scaleLinear()
            .domain([D3.max(dataBoxes), 0])
            .range([0, canvasWidth - nameZoneWidth]);
    }

    private declareIcons() {
        const symbolTypes = {
            'triangle': D3.symbol()
                .type(D3.symbolTriangle)
                .size(function () {
                    return 200;
                }),
            // .size(function(){ return x(80); }),
            'diamond': D3.symbol()
                .type(D3.symbolSquare)
                .size(function () {
                    return 200;
                }),
            // .size(function(){ return x(50); })
            'smalltriangle': D3.symbol()
                .type(D3.symbolTriangle)
                .size(function () {
                    return 80;
                }),
            // .size(function(){ return x(80); }),
            'smalldiamond': D3.symbol()
                .type(D3.symbolSquare)
                .size(function () {
                    return 80;
                }),
            // .size(function(){ return x(50); }),
            'circle': D3.symbol()
                .type(D3.symbolCircle)
                .size(function () {
                    return 200;
                }),
            'smallcircle': D3.symbol()
                .type(D3.symbolCircle)
                .size(function () {
                    return 80;
                })
        };
        return symbolTypes;
    }

    private wrap(text: any, width: any) {
        text.each(function () {
            const label: any = D3.select(this);
            const words: string[] = label.text().split(/\s+/).reverse();
            let word: string;
            let line: any = [];
            let lineNumber = 0;
            const lineHeight = 1.1; // ems
            const y: any = label.attr('y');
            const dy: number = parseFloat(label.attr('dy'));
            let tspan: any = label.text(null).append('tspan').attr('x', 30).attr('y', y).attr('dy', dy + 'em');
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    const dytspan: any = parseFloat(tspan.attr('dy'));
                    tspan.attr('dy', dytspan - .55 + 'em');
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = label
                        .append('tspan')
                        .attr('x', 30)
                        .attr('y', y)
                        .attr('dy', ++lineNumber * lineHeight + dy - 0.55 + 'em')
                        .text(word);
                }
            }
        });
    }

    getRowHeight(): number {
        return this.barHeight;
    }

    getMarginBottom(): number {
        return this.marginBottom;
    }

    getHeaderHeight(): number {
        return this.headerHeight;
    }

    private onOrderSelected(infusionData: any, order: any, isMultipleOrdersWorkflow: boolean) {
        this.notify.next({
            event: 'OrderSelected',
            infusionData: infusionData,
            order: order,
            isMultipleOrdersWorkflow: isMultipleOrdersWorkflow
        });
    }

    private onAcknowledgeClick(infusionContainerKey: any) {
        this.notify.next({ event: 'AcknowledgementClick', infusionContainerKey: infusionContainerKey });
    }

    private onRequestOrderServices(infusionData: any) {
        this.notify.next({ event: 'RequestOrderServiceClick', infusionContainer: infusionData });
    }

    private refreshData() {
        this.notify.next({ event: 'RefreshData' });
    }

    private positionThresholdText(text: any, scale: any, thresholdsTags: any, height: any) {
        text.each(function () {
            const element = D3.select(this);
            const path = D3.select(this.nextElementSibling);
            const datum: any = element.data()[0];
            let index = 0;
            for (let i = 0; i < thresholdsTags.lenght; i++) {
                if (thresholdsTags[i].value === datum.value) {
                    break;
                }
                index++;
            }
            const areaWidth = scale(thresholdsTags[index + 1].value) - scale(datum.value) - 3;
            const drawArea = areaWidth - element.node().getComputedTextLength();
            let position = 0;
            if (drawArea > 0) {
                position = 22;
                position += drawArea / 2;
            } else {
                position = 27;
            }
            if (position + 35 > areaWidth) {
                path.style('display', 'none');
            }
            element.attr('x', position);

            path.attr('transform', 'translate(' + (position + element.node().getComputedTextLength() - 15) + ',' + height / 2 + ')');

        });
    }

    private mapIvPrepImg(dose: IvPrepModels.Dose, stateMappings: IvPrepModels.StateMapping[]): string {
        if (!dose) {
            return '';
        }

        const hsvState = this.ivPrepTransformationService.resolveStatus(dose, stateMappings);
        switch (hsvState) {
            case 'QUEUEDPREP':
                return './dist/assets/images/queued_for_prep-n.png';
            case 'READYPREP':
                return './dist/assets/images/ready_for_prep-n.png';
            case 'INPREP':
                return './dist/assets/images/in_prep-n.png';
            case 'READYCHECK':
                return './dist/assets/images/ready_for_check-n.png';
            case 'READYDELIVERY':
                return './dist/assets/images/ready_for_delivery-n.png';
            case 'DELIVERY':
                return './dist/assets/images/delivery-n.png';

            default:
                return '';
        }
    }
}
