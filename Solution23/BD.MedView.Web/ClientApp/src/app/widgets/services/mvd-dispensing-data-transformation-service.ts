import { Injectable } from "@angular/core";
import { DatePipe } from '@angular/common';

import { ResourceService } from 'container-framework';
import { FacilityLookUpService } from '../../services/facility-look-up.service';
import { MvdConstants } from '../shared/mvd-constants';
import * as moment from 'moment';

const allFacilitiesKey = MvdConstants.ALL_FACILITIES_KEY;

@Injectable()
export class DispensingDataTransformationService {
    private resources: any;
    private detailColumnsMap: any;
    private itemMap: any;
    authorizationConfiguration: any;
    facilitySourceProvider = 'dispensing';

    constructor(private resourcesService: ResourceService,
        private datePipe: DatePipe,
        private facilityLookUpService: FacilityLookUpService) {
        this.resources = this.getResources();
        this.detailColumnsMap = this.createDetailColumnsMap();
        this.itemMap = this.createItemMap();
    }

    getResources(): any {
        return {
            daysAbbreviation: this.resourcesService.resource("abbreviationDays"),
            hoursAbbreviation: this.resourcesService.resource("abbreviationHours"),
            minAbbreviation: this.resourcesService.resource("abbreviationMinutes"),
            newItem: this.resourcesService.resource("newItem"),
            dateFormat: this.resourcesService.resource("dateFormat"),
            timeFormat: this.resourcesService.resource("timeFormat"),
            defrostMode: this.resourcesService.resource("defrostMode"),

            outOfServiceNoticeOutOfService: this.resourcesService.resource('outOfServiceNoticeOutOfService'),
            outOfServiceNoticeDefrostMode: this.resourcesService.resource('outOfServiceNoticeDefrostMode'),

            orderStatusActive: this.resourcesService.resource("orderStatusActive"),
            orderStatusDiscontinued: this.resourcesService.resource("orderStatusDiscontinued"),
            orderStatusCancelled: this.resourcesService.resource("orderStatusCancelled"),
            orderStatusOnHold: this.resourcesService.resource("orderStatusOnHold"),
            trackingStatusDelivered: this.resourcesService.resource("trackingStatusDelivered"),
            trackingStatusInTransit: this.resourcesService.resource("trackingStatusInTransit"),
            trackingStatusQueued: this.resourcesService.resource("trackingStatusQueued"),
            trackingStatusCancelled: this.resourcesService.resource("trackingStatusCancelled"),
            timeSinceResolution: this.resourcesService.resource("timeSinceResolution"),

            controlled: this.resourcesService.resource("controlled"),
            acceptableRange: this.resourcesService.resource("acceptableRange"),
        };
    }

    createDetailColumnsMap(): any {
        return {
            DOWNDELAYD: ["dispensingDeviceName", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            PATINBND: ["externalSystemName", "noticeDuration", "noticeStartUtcDateTime", "inboundInterruptTypeInternalCode", "status"],
            PHORDINBND: ["externalSystemName", "noticeDuration", "noticeStartUtcDateTime", "inboundInterruptTypeInternalCode", "status"],
            UPDOWNFAIL: ["dispensingDeviceName", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            UPFAIL: ["dispensingDeviceName", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            UPRETRY: ["dispensingDeviceName", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            QUEMEDITEM: ["facilityName", "newItems", "deletedItems", "status"],
            RXCHECK: ["dispensingDeviceName", "numberOfItems", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            STOCKOUT: ["dispensingDeviceName", "item", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            UNRMEDDSC: ["dispensingDeviceName", "item", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            PENDSWUPD: ["dispensingDeviceName", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            CRITLOW: ["dispensingDeviceName", "item", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            DDCRITOVRD: ["dispensingDeviceName", "item", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            ETLFAIL: ["noticeStartUtcDateTime", "noticeDuration", "status"],
            FAILMEDSS: ["dispensingDeviceName", "item", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            MEDDDNCOMM: ["dispensingDeviceName", "noticeDuration", "noticeStartUtcDateTime", "areas", "facilityName", "status"],
            MEDTMPORNG: ["dispensingDeviceName", "item", "eventDuration", "eventStartUtcDateTime", "areas", "facilityName", "status"]
        };
    }

    createItemMap(): any {
        return {
            STOCKOUT: (notice) =>  {
                return notice["medDisplayName"];
            },
            CRITLOW: (notice) => {
                return notice["medDisplayName"];
            },
            FAILMEDSS: (notice) => {
                var controlled = notice["controlledFlag"] ? "/" + this.resources.controlled : "";
                var item = notice["medDisplayName"];
                var itemText = item ? "/" + item : "";

                return notice["storageSpaceAbbreviatedName"] + " (" + notice["storageSpaceTypeShortName"] +
                    controlled + itemText + "/" + notice["storageSpaceFailureReasonDescriptionText"] + ")";
            },
            UNRMEDDSC: (notice) => {
                var brandName = notice["brandName"];
                return notice["itemTransactionTypeMedDescription"] + "/" + notice["medDisplayName"] + (brandName ? " (" + brandName + ")" : "");
            },
            MEDTMPORNG: (notice) => {
                var defrost = notice["defrost"];
                var indicator = defrost ? "/" + this.resources.defrostMode : "";
                var acceptable = this.resources.acceptableRange;
                var minSinceResolutionDuration = Math.floor((notice.ticksSinceResolutionDuration || 0) / (10000 * 1000 * 60));
                var sinceResolution = "";
                if (minSinceResolutionDuration > 0) {
                    var hours = Math.floor(minSinceResolutionDuration / 60);
                    var minutes = minSinceResolutionDuration % 60;
                    sinceResolution = " (" + this.resources.timeSinceResolution + " " + hours + this.resources.hoursAbbreviation + " " + minutes + this.resources.minAbbreviation + ")";
                }

                let outOfServiceNotice = notice["outOfServiceNotice"] || '';
                if (outOfServiceNotice) {
                    outOfServiceNotice = '/' + this.resources['outOfServiceNotice' + outOfServiceNotice];
                }

                return notice["storageSpaceAbbreviatedName"] + ": " + notice["temperatureReadingAmount"] + "° " + notice["providedUnitOfTemperatureDisplayCode"] +
                    " (" + acceptable + notice["temperatureRangeLowerAmount"] + "-" +
                    notice["temperatureRangeUpperAmount"] + "° " + notice["unitOfTemperatureDisplayCode"] + ")" +
                    indicator + sinceResolution + outOfServiceNotice;
            },
            DDCRITOVRD: (notice) => {
                var manual = notice["criticalOverrideManual"];
                var reason = notice["criticalOverrideTriggerTypeCode"];

                var userName = notice["userAccountDisplayName"];
                var userNameText = userName ? "/" + userName : "";

                var userId = notice["userId"];
                var userIdText = userId ? "(" + userId + ")" : ""

                var user = manual ? userNameText + " " + userIdText : "";

                return this.resourcesService.resource(reason.toLowerCase()) + " " + user;
            }
        };
    }

    getAllFacilitiesKey() : string {
        return allFacilitiesKey;
    }

    getFacilityQuery(facilityKey) : string {
        return "/?facilityKeys=" + (facilityKey === allFacilitiesKey ? "" : facilityKey);
    }

    getSeverityStyle(severity) : string {
        switch (severity) {
            case "L":
                return "severity-1-marker";
            case "M":
                return "severity-2-marker";
            case "H":
                return "severity-3-marker";
            default:
                return "severity-0-marker";
        }
    }

    getSeverityIconStyle(severity) : string {
        switch (severity) {
            case "L":
                return "fa-stop attention-notices-item-severity-1";
            case "M":
                return "fa-play fa-rotate-270 attention-notices-item-severity-2";
            case "H":
                return "fa-stop fa-rotate-45  attention-notices-item-severity-3";
            default:
                return "fa-circle attention-notices-item-severity-0";
        }
    }

    getOverThresholdSeverityIconStyle(severity) {
        var style = "";
        switch (severity) {
            case "L":
                return "fa-stop" + style;
            case "M":
                return "fa-play fa-rotate-270" + style;
            case "H":
                return "fa-stop fa-rotate-45" + style;
            default:
                return "fa-circle" + style;
        }
    }

    getDurationDisplay(duration) {
        let cuttoff = 48 * 60;
        let display = "";

        let hours = Math.floor(duration / 60);

        if (duration > cuttoff) {
            let days = Math.floor(hours / 24);
            display += days + this.resources.daysAbbreviation;
            return display;
        }

        if (hours > 0) {
            display += hours + this.resources.hoursAbbreviation + " ";
        }

        let minutes = duration % 60;
        if (minutes > 0) {
            display += minutes + this.resources.minAbbreviation;
        }

        return display || this.resources.newItem;
    };

    getDateDisplay(date, adjustTimeZone) {
        if (!date) {
            return "";
        }

        //Expected format: YYYY-MM-DDTHH:mm:ss.sssZ
        //Dropping miliseconds;
        date = date.substr(0, 19) + "Z";
        var d;

        try {
            d = new Date(date);
        }
        catch (e) {
            //IE9
            date[4] = date[7] = "/";
            date[10] = " ";
            d = new Date(date);
        }
        adjustTimeZone = 0; //suppress Time zone adjustment

        var o = adjustTimeZone ? adjustTimeZone * 60 * 60 * 1000 : 0;
        var display = new Date(d.getTime() - o);

        let dateTimeFormat = `${this.resources.dateFormat} ${this.resources.timeFormat}`;

        return this.datePipe.transform(date, dateTimeFormat);
    }

    shapeData(data, preferences, polledThreshold) {
        if (data && data.length > 0) {
            var items = data.filter(value => value.noticeCount > 0 && (value.locked
                || !preferences.noticeTypes.length
                || preferences.noticeTypes.some(noticeType => value.noticeTypeInternalCode === noticeType.noticeTypeInternalCode && !noticeType.off)));

            items.forEach((value, index) => {
                value.critical = value.locked || preferences.noticeTypes.some(noticeType => {
                    var status = value.noticeTypeInternalCode == noticeType.noticeTypeInternalCode && noticeType.critical && noticeType.critical === true;
                    return status;
                });

                if (value.critical) {
                    var threshold = (polledThreshold !== undefined) ? polledThreshold : preferences.facility.attentionNoticeCriticalThresholdDuration;

                    //$log.info("mvdHelperService::shapeData: pollThreshold=" + polledThreshold + ", threshold=" + threshold);

                    value.highlight = threshold ? ((value.oldestNoticeDuration || 0) > threshold) : false;
                }
                else {
                    value.highlight = false;
                }

                value.severity = this.getSeverity(value.noticeSeverityInternalCode);
            });
            items = items.sort(function (a, b) {
                return b.severity - a.severity;
            });

            return items;
        }
    };

    transformNoticeDetails(data, noticeType, authConfig) {
        this.authorizationConfiguration = [...authConfig];
        return this.shapeNoticeDetailsData(data, noticeType);
    }

    shapeNoticeDetailsData(data, noticeType) {
        var items = {
            columns: this.detailColumnsMap[noticeType].map((item) => {
                return {
                    code: item, name: (item === 'status' ? this.resourcesService.resource('currentStatus') : this.resourcesService.resource(item)) || item
                };
            }),
            data: !data
                ? []
                : data.map((notice) => {
                    var item = {}
                    this.detailColumnsMap[noticeType].map((key) => {
                        var display = key + "Display";
                        item[key] = notice[key];

                        switch (key) {
                            case "noticeDuration":
                            case "eventDuration":
                                item[display] = this.getDurationDisplay(notice[key]);
                                break;
                            case "noticeStartUtcDateTime":
                            case "eventStartUtcDateTime":
                                item[display] = this.getDateDisplay(notice[key], notice["noticeStartDateTimeOffset"]);
                                break;
                            case "inboundInterruptTypeInternalCode":
                                item[display] = this.resourcesService.resource(notice[key]).toLowerCase();
                                break;
                            case "item":
                                item[display] = this.itemMap[noticeType](notice);
                                item[key] = item[display];
                                break;
                            case "facilityName":
                                item[display] = this.getMasterFacility(notice['facilityKey']);
                                item[key] = item[display];
                                break;
                            case "status":
                                item[display] = notice[key];
                                item[key] = item[display];
                                break;
                            default:
                                item[display] = notice[key];
                                break;
                        }
                    });

                    item = this.addAcknowledgementFields(item, notice);

                    return item;
                })
        };

        if (items.data.length > 0) {
            let defaultSortingProperties = ["noticeDuration", "eventDuration"];
            for (let i = 0; i < defaultSortingProperties.length; i++) {
                let defaultSortingProperty = defaultSortingProperties[i];
                if (items.data[0].hasOwnProperty(defaultSortingProperty)) {
                    items.data = items.data.sort((a, b) => {
                        return a[defaultSortingProperty] - b[defaultSortingProperty];
                    });
                    break;
                }
            }
        }

        console.log('data...', items);
        return items;
    }
    private addAcknowledgementFields(item, noticeItem): {} {
        if (!noticeItem) {
            return item;
        }

        item.id = noticeItem.id || 0;
        item.updatedBy = noticeItem.updatedBy;
        item.facilityKey = noticeItem.facilityKey;
        item.updatedDateTime = noticeItem.updatedDateTime ? moment.utc(noticeItem.updatedDateTime).local() : undefined;
        item.status = noticeItem.status;
        item.key = noticeItem.key;
        return item;
    }

    getSeverity(severity) {
        switch (severity) {
            case "L":
                return 1;
            case "M":
                return 2;
            case "H":
                return 3;
            default:
                return 0;
        }
    }

    processDoseRequestData(data) {
        if (!data) {
            return [];
        }

        let groupped = this.groupBy(data,
            item => item.patientUnitName,
            (code1, code2) => code1 === code2);

        groupped.forEach((group) => {
            let allItemsCount = 0;
            let newItemsCount = 0;
            let age = Number.MAX_VALUE;

            group.forEach(item => {
                ++allItemsCount;
                if (item.newRequest) {
                    ++newItemsCount;
                }
                age = Math.min(age, item.requestDuration || 0);
            });

            group.allItemsCount = allItemsCount;
            group.newItemsCount = newItemsCount;
            group.careUnit = group.key;
            group.age = age;
            group.ageOnScreen = this.getDurationDisplay(age);
        });

        return groupped;
    }

    formatOrderStatus(value) {
        var orderStatus;

        if (!value.orderActive) {
            if (value.orderDiscontinued)
                orderStatus = this.resources.orderStatusDiscontinued;
            else if (value.orderCancelled)
                orderStatus = this.resources.orderStatusCancelled;
            else if (value.orderOnHold)
                orderStatus = this.resources.orderStatusOnHold;
        }

        return orderStatus || "";
    }

    formatTrackingStatus(value) {
        var trackingStatus = value.trackingStatus;

        switch (trackingStatus) {
            case "DELIVERED":
                trackingStatus = this.resources.trackingStatusDelivered;
                break;
            case "INTRANSIT":
                trackingStatus = this.resources.trackingStatusInTransit;
                break;
            case "QUEUEDLV":
                trackingStatus = this.resources.trackingStatusQueued;
                break;
            case "CANCELLED":
                trackingStatus = this.resources.trackingStatusCancelled;
                break;
        }

        return trackingStatus || "";
    }

    formatPatientInfo(value, dataMasking) {
        // When patient data is masked, the system will display
        // the patient information as follows:
        //     a first character of Last Name,
        //     2 first characters of First Name.
        //     Patient ID will not be displayed
        // Example: T, Ja

        var displayPatientInfo;

        if (dataMasking) {
            var maskedPatientFirstName = (value.patientFirstName || "").substr(0, 2);
            displayPatientInfo = (value.patientLastName || "").substr(0, 1) + (maskedPatientFirstName ? ", " + maskedPatientFirstName : "");
        }
        else {
            var displayPatientId = value.displayPatientId ? " (" + value.displayPatientId + ")" : "";
            var patientFirstName = value.patientFirstName ? ", " + value.patientFirstName : "";

            displayPatientInfo = (value.patientLastName || "") + patientFirstName + displayPatientId;
        }

        return displayPatientInfo;
    }

    first(group: any, predicate: any, def: any) {
        var l = group.length;

        if (!predicate) {
            return l ? group[0] : def == null ? null : def;
        }

        for (var i = 0; i < l; i++) {
            if (predicate(group[i], i, group)) {
                return group[i];
            }
        }

        return def == null ? null : def;
    };

    groupBy(array, selector, comparer) {
        var group = [];
        var l = array.length;
        comparer = comparer || this.DefaultEqualityComparer;
        selector = selector || this.DefaultSelector;

        for (var i = 0; i < l; i++) {
            var k = selector(array[i]);
            var g = this.first(group, function (u) {
                return comparer(u.key, k);
            }, null);

            if (!g) {
                g = [];
                g.key = k;
                group.push(g);
            }

            g.push(array[i]);
        }

        return group;
    }

    DefaultPredicate() {
        return true;
    };
    DefaultSelector(t) {
        return t;
    };
    DefaultEqualityComparer(a, b) {
        return a === b || a.valueOf() === b.valueOf();
    };

    getMasterFacility(nativeFacilityName) {
        if (!nativeFacilityName && !this.authorizationConfiguration) {
            this.resources.resource('unknown');
        }
        return this.facilityLookUpService.masterFacilityNameLookUp(nativeFacilityName,
            this.authorizationConfiguration,
            this.facilitySourceProvider);
    }
}
