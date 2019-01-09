/* tslint:disable */

import { Observable } from 'rxjs';
import { HttpOptions } from './';
import * as models from './models';

export interface APIClientInterface {

  principalsGetPrincipals(
    requestHttpOptions?: HttpOptions
  ): Observable<models.Principal[]>;

  principalsPostPrincipal(
    args: {
      principal: models.Principal,
    },
    requestHttpOptions?: HttpOptions
  ): Observable<models.Principal>;

  principalsGetPrincipal(
    args: {
      id: number,
    },
    requestHttpOptions?: HttpOptions
  ): Observable<models.Principal>;

  principalsPutPrincipal(
    args: {
      id: number,
      principal: models.Principal,
    },
    requestHttpOptions?: HttpOptions
  ): Observable<any>;

  principalsDeletePrincipal(
    args: {
      id: number,
    },
    requestHttpOptions?: HttpOptions
  ): Observable<models.Principal>;

}
