import * as moment from 'moment';

// Note: serverOffset should be to UTC. i.e, for GMT-5, offset should '5:00:00'

export class MvdTimeTransformService {
    toServerTime(localTime: string | Date | moment.Moment, serverOffsetToUtc: string | moment.Duration): moment.Moment {
        const localTimeMoment = moment(localTime);
        const localTimeOffset = moment.duration(new Date().getTimezoneOffset(), 'minutes');
        const serverTimeOffset = moment.duration(serverOffsetToUtc);

        return localTimeMoment.add(localTimeOffset).subtract(serverTimeOffset);
    }

    toLocalTime(serverTime: string | Date | moment.Moment, serverOffsetToUtc: string | moment.Duration): moment.Moment {
        const serverTimeMoment = moment(serverTime);
        const localTimeOffset = moment.duration(new Date().getTimezoneOffset(), 'minutes');
        const serverTimeOffset = moment.duration(serverOffsetToUtc);

        return serverTimeMoment.add(serverTimeOffset).subtract(localTimeOffset);
    }

    utcToServerTime(utcTime: string | Date | moment.Moment, serverOffsetToUtc: string | moment.Duration): moment.Moment {
        const utcTimeMoment = moment(utcTime);
        const serverTimeOffset = moment.duration(serverOffsetToUtc);

        return utcTimeMoment.subtract(serverTimeOffset);
    }

    serverTimeToUtc(serverTime: string | Date | moment.Moment, serverOffsetToUtc: string | moment.Duration): moment.Moment {
        const serverTimeMoment = moment(serverTime);
        const serverTimeOffset = moment.duration(serverOffsetToUtc);

        return serverTimeMoment.add(serverTimeOffset);
    }
}
