export interface NoticesSendaryDataResponse {
    body: AttentionNoticeModel[];
}
export interface ESModelNotice {
    [prop: string]: any;
}
export interface AttentionNoticeModel extends ESModelNotice {
    key: string;
    status: string;
    id: number;
    updatedBy: string;
    updatedDateTime: Date;
    isCollapsed: boolean;
    isAcknowledge: boolean;
    rowIndex: number;
    hasWriteAccess: boolean;
    facilityKey: string;
}

export enum EnumAttentionNoticeStatus {
    New = 'New',
    Acknowledged = 'Acknowledged'
}

export enum SortDirection { Unset, Ascending, Descending }

export interface SortItemClickEvent {
    id: string;
    sortDirection: SortDirection;
}

export interface AttentionNoticesConfiguration {
    version: string;
    sortConfig: { [key: string]: AttentionNoticeSortConfiguration; };
}

export interface AttentionNoticeSortConfiguration {
    id: string;
    sortDirection: SortDirection;
}
