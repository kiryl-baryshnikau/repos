import { Injectable } from "@angular/core";
import { Observable, of, EMPTY } from "rxjs";

export interface AttentionNoticeStatus {
    id: number;
    key: string;
    facilityId: number;
    status: string;
    updatedBy?: string;
    updatedDateTime?: Date;
}

import { BdMedViewServicesClient } from './../../services/bd-medview-services-client';
@Injectable()
export class AttentionNoticeStatusesService {

    private collectionName: string = 'AttentionNoticeStatuses';

    constructor(private client: BdMedViewServicesClient) {
    }

    select(expand: string[] | null, filter: string[] | null): Observable<AttentionNoticeStatus[]> {

        let expandPattern = (expand && expand.length > 0) ? expand.join(',') : null;
        let filterPattern = (filter && filter.length > 0) ? filter.join(',') : null;

        let params: any = {};

        if (expandPattern && expandPattern.length > 0) {
            params.expand = expandPattern;
        }
        if (filterPattern && filterPattern.length > 0) {
            params.filter = filterPattern;
        }

        const subscription = this.client
            .staticMethodCall<AttentionNoticeStatus[]>(this.collectionName, 'List', params);

        return subscription;
    }

    create(value: AttentionNoticeStatus): Observable<AttentionNoticeStatus> {
        const subscription = this.client
            .create<AttentionNoticeStatus>(this.collectionName, value);

        return subscription;
    }

    read(id: number | string): Observable<AttentionNoticeStatus> {
        const subscription = this.client
            .read<AttentionNoticeStatus>(this.collectionName, id);

        return subscription;
    }

    update(id: number | string, value: AttentionNoticeStatus): Observable<any> {
        const subscription = this.client
            .update(this.collectionName, id, value);

        return subscription;
    }

    delete(id: number | string): Observable<any> {
        const subscription = this.client
            .delete(this.collectionName, id);

        return subscription;
    }
}
