import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-legacy-data',
  templateUrl: './legacy-data.component.html'
})
export class LegacyDataComponent {
  public test: any;
  public version: string;
  public token: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    this.refresh()
  }

  public refresh(value: string = ''): void {
    switch (value) {
      case 'test':
        this.refreshTest();
        break;
      case 'varsion':
        this.refreshVersion();
        break;
      case 'token':
        this.refreshToken();
        break;
      default:
        //this.refreshVersion();
        //this.refreshToken();
        break;
    }
  }

  private refreshTest(): void {
    this.http.get(this.baseUrl + 'api/Default/Test').subscribe(result => {
      this.test = result;
    }, error => {
      console.error(error);
      this.test = error;
    });
  } 

  private refreshVersion(): void {
    this.http.get<string>(this.baseUrl + 'api/Default/Version').subscribe(result => {
      this.version = result;
    }, error => {
      console.error(error);
      this.version = error;
    });
  } 

  private refreshToken(): void {
    this.http.get<string>(this.baseUrl + 'api/Default/Token').subscribe(result => {
      this.token = result;
    }, error => {
      console.error(error);
        this.token = error;
    });
  } 
}
