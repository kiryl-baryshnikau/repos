export class UserPreferences{
    getUserPreferences() {
        return {
            "permissions": [
                {
                    "permissionCode": "StatusBoardAttentionNotices",
                    "selected": true
                },
                {
                    "permissionCode": "StatusBoardTrackAndDeliver",
                    "selected": true
                },
                {
                    "permissionCode": "StatusBoardDoseRequest",
                    "selected": true
                }
            ],
            "dataMasking": false,
            "facility": {
                "facilityKey": "00000000000000000000000000000000",
                "facilityName": "All",
                "attentionNoticeCriticalThresholdDuration": 90,
                "permissions": null,
                "delivery": true,
                "remoteDispensing": true,
                "facilityPermissions": [
                    "StatusBoardAttentionNotices", "StatusBoardTrackAndDeliver", "StatusBoardDoseRequest"
                ]
            },
            "noticeTypes": [
                {
                    "noticeTypeInternalCode": "MEDDDNCOMM",
                    "noticeTypeDescription": "Device not communicating",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "DDCRITOVRD",
                    "noticeTypeDescription": "Device on critical override",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "RXCHECK",
                    "noticeTypeDescription": "Devices requiring RxCheck",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "DOWNDELAYD",
                    "noticeTypeDescription": "Devices with download delayed",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "UPRETRY",
                    "noticeTypeDescription": "Devices with upload in retry mode",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "ETLFAIL",
                    "noticeTypeDescription": "ETL process failure - report data not current",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "PATINBND",
                    "noticeTypeDescription": "Patient information delayed/down",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "PENDSWUPD",
                    "noticeTypeDescription": "Pending software update",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "PHORDINBND",
                    "noticeTypeDescription": "Pharmacy order delayed/down",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "QUEMEDITEM",
                    "noticeTypeDescription": "Queued formulary items",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "MEDTMPORNG",
                    "noticeTypeDescription": "SRM temperature out of range",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "CRITLOW",
                    "noticeTypeDescription": "Stock critical low",
                    "locked": false,
                    "include": true,
                    "critical": false
                },
                {
                    "noticeTypeInternalCode": "UNRMEDDSC",
                    "noticeTypeDescription": "Unresolved discrepancy",
                    "locked": false,
                    "include": true,
                    "critical": false
                }
            ]
        };
    }
}
