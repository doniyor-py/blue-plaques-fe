import { TestBed } from '@angular/core/testing';

import { AnalyticsService } from './analytics-service';
import { testProviders } from '../testing/test-providers';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(AnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
