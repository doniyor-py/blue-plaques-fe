import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { VisitService } from './visit-service';
import { testProviders } from '../testing/test-providers';
import { API_URL } from '../api';

describe('VisitService', () => {
  let service: VisitService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(VisitService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getVisits asks for the newest visits first', () => {
    service.getVisits('p1').subscribe();

    const req = http.expectOne(r => r.url === API_URL + '/plaques/p1/visits');
    expect(req.request.params.get('sort')).toBe('date');
    expect(req.request.params.get('order')).toBe('desc');
    expect(req.request.params.get('ps')).toBe('100');
    req.flush({ total: 0, visits: [] });
  });

  it('checkIn posts an empty form: a visit needs no ratings', () => {
    service.checkIn('p1').subscribe();

    const req = http.expectOne(API_URL + '/plaques/p1/visits');
    expect(req.request.method).toBe('POST');
    expect([...(req.request.body as FormData).keys()]).toEqual([]);
    req.flush({ _id: 'v1' }, { status: 201, statusText: 'Created' });
  });

  it('saveReview sends all three ratings and the note', () => {
    service.saveReview('p1', 'v1', { history: 4, condition: 3, accessibility: 5, note: 'Easy to find' }).subscribe();

    const req = http.expectOne(API_URL + '/plaques/p1/visits/v1');
    expect(req.request.method).toBe('PUT');
    const body = req.request.body as FormData;
    expect(body.get('history')).toBe('4');
    expect(body.get('condition')).toBe('3');
    expect(body.get('accessibility')).toBe('5');
    expect(body.get('note')).toBe('Easy to find');
    req.flush({});
  });

  it('saveReview sends an empty note when there is none', () => {
    service.saveReview('p1', 'v1', { history: 1, condition: 2, accessibility: 3 }).subscribe();
    const req = http.expectOne(API_URL + '/plaques/p1/visits/v1');
    expect((req.request.body as FormData).get('note')).toBe('');
    req.flush({});
  });

  it('deleteVisit sends a DELETE for that visit', () => {
    service.deleteVisit('p1', 'v1').subscribe();
    const req = http.expectOne(API_URL + '/plaques/p1/visits/v1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
