import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  public forecasts: WeatherForecast[];
  public error: any;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    this.http.get<WeatherForecast[]>(this.baseUrl + 'weatherforecast').subscribe(result => {
      this.forecasts = result;
    }, error => {
      console.error(error)
    });
  }

  refresh() {
    delete this.forecasts;
    delete this.error;
    this.http.get<WeatherForecast[]>(this.baseUrl + 'weatherforecast' + '?rnd=' + new Date().getTime()).subscribe(result => {
      this.forecasts = result;
    }, error => {
      this.error = error;
      console.error(error)
    });
  }

  async refreshAsync() {
    delete this.forecasts;
    delete this.error;
    try {
      this.forecasts = await this.http.get<WeatherForecast[]>(this.baseUrl + 'weatherforecast' + '?rnd=' + new Date().getTime()).toPromise();
    }
    catch (error) {
      this.error = error;
      console.error(error);
    }
  }
}

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
