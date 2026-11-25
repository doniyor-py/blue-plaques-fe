import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { PlaqueService } from './plaque-service';
import { testProviders } from '../testing/test-providers';
import { API_URL } from '../api';

describe('PlaqueService', () => {
  let service: PlaqueService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(PlaqueService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('searchPlaques sends the page, the page size and only the filled-in filters', () => {
    service.searchPlaques({ q: 'dickens', borough: 'Camden', colour: '', category: '' }, 2, 10).subscribe();

    const req = http.expectOne(r => r.url === API_URL + '/plaques/search');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pn')).toBe('2');
    expect(req.request.params.get('ps')).toBe('10');
    expect(req.request.params.get('q')).toBe('dickens');
    expect(req.request.params.get('borough')).toBe('Camden');
    expect(req.request.params.has('colour')).toBeFalse();
    req.flush({ total: 0, plaques: [] });
  });

  it('getPlaque counts a view by default', () => {
    service.getPlaque('p1').subscribe();
    const req = http.expectOne(API_URL + '/plaques/p1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('getPlaque(id, false) asks the API not to count a view', () => {
    service.getPlaque('p1', false).subscribe();
    const req = http.expectOne(API_URL + '/plaques/p1?view=false');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('passes the API answer on to whoever subscribed', () => {
    let result: any = null;
    service.getRandomPlaque().subscribe(plaque => result = plaque);

    const req = http.expectOne(API_URL + '/plaques/random');

    expect(req.request.method).toBe('GET');

    req.flush({ _id: 'p9', title: 'Ada Lovelace blue plaque' });
    expect(result.title).toBe('Ada Lovelace blue plaque');
  });

  it('updatePlaque sends form data, including an empty title but not missing values', () => {
    service.updatePlaque('p1', { title: '', colour: 'blue', category: null }).subscribe();

    const req = http.expectOne(API_URL + '/plaques/p1');
    expect(req.request.method).toBe('PUT');
    const body = req.request.body as FormData;
    expect(body.get('title')).toBe('');
    expect(body.get('colour')).toBe('blue');
    expect(body.has('category')).toBeFalse();
    req.flush({});
  });

  it('deletePlaque sends a DELETE for that plaque', () => {
    service.deletePlaque('p1').subscribe();
    const req = http.expectOne(API_URL + '/plaques/p1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('fetches the boroughs only once for two subscribers', () => {
    const answers: string[][] = [];
    service.getBoroughs().subscribe(list => answers.push(list));
    service.getBoroughs().subscribe(list => answers.push(list));

    http.expectOne(API_URL + '/boroughs').flush(['Camden', 'Hackney']);
    expect(answers).toEqual([['Camden', 'Hackney'], ['Camden', 'Hackney']]);

    service.getBoroughs().subscribe(list => answers.push(list));
    http.expectNone(API_URL + '/boroughs');
    expect(answers.length).toBe(3);
  });

  it('fetches the colours only once for two subscribers', () => {
    let answers = 0;
    service.getColours().subscribe(() => answers++);
    service.getColours().subscribe(() => answers++);
    http.expectOne(API_URL + '/colours').flush(['blue', 'green']);
    expect(answers).toBe(2);
  });

  it('asks for the boroughs again after a failed request', () => {
    let failed = false;
    service.getBoroughs().subscribe({ error: () => failed = true });
    http.expectOne(API_URL + '/boroughs').flush('Down', { status: 500, statusText: 'Server Error' });
    expect(failed).toBeTrue();

    let result: string[] = [];
    service.getBoroughs().subscribe(list => result = list);
    http.expectOne(API_URL + '/boroughs').flush(['Camden']);
    expect(result).toEqual(['Camden']);
  });

  it('getNearby sends the position, radius and limit', () => {
    service.getNearby(51.5, -0.12, 800).subscribe();

    const req = http.expectOne(r => r.url === API_URL + '/plaques/nearby');
    expect(req.request.params.get('lat')).toBe('51.5');
    expect(req.request.params.get('lng')).toBe('-0.12');
    expect(req.request.params.get('radius')).toBe('800');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush([]);
  });
});
