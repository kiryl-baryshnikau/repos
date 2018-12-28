import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-loader-component',
  templateUrl: './loader.component.html'
})
export class LoaderComponent implements OnInit {
  public data: Item[];

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
  }

  ngOnInit(): void {
    this.reload();
  }

  onReloadClick(): void {
    this.reload();
  }

  private reload(): void {
    delete this.data;
    this.http.get<Item[]>(this.baseUrl + 'api/SampleData/WeatherForecasts').subscribe(
      result => {
        this.data = result;
      },
      error => {
        console.error(error);
      }
    );
  }
}

interface Item {
  dateFormatted: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
