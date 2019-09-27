type Guid = string;
type DateTime = string;

//#region Inheritance
interface AttentionNoticeBase {
    facilityKey: Guid;
    key: string;
}
//Stock critical low
interface CRITLOW extends AttentionNoticeBase {
    noticeTypeInternalCode: 'CRITLOW';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Device on critical override
interface DDCRITOVRD extends AttentionNoticeBase {
    noticeTypeInternalCode: 'DDCRITOVRD';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Devices with download delayed
interface DOWNDELAYD extends AttentionNoticeBase {
    noticeTypeInternalCode: 'DOWNDELAYD';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//ETL process delayed - report data not current
interface ETLFAIL extends AttentionNoticeBase {
    noticeTypeInternalCode: 'ETLFAIL';
    noticeStartUtcDateTime: string;
}
//Failed storage space
interface FAILMEDSS extends AttentionNoticeBase {
    noticeTypeInternalCode: 'FAILMEDSS';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Device not communicating
interface MEDDDNCOMM extends AttentionNoticeBase {
    noticeTypeInternalCode: 'MEDDDNCOMM';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Refrigerator temperature out of range
interface MEDTMPORNG extends AttentionNoticeBase {
    noticeTypeInternalCode: 'MEDTMPORNG'; //'CRITLOW'
    dispensingDeviceName: string;
    eventStartUtcDateTime: DateTime;
}
//Patient information delayed/down
interface PATINBND extends AttentionNoticeBase {
    noticeTypeInternalCode: 'PATINBND';
    externalSystemKey: string;
    noticeStartUtcDateTime: DateTime;
}
//Pending software update
interface PENDSWUPD extends AttentionNoticeBase {
    noticeTypeInternalCode: 'PENDSWUPD';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Pharmacy order delayed/down
interface PHORDINBND extends AttentionNoticeBase {
    noticeTypeInternalCode: 'PHORDINBND';
    externalSystemKey: string;
    noticeStartUtcDateTime: DateTime;
}
//Queued formulary items
interface QUEMEDITEM extends AttentionNoticeBase {
    noticeTypeInternalCode: 'QUEMEDITEM';
}
//Devices requiring RxCheck
interface RXCHECK extends AttentionNoticeBase {
    noticeTypeInternalCode: 'RXCHECK';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Stock out
interface STOCKOUT extends AttentionNoticeBase {
    noticeTypeInternalCode: 'STOCKOUT';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Unresolved discrepancy
interface UNRMEDDSC extends AttentionNoticeBase {
    noticeTypeInternalCode: 'UNRMEDDSC';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Devices with download stopped
interface UPDOWNFAIL extends AttentionNoticeBase {
    noticeTypeInternalCode: 'UPDOWNFAIL';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Devices with upload stopped
interface UPFAIL extends AttentionNoticeBase {
    noticeTypeInternalCode: 'UPFAIL';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//Devices with upload in retry mode
interface UPRETRY extends AttentionNoticeBase {
    noticeTypeInternalCode: 'UPRETRY';
    dispensingDeviceName: string;
    noticeStartUtcDateTime: DateTime;
}
//#endregion Inheritance

export enum EnumAttentionNoticeStatus {
    New = 'New',
    Acknowledged = 'Acknowledged'
}

export type AttentionNotice = CRITLOW | DDCRITOVRD | DOWNDELAYD | ETLFAIL | FAILMEDSS | MEDDDNCOMM | MEDTMPORNG | PATINBND | PENDSWUPD | PHORDINBND | QUEMEDITEM | RXCHECK | STOCKOUT | UNRMEDDSC | UPDOWNFAIL | UPFAIL | UPRETRY;

