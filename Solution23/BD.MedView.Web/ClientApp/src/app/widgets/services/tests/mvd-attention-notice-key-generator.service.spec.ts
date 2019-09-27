import { TestBed } from '@angular/core/testing';
import { AttentionNoticeKeyGeneratorService } from '../mvd-attention-notice-key-generator.service';
import { Dictionary } from 'lodash';

describe('AttentionNoticeKeyGeneratorService', () => {
    const item = {
        noticeTypeInternalCode: undefined,
        facilityKey: 'facilityKey',
        noticeStartUtcDateTime: new Date(2019, 7, 6, 12, 0, 0, 0),
        dispensingDeviceName: 'dispensingDeviceName'
    };
    const noticeTypes = ['QUEMEDITEM', 'ETLFAIL', 'CRITLOW', 'DDCRITOVRD', 'DOWNDELAYD', 'FAILMEDSS', 'MEDDDNCOMM', 'PENDSWUPD',
        'RXCHECK', 'STOCKOUT', 'UNRMEDDSC', 'UPDOWNFAIL', 'UPFAIL', 'UPRETRY', 'PATINBND', 'PHORDINBND', 'MEDTMPORNG' ];

    // tslint:disable: max-line-length
    const expectedKeys: Dictionary<string> = {
        'QUEMEDITEM': 'UVVFTUVESVRFTXxmYWNpbGl0eUtleQ==',
        'ETLFAIL': 'RVRMRkFJTHxmYWNpbGl0eUtleXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'CRITLOW': 'Q1JJVExPV3xmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'DDCRITOVRD': 'RERDUklUT1ZSRHxmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'DOWNDELAYD': 'RE9XTkRFTEFZRHxmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'FAILMEDSS': 'RkFJTE1FRFNTfGZhY2lsaXR5S2V5fGRpc3BlbnNpbmdEZXZpY2VOYW1lfFR1ZSBBdWcgMDYgMjAxOSAxMjowMDowMCBHTVQtMDUwMCAoQ2VudHJhbCBEYXlsaWdodCBUaW1lKQ==',
        'MEDDDNCOMM': 'TUVEREROQ09NTXxmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'PENDSWUPD': 'UEVORFNXVVBEfGZhY2lsaXR5S2V5fGRpc3BlbnNpbmdEZXZpY2VOYW1lfFR1ZSBBdWcgMDYgMjAxOSAxMjowMDowMCBHTVQtMDUwMCAoQ2VudHJhbCBEYXlsaWdodCBUaW1lKQ==',
        'RXCHECK': 'UlhDSEVDS3xmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'STOCKOUT': 'U1RPQ0tPVVR8ZmFjaWxpdHlLZXl8ZGlzcGVuc2luZ0RldmljZU5hbWV8VHVlIEF1ZyAwNiAyMDE5IDEyOjAwOjAwIEdNVC0wNTAwIChDZW50cmFsIERheWxpZ2h0IFRpbWUp',
        'UNRMEDDSC': 'VU5STUVERFNDfGZhY2lsaXR5S2V5fGRpc3BlbnNpbmdEZXZpY2VOYW1lfFR1ZSBBdWcgMDYgMjAxOSAxMjowMDowMCBHTVQtMDUwMCAoQ2VudHJhbCBEYXlsaWdodCBUaW1lKQ==',
        'UPDOWNFAIL': 'VVBET1dORkFJTHxmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'UPFAIL': 'VVBGQUlMfGZhY2lsaXR5S2V5fGRpc3BlbnNpbmdEZXZpY2VOYW1lfFR1ZSBBdWcgMDYgMjAxOSAxMjowMDowMCBHTVQtMDUwMCAoQ2VudHJhbCBEYXlsaWdodCBUaW1lKQ==',
        'UPRETRY': 'VVBSRVRSWXxmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXxUdWUgQXVnIDA2IDIwMTkgMTI6MDA6MDAgR01ULTA1MDAgKENlbnRyYWwgRGF5bGlnaHQgVGltZSk=',
        'PATINBND': 'UEFUSU5CTkR8ZmFjaWxpdHlLZXl8dW5kZWZpbmVkfFR1ZSBBdWcgMDYgMjAxOSAxMjowMDowMCBHTVQtMDUwMCAoQ2VudHJhbCBEYXlsaWdodCBUaW1lKQ==',
        'PHORDINBND': 'UEhPUkRJTkJORHxmYWNpbGl0eUtleXx1bmRlZmluZWR8VHVlIEF1ZyAwNiAyMDE5IDEyOjAwOjAwIEdNVC0wNTAwIChDZW50cmFsIERheWxpZ2h0IFRpbWUp',
        'MEDTMPORNG': 'TUVEVE1QT1JOR3xmYWNpbGl0eUtleXxkaXNwZW5zaW5nRGV2aWNlTmFtZXx1bmRlZmluZWQ='
    };

    let service: AttentionNoticeKeyGeneratorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AttentionNoticeKeyGeneratorService
            ]
        });

        service = TestBed.get(AttentionNoticeKeyGeneratorService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getKey', () => {
        noticeTypes.forEach(noticeType => {
            it(`should get the expected key for ${noticeType}`, () => {
                item.noticeTypeInternalCode = noticeType;
                const expected = expectedKeys[noticeType];

                const key = service.getKey(item as any);
                expect(key).toEqual(expected);
            });
        });
    });
});
