import { Component, Input, ViewEncapsulation, OnInit, Output, EventEmitter, OnDestroy, HostListener } from '@angular/core';
import { Subscription, ReplaySubject, Observable } from 'rxjs';
import { ResourceService } from 'container-framework';
import { InfusionsLineDrawChartService } from './mvd-infusions-line-chart.service';
import { ContinuousInfusionsTransformationService } from '../mvd-continuous-infusions-transformation.service';
import { FacilityLookUpService } from '../../../../services/facility-look-up.service';
import { IvPrepTransformationService } from '../../iv-prep/mvd-iv-prep-transformation.service';
import { IvPrepModels } from '../../../shared/mvd-models';
import { MvdTimeTransformService } from '../../../services/mvd-time-transform.service';
import { ContinuousInfusionsModels as ciModels } from '../mvd-continuous-infusions-types';

@Component({
    moduleId: module.id,
    selector: 'mvd-infusions-line-chart',
    templateUrl: './mvd-infusions-line-chart.component.html',
    styleUrls: ['./mvd-infusions-line-chart.style.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [InfusionsLineDrawChartService]
})
export class InfusionsLineChart implements OnInit, OnDestroy {// implements OnChanges {
    @Input() public canvasWidth: number;
    @Input() public canvasHeight: number;
    @Input() public orderServiceEnabled: boolean;
    @Input() authorizationConfig: any;

    @Output() onAcknowledgement = new EventEmitter();
    @Output() onRequestRefresh = new EventEmitter();
    @Output() onRequestOrderService = new EventEmitter();
    @Output() singleOrderReceived = new EventEmitter();
    @Output() orderSelected = new EventEmitter();
    @Output() changePriority = new EventEmitter();
    @Output() onDisplayAlertsDetails = new EventEmitter();

    customOverflow = 'hidden';
    customHeight: number;
    marginLeft = 0;

    displayRows: number;

    drawChartService: InfusionsLineDrawChartService;

    private subscription: Subscription;
    private popupClickCounter = 0;

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (this.drawChartService.expandedTooltip) {
            const modalContainers = document.getElementsByClassName('modal-container');
            if (modalContainers && modalContainers.length > 0) {
                if (!modalContainers[0].contains(event.target)) {
                    if (this.popupClickCounter > 0) {
                        this.closeModalWindow();
                    } else {
                        this.popupClickCounter++;
                    }
                }
            } else {
                this.popupClickCounter = 0;
            }
        } else {
            this.popupClickCounter = 0;
        }
    }


    constructor(private dataTransformer: ContinuousInfusionsTransformationService,
        ivPrepTransformationService: IvPrepTransformationService,
        timeTransformService: MvdTimeTransformService,
        facilityLookUpService: FacilityLookUpService,
        private resources: ResourceService
    ) {

        this.drawChartService = new InfusionsLineDrawChartService(this.resources, facilityLookUpService,
            ivPrepTransformationService, timeTransformService);
    }

    ngOnInit() {
        this.subscription = this.drawChartService.notifyObservable$.subscribe((value) => {
            if (value.event === 'AcknowledgementClick') {
                this.onAcknowledgement.emit({ infusionContainerKey: value.infusionContainerKey });
            } else if (value.event === 'RequestOrderServiceClick') {
                this.onRequestOrderService.emit({ infusionContainer: value.infusionContainer });
            } else if (value.event === 'OrderSelected') {
                this.orderSelected.emit({
                    infusionData: value.infusionData,
                    order: value.order, isMultipleOrdersWorkflow: value.isMultipleOrdersWorkflow
                });
            } else if (value.event === 'ChangePriorityClick') {
                this.changePriority.emit({
                    infusionContainerKey: value.infusionContainerKey,
                    ivPrepDose: value.ivPrepDose
                });
            } else if (value.event === 'DisplayMedminedAlert') {
                this.onDisplayAlertsDetails.emit(value.alerts);
            } else {
                this.onRequestRefresh.emit();
            }
        });
    }

    ngOnDestroy() {
        // Ensure to remove all modals remaining
        this.closeModalWindow();
        this.subscription.unsubscribe();
    }

    renderChart(inputData: any, newwidth: any, infusionConfiguration: any) {
        if (!inputData) {
            inputData = this.dataTransformer.transformContinuousInfusionsData([], false, infusionConfiguration);
        }
        const rowheight = this.drawChartService.getRowHeight();
        const headerHeight = this.drawChartService.getHeaderHeight();
        const nameZone = this.drawChartService.getNameZoneWidth();
        const minWidth = nameZone + 95;

        const marginBottom = this.drawChartService.getMarginBottom();
        this.displayRows = Math.floor((this.canvasHeight - headerHeight - marginBottom) / rowheight);

        if (inputData.data && inputData.data.length >= this.displayRows) {
            if (this.displayRows <= 0) {
                this.displayRows = 5;
            }
            this.customHeight = rowheight * this.displayRows;
            this.customOverflow = 'auto';
        } else {
            this.displayRows = inputData.data.length;
            this.customHeight = this.canvasHeight - headerHeight - marginBottom;
            this.customOverflow = 'hidden';
        }

        let graphWidth = newwidth || this.canvasWidth;
        graphWidth = graphWidth > minWidth ? graphWidth : minWidth;
        this.drawChartService.redrawChart(inputData,
            graphWidth,
            'chart',
            'headerchart',
            this.displayRows,
            infusionConfiguration,
            this.orderServiceEnabled,
            this.authorizationConfig);
    }

    closeModalWindow() {
        this.drawChartService.closeModalWindow();
        this.popupClickCounter = 0;
    }

    notifyResponseAcknowledged(data: any) {
        if (data.success) {
            this.closeModalWindow();
        } else {
            this.drawChartService.displayMessage(data.message);
        }
    }

    orderServicesResponse(data: ciModels.OrderServiceResponse, ivPrepStateMapping$: Observable<IvPrepModels.StateMapping[]>,
        authorizationConfig: any) {
        if (!data.error) {
            this.drawChartService.drawOrderServices(data, ivPrepStateMapping$, authorizationConfig);
        } else {
            this.drawChartService.drawOrdersErrorMessage(data);
        }
    }

    onOrderSelectedResponse(response: ciModels.OrderSelectedResponse, ivPrepStateMapping$: Observable<IvPrepModels.StateMapping[]>,
        authorizationConfig: any): void {
        this.drawChartService.doSelectedOrderWorkflow(response, ivPrepStateMapping$);
    }

    onOrderSelectedError(event: { infusionData: any, order: any, isMultipleOrdersWorkflow: boolean }): void {
        this.drawChartService.drawIvPrepErrorMessage(event);
    }

    onChangePriorityResponse(result: boolean) {
        this.closeModalWindow();
    }

    notifySecondaryDataLoaded() {
        //this.drawChartService.secondaryDataLoaded();
    }
}
