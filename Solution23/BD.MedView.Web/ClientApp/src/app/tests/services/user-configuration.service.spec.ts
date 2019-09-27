import { Observable, of, throwError } from 'rxjs';

import * as conf from '../../services/bd-medview-configuration-entities';
import * as auth from '../../services/authorization.service';

import { ApplicationConfigurationService, AuthenticationService } from 'bd-nav/core';
import { UserConfigurationService } from '../../services/user-configuration.service';
import { AuthorizationService } from '../../services/authorization.service';
import { ConfigurationService } from '../../services/configuration.service';
import { BdMedViewServicesClient } from '../../services/bd-medview-services-client';
import { HttpErrorResponse } from '@angular/common/http';
import { EventBusService } from 'container-framework';

describe('UserConfigurationService', () => {
    beforeEach(() => {
    });

    describe('getUserPreferences', () => {
        it('should set user preferences in cache', () => {
            const bdMedViewServicesClientMock: any = {
                list<T>(collection: string, expand?: string): Observable<T[]> {
                    return of([]);
                },

                create<T>(collection: string, value: T): Observable<T> {
                    return of(value);
                }
            };
            const configurationServiceMock: any = {};
            const authorizationServiceMock: any = {
                getEffectivePermissionsFor(principalName: string): Observable<auth.AuthorizationModel[]> {
                    let value = [
                    ];
                    return of(value);
                }
            };
            const applicationConfigurationServiceMock: any = {};
            const authenticationServiceMock: any = {
                accessToken: {
                    loginName: 'principalName'
                }
            };
            const eventBusServiceMock: any = {
                emitRequestManualRefresh(root: string, channel: string): void { } 
            }

            const expected: conf.UserPreference =
            {
                id: 0,
                user: 'principalName',
                sessionTimeout: 1200,
                maskData: true,
                facilities: [
                    {
                        id: '00000000000000000000000000000000',
                        selected: true,
                        widgets: [],
                        units: []
                    }
                ],
                filters:
                {
                    facilityFilters: []
                },
                columnOptions: [],
                generalSettings: []
            };

            let target = new UserConfigurationService(
                bdMedViewServicesClientMock as BdMedViewServicesClient,
                configurationServiceMock as ConfigurationService,
                authorizationServiceMock as AuthorizationService,
                applicationConfigurationServiceMock as ApplicationConfigurationService,
                authenticationServiceMock as AuthenticationService,
                eventBusServiceMock as EventBusService
            );

            target.getUserPreferences().subscribe(actual => {
                expect(actual).toEqual(expected);
            });
        });
    });
});
