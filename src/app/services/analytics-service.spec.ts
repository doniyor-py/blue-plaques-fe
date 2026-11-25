import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { AnalyticsService } from './analytics-service';
import { testProviders } from '../testing/test-providers';
import { API_URL } from '../api';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(AnalyticsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTopRated uses 3 reviews and 10 plaques by default', () => {
    service.getTopRated().subscribe();
    http.expectOne(API_URL + '/analytics/top-rated?min_visits=3&limit=10').flush([]);
  });

  it('getTopRated can change both numbers', () => {
    service.getTopRated(1, 5).subscribe();
    http.expectOne(API_URL + '/analytics/top-rated?min_visits=1&limit=5').flush([]);
  });
});
