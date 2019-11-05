import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const dateTimeReviver = function (key, value) {
    let a;
    if (typeof value === 'string') {
        a = /\/Date\((\d*)\)\//.exec(value);
        if (a) {
            return new Date(+a[1]);
        }
    }
    return value;
}

const dateParser = function (key, value) {
    const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
    if (typeof value === 'string') {
        let a = reISO.exec(value);
        if (a)
            return new Date(value);
        a = reMsAjax.exec(value);
        if (a) {
            var b = a[1].split(/[-+,.]/);
            return new Date(b[0] ? +b[0] : 0 - +b[1]);
        }
    }
    return value;
}



@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public forecasts: WeatherForecast[];
  public when: Date;

  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    http.get<WeatherForecast[]>(baseUrl + 'weatherforecast').subscribe(result => {
        this.forecasts = result;
        this.when = new Date();
        let pattern = JSON.stringify(this.when);
        //pattern = "2019-11-05T18:01:21.889Z";
        let value1 = JSON.parse(pattern);
        let value2 = JSON.parse(pattern, dateTimeReviver);
        let value3 = JSON.parse(pattern, dateParser);
    }, error => console.error(error));
  }
}

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
