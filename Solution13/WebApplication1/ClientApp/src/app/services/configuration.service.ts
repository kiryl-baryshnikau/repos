import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface Configuation {
  authorizationUrl: string;
}

@Injectable()
export class ConfigurationService implements Configuation {
  authorizationUrl: string;

  private _loaded: boolean = false;
  private _error: any = null;

  constructor(@Inject('BASE_URL') private baseUrl: string, private http: HttpClient) { }

  initialize(): Observable<Configuation> {
    this._loaded = false;
    this._error = null;

    return this.http
      .get<Configuation>('api/configuration')
      .pipe(map((data: Configuation) => {
        Object.keys(data).forEach(key => {
          this[key] = new URL(data[key], this.baseUrl).href;
        });
        this._loaded = true;
        return data;
      }), catchError((err: any) => {
        this._error = err;
        throw err;
      }));
  }


  get loaded(): any {
    return this._loaded;
  }

  get error(): any {
    return this._error;
  }
}
