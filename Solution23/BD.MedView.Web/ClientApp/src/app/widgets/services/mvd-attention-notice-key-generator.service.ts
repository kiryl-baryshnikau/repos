import { Injectable } from "@angular/core";
import { AttentionNotice } from './mvd-attention-notice-entities'

@Injectable()
export class AttentionNoticeKeyGeneratorService {
    public getKey(item: AttentionNotice): string {
        switch (item.noticeTypeInternalCode) {
            case 'QUEMEDITEM': {
                return btoa(`${item.noticeTypeInternalCode}|${item.facilityKey}`);
            }
            case 'ETLFAIL': {
                return btoa(`${item.noticeTypeInternalCode}|${item.facilityKey}|${item.noticeStartUtcDateTime}`);
            }
            case 'CRITLOW':
            case 'DDCRITOVRD':
            case 'DOWNDELAYD':
            case 'FAILMEDSS':
            case 'MEDDDNCOMM':
            case 'PENDSWUPD':
            case 'RXCHECK':
            case 'STOCKOUT':
            case 'UNRMEDDSC':
            case 'UPDOWNFAIL':
            case 'UPFAIL':
            case 'UPRETRY': {
                return btoa(`${item.noticeTypeInternalCode}|${item.facilityKey}|${item.dispensingDeviceName}|${item.noticeStartUtcDateTime}`);
            }
            case 'PATINBND': 
            case 'PHORDINBND': {
                return btoa(`${item.noticeTypeInternalCode}|${item.facilityKey}|${item.externalSystemKey}|${item.noticeStartUtcDateTime}`);
            }

            case 'MEDTMPORNG': {
                return btoa(`${item.noticeTypeInternalCode}|${item.facilityKey}|${item.dispensingDeviceName}|${item.eventStartUtcDateTime}`);
            }
            //default: throw new Error(`Unsupported Attention Notice '${item.kind}'`);
        }
    }
}
