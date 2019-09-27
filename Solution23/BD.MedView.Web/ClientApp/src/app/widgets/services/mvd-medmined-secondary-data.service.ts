import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GatewayService, ApiCall } from 'container-framework';
import * as _ from 'lodash';
import { MedMinedModels as mmModel } from '../shared/medmined-models';
import { UUID } from 'angular2-uuid';
import { map, flatMap, tap } from 'rxjs/operators';
import { FacilityPatientIdMappingService, FacilityPatientIdMapping } from '../../services/facility-patient-id-mapping.service';
import { AuthorizationService } from '../../services/authorization.service';
import { MvdConstants } from '../shared/mvd-constants';

@Injectable()
export class MvdMedMinedSecondaryDataService {
    private alertCache: AlertHeaderItem[] = [];

    constructor(private dataService: GatewayService, private facilityPatientIdMappingService: FacilityPatientIdMappingService, private authorizationService: AuthorizationService) {}

    /**
     * Adds a new UUID field to each of the objects in the array. If the object already has a UUID field this method skips that record
     * @param dataset Dataset to add the UUID field
     */
    addUuid<T extends mmModel.MedMinedSecondaryDataItem>(dataset: T[]): void {
        if (dataset && dataset.length > 0) {
            dataset.forEach(data => {
                if (!data.uuid) {
                    data.uuid = UUID.UUID();
                }
            });
        }
    }

    /**
     * Gets the MedMined secondary data alerts
     * @param requestData Object containing the information to create the MedMined secondary data request.
     * Note: startPage and endPage are zero-based index
     * @param mappingFunction Function that maps information from source record to @see PageInfoList object
     */
    getAlerts<T extends mmModel.MedMinedSecondaryDataItem>(requestData: mmModel.MedMinedAlertsRequestData<T>,
        mappingFunction: (data: T, options: FacilityPatientIdMapping[]) => mmModel.PatientInfo ): Observable<AlertHeaderItem[]> {

        if (!this.isValidPageRange(requestData)) {
            console.error('Invalid page range for MedMined Secondary Data');
            return of([]);
        }

        const records = this.getRecordsInPageRange(requestData);
        if (records.length <= 0) {
            console.log('No records in the page range');
            return of([]);
        }

        let ret = this.authorizationService.isAuthorized2(MvdConstants.CLINICALOVERVIEW_WIDGET_KEY).pipe(
            flatMap(authorized => {
                if (!authorized) {
                    console.log('Request is not authorized');
                    return of(<AlertHeaderItem[]>[]);
                }
                let startTime = new Date().getTime();
                return this.processRecords(requestData.widgetKey, records, mappingFunction).pipe(
                    tap(() => {
                        let endTime = new Date().getTime();
                        let diff = endTime - startTime;
                        console.log(`****** Secondary data loaded in ${diff / 1000}s`);
                    })
                );
            })
        );
        return ret;
    }

    /**
     * Gets an array of @see AlertHeaderItem with @see AlertHeaderItem.medMinedAlert array filtered by state
     * @param alerts Alert items included in the result
     * @param alertState Alert state to include in the results
     */
    filterAlerts(alerts: AlertHeaderItem[], alertState: string): AlertHeaderItem[] {
        return alerts.map(alert => ({
            uuid: alert.uuid,
            widgetKey: alert.widgetKey,
            medMinedAlert: alert.medMinedAlert.filter(mmAlert => (mmAlert.status || '').toLowerCase() === (alertState || '').toLowerCase())
        } as AlertHeaderItem));
    }

    /**
     * Adds a mmAlerts field to each record in the dataset, matching by its UUID
     * @param dataset Dataset to fill with the secondary data information
     * @param alerts PageInformation with
     */
    addSecondaryData<T extends mmModel.MedMinedSecondaryDataItem>(dataset: T[], alerts: AlertHeaderItem[]) {
        alerts.filter(alert => alert.uuid && alert.medMinedAlert && alert.medMinedAlert.length > 0)
            .forEach(alert => {
                const record = _.find(dataset, d => _.isEqual(d.uuid, alert.uuid));
                if (record) { record.medMinedAlerts = alert.medMinedAlert; }
            });
    }

    /**
     * Clears the previously returned alerts for the widget with the specified key
     * @param widgetKey Widget key
     */
    clearCache(widgetKey: string) {
        this.alertCache = this.alertCache.filter(x => x.widgetKey !== widgetKey);
    }

    /**
     * Calulates the max page index (zero-based) for the dataset
     * @param dataset Dataset used to calculate max page
     * @param recordsPerPage Number of records per page
     */
    getMaxPageIndex<T extends mmModel.MedMinedSecondaryDataItem>(dataset: T[], recordsPerPage: number): number {
        if (dataset.length === 0) { return 0; }

        let maxPage = Math.floor(dataset.length / recordsPerPage) - 1;
        if (dataset.length % recordsPerPage > 0) {
            maxPage += 1;
        }
        return maxPage;
    }

    private getAlertsRequest(pageInfoList: mmModel.PageInfoList): ApiCall {
        return {
            api: 'medminedSecondaryData',
            appCode: '',
            pathParams: [],
            queryParams: [],
            rawData: { pageInfoList: pageInfoList } ,
            widgetId: ''
        } as ApiCall;
    }

    private getPageInfoList<T extends mmModel.MedMinedSecondaryDataItem>(widgetKey: string, dataset: T[],
        mappingFunction: (data: T, options: FacilityPatientIdMapping[]) => mmModel.PatientInfo, options: FacilityPatientIdMapping[]): mmModel.PageInfoList {
        const pageInfoArray = dataset.map(data => mappingFunction(data, options));
        return { pageSource: widgetKey, pageInfo: pageInfoArray };
    }

    private getRecordsInPageRange<T extends mmModel.MedMinedSecondaryDataItem>(requestData: mmModel.MedMinedAlertsRequestData<T>): T[] {
        if (requestData.dataset.length === 0 ) { return []; }

        const startIndex = requestData.startPage * requestData.recordsPerPage;
        if (startIndex >= requestData.dataset.length) {
            console.error('Error in page information request. Start Index is greater than dataset length');
            return [];
        }

        const endPage = this.getEndPage(requestData.dataset, requestData.startPage, requestData.recordsPerPage);
        let endIndex = endPage * requestData.recordsPerPage + requestData.recordsPerPage;
        if (endIndex >= requestData.dataset.length) {
            endIndex = requestData.dataset.length - 1;
        }

        const result = _.slice(requestData.dataset, startIndex, endIndex + 1);
        return result;
    }

    private isValidPageRange<T extends mmModel.MedMinedSecondaryDataItem>(
        requestData: mmModel.MedMinedAlertsRequestData<T>
    ): boolean {
        const maxPage = this.getMaxPageIndex(
            requestData.dataset,
            requestData.recordsPerPage
        );
        if (requestData.startPage > maxPage) {
            return false;
        }

        return true;
    }

    private processRecords<T extends mmModel.MedMinedSecondaryDataItem>(widgetKey: string, records: T[],
        mappingFunction: (data: T, options: FacilityPatientIdMapping[]) => mmModel.PatientInfo): Observable<AlertHeaderItem[]> {
        const uncachedRecords: T[] = [];
        const result: AlertHeaderItem[] = [];

        // Remove items that don't have a Medmined Facility Id
        records = records.filter(r => r.medMinedFacilityId);

        if (records.length <= 0) {
            console.log('MM Secondary data: No records found containing MedMined provider');
            return of([]);
        }

        // Search if record is already cached
        records.forEach(record => {
            const uuid = record.uuid;
            const cachedAlerts = this.getCachedAlerts(widgetKey, uuid);
            if (cachedAlerts !== undefined) {
                result.push({ widgetKey: widgetKey, uuid: uuid, medMinedAlert: cachedAlerts });
            } else {
                // not in cache -> need to retrieve from server
                uncachedRecords.push(record);
            }
        });

        if (result && result.length > 0) {
            console.log(`MM Secondary data: returning data from cache for ${result.length} records`, result);
        }

        // If all records are already in cache, no need to go to server
        if (uncachedRecords.length === 0) {
            console.log('MM Secondary data: All secondary data is already cached. Returning from local cache');
            return of(result);
        }

        // Retrieve alerts for uncached records
        let ret = this.facilityPatientIdMappingService.toObservable().pipe(flatMap(options => {
            const requestedPageInfoList = this.getPageInfoList(widgetKey, uncachedRecords, mappingFunction, options);
            const request = this.getAlertsRequest(requestedPageInfoList);
            console.log(`MM Secondary data: Requesting secondary data for ${uncachedRecords.length} records`, requestedPageInfoList);
            return this.dataService.loadData([request]).pipe(
                map(resultArray => {
                    const responsePageInfoList = resultArray[0].pageInfoList as mmModel.PageInfoList;

                    console.log('MM Secondary data: Response received', responsePageInfoList);

                    this.updateAlertCache(widgetKey, requestedPageInfoList, responsePageInfoList);

                    const alertsResponse = responsePageInfoList.pageInfo
                        .map(patientInfo => ({ uuid: patientInfo.id, medMinedAlert: patientInfo.medMinedAlert || [] } as AlertHeaderItem));
                    result.push(...alertsResponse);
                    return result;
                })
            );
        }));
        return ret;
    }

    private getCachedAlerts(widgetKey: string, uuid: string ): mmModel.MedMinedAlertHeader[] {
        const cacheItem = this.alertCache.find(x => x.widgetKey === widgetKey && x.uuid === uuid);
        if (cacheItem) {
            return cacheItem.medMinedAlert || [];
        }
    }

    private updateAlertCache(widgetKey: string, requested: mmModel.PageInfoList, results: mmModel.PageInfoList) {
        // Add results to cache
        const resultsCacheItems = results.pageInfo
            .map(patientInfo => ({
                widgetKey: widgetKey,
                uuid: patientInfo.id,
                medMinedAlert: patientInfo.medMinedAlert || []
            } as AlertHeaderItem));
        this.alertCache.push(...resultsCacheItems);

        // Add to cache the requested elements that didn't have alerts. Set their alerts to an empty array
        const notInResultsCacheItems = requested.pageInfo
            .filter(requestedPatientInfo => !this.pageInfoListContainsUuid(results, requestedPatientInfo.id))
            .map(patientInfo => ({ widgetKey: widgetKey, uuid: patientInfo.id, medMinedAlert: [] } as AlertHeaderItem) );
        this.alertCache.push(...notInResultsCacheItems);
    }

    private pageInfoListContainsUuid(pageInfoList: mmModel.PageInfoList, uuid: string) {
        return pageInfoList.pageInfo.some(patientInfo => patientInfo.id === uuid);
    }

    private getmedminedSecondaryDataPageCount(): number {
        let medminedSecondaryDataPageCount = Number(window['medminedSecondaryDataPageCount'] || '1');
        if (medminedSecondaryDataPageCount < 1) {
            console.log('Incorrect value for medminedSecondaryDataPageCount. Reseting to 1', medminedSecondaryDataPageCount);
            medminedSecondaryDataPageCount = 1;
         }

         return medminedSecondaryDataPageCount;
    }


    private getEndPage<T extends mmModel.MedMinedSecondaryDataItem>(data: T[], startPage: number, recordsPerPage: number): number {
        const medminedSecondaryDataPageCount = this.getmedminedSecondaryDataPageCount();
        const maxPage = this.getMaxPageIndex(data, recordsPerPage);

        let endPage = startPage + medminedSecondaryDataPageCount - 1;
        if ( endPage > maxPage) { endPage = maxPage; }

        return endPage;
    }
}

export interface AlertHeaderItem {
    widgetKey: string;
    uuid: string;
    medMinedAlert: mmModel.MedMinedAlertHeader[];
}
