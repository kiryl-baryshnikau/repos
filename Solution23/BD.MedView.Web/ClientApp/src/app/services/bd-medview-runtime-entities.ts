export interface AttentionNoticeStatus {
    id: number;
    key: string;
    facilityId: number;
    status: string;
    updatedBy: string;
    updatedDateTime?: Date;
}


export interface LastActiveRoute {
    id: number;
    user: string;
    value: string;
}
