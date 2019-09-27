import { Component, OnInit, OnDestroy } from '@angular/core';
import { AttentionNoticesDataService } from './attention-notices-data.service';
import { MvdListData, MvdListElement } from '../../widgets';
import { Observable, Subject, of, Subscription } from 'rxjs';
import { ResourceService } from 'container-framework';
import { catchError, tap} from 'rxjs/operators';
import { AutoRefreshService } from '../shared/auto-refresh.service';
import { DateFormatPipe } from '../shared/date-format.pipe';

@Component({
    selector: 'mvd-attention-notices-mobile',
    templateUrl: './attention-notices-mobile.component.html',
    styleUrls: ['./attention-notices-mobile.component.scss']
})
export class AttentionNoticesMobileComponent implements OnInit, OnDestroy {

    detailViewCollapsed = true;
    resources: any;
    attentionNotices$: Observable<{ critical: MvdListData, nonCritical: MvdListData }>;
    noticeDetail$: Observable<any[]>;
    loadingError$ = new Subject<boolean>();
    isError = false;
    selectedNotice: MvdListElement;
    lastUpdatedDate = '';
    lastUpdatedTime =  '';

    private backButtonSubscription: Subscription;

    constructor(private dataService: AttentionNoticesDataService,
        private resourcesService: ResourceService,
        private autoRefreshService: AutoRefreshService,
        private dateTimePipe: DateFormatPipe) { }

    ngOnInit() {
        console.log('Attention notices Mobile initialized');

        this.resources = this.getResources();

        this.attentionNotices$ = this.autoRefreshService
            .setAutoRefreshFor$<{ critical: MvdListData, nonCritical: MvdListData }>(this.summaryData$());
    }

    private summaryData$() {
        return this.dataService.getSummaryData$().pipe(
            tap(() => {
                this.isError = false;
                console.log('getSummaryData$ fired');
                this.setLastUpdatedProps();
            }),
            catchError((e) => {
                console.log('Error on AttentionNoticesMobileComponent > getSummaryData$():', e);
                this.isError = true;
                this.loadingError$.next(true);
                return of(null);
            })
        );
    }

    private noticesDetails$(selectedKey) {
        return this.dataService.getDetailData$(selectedKey).pipe(
            tap((result) => {
                console.log('getDetailData$ fired', result);
                this.isError = false;
                this.setLastUpdatedProps();
            }),
            catchError((e) => {
                console.log('Error on AttentionNoticesMobileComponent > noticesDetails$():', e);
                this.loadingError$.next(true);
                this.isError = true;
                return of(null);
            })
        );
    }

    private setLastUpdatedProps() {
        const dateTime = new Date();
        this.lastUpdatedDate = this.dateTimePipe.transform(dateTime, 'date');
        this.lastUpdatedTime = this.dateTimePipe.transform(dateTime, 'time');
    }

    ngOnDestroy() {
        if (this.backButtonSubscription) { this.backButtonSubscription.unsubscribe(); }
    }

    onBackClick() {
        this.detailViewCollapsed = true;
    }

    noticeSelected(selected: MvdListElement) {
        this.detailViewCollapsed = false;
        this.selectedNotice = selected;
        this.refreshDetailData(selected);
    }

    refreshDetailData(selectedNotice: MvdListElement) {
        this.noticeDetail$ = this.autoRefreshService.setAutoRefreshFor$<any[]>(this.noticesDetails$(selectedNotice.key));
    }

    onDetailsStatusChanged(event: MvdListElement) {
        this.refreshDetailData(event);
    }

    onBackNavigation() {
        this.detailViewCollapsed = true;
    }

    private getResources(): any {
        return {
            critical: this.resourcesService.resource('critical'),
            nonCritical: this.resourcesService.resource('nonCritical'),
            emptyCriticalNoticesMessage: this.resourcesService.resource('emptyCriticalNoticesMessage'),
            emptyNonCriticalNoticesMessage: this.resourcesService.resource('emptyNonCriticalNoticesMessage'),
            unableToConnectTittle: this.resourcesService.resource('unableToConnect'),
            unableToConnectMessage: this.resourcesService.resource('unableToConnectMessage'),
            attentionNotices : this.resourcesService.resource('medViewAttentionNotices'),
            lastUpdatedOn : this.resourcesService.resource('lastUpdatedOn'),
            at : this.resourcesService.resource('atMobile')
        };
    }
}
