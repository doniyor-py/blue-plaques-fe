import { TestBed } from '@angular/core/testing';

import { VisitService } from './visit-service';
import { testProviders } from '../testing/test-providers';

describe('VisitService', () => {
  let service: VisitService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(VisitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
