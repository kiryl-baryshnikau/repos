import { Component, Inject } from '@angular/core';
import { ODataService, ODataQuery, ODataResponse } from 'odata-v4-ng';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public forecasts: WeatherForecast[];

  constructor(odata: ODataService, @Inject('BASE_URL') baseUrl: string) {
    let query = new ODataQuery(odata, baseUrl + "odata")
      .entitySet("SampleData");
    query.get().subscribe(
      (odataResponse: ODataResponse) => {
        let entitySet = odataResponse.toEntitySet<WeatherForecast>();
        let entities = entitySet.getEntities();
        this.forecasts = entities;
      },
      (error: string) => {
        console.error(error);
      }
    );
  }
}

interface WeatherForecast {
  id: number;
  dateFormatted: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
