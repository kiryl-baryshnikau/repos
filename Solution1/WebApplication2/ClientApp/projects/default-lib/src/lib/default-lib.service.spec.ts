import { TestBed } from '@angular/core/testing';

import { DefaultLibService } from './default-lib.service';

describe('DefaultLibService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DefaultLibService = TestBed.get(DefaultLibService);
    expect(service).toBeTruthy();
  });
});
