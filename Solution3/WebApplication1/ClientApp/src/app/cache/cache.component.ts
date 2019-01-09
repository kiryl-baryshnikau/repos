import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cache',
  templateUrl: './cache.component.html'
})
export class CacheComponent {
  public value: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {
    http.get<string>(baseUrl + 'api/Cache/a').subscribe(value => {
      this.value = value;
    }, error => console.error(error));
  }

  public incrementCounter() {
    let v = +this.value;
    v++;
    this.value = "" + v;
    this.http.put<string>(this.baseUrl + 'api/Cache/a', ""+v).subscribe(value => {
      this.value = value;
    }, error => console.error(error));
  }

}
