import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { ReportService } from './report-service';
import { testProviders } from '../testing/test-providers';
import { API_URL } from '../api';

describe('ReportService', () => {
  let service: ReportService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(ReportService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getReports with "All" sends no status filter', () => {
    service.getReports(1, 10, '').subscribe();
    const req = http.expectOne(API_URL + '/reports?pn=1&ps=10');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 0, reports: [] });
  });

  it('getReports can filter by status', () => {
    service.getReports(1, 10, 'resolved').subscribe();
    const req = http.expectOne(API_URL + '/reports?pn=1&ps=10&status=resolved');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 0, reports: [] });
  });

  it('reportProblem posts the type and message for that plaque', () => {
    service.reportProblem('p1', 'damaged', 'Cracked on the left').subscribe();

    const req = http.expectOne(API_URL + '/plaques/p1/reports');
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    expect(body.get('type')).toBe('damaged');
    expect(body.get('message')).toBe('Cracked on the left');
    req.flush({});
  });

  it('updateStatus sends the new status', () => {
    service.updateStatus('r1', 'in_progress').subscribe();

    const req = http.expectOne(API_URL + '/reports/r1');
    expect(req.request.method).toBe('PUT');
    expect((req.request.body as FormData).get('status')).toBe('in_progress');
    req.flush({});
  });
});
