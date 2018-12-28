import { TestBed, inject } from '@angular/core/testing';

import { ExtensionLibService } from './extension-lib.service';

describe('ExtensionLibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExtensionLibService]
    });
  });

  it('should be created', inject([ExtensionLibService], (service: ExtensionLibService) => {
    expect(service).toBeTruthy();
  }));
});
