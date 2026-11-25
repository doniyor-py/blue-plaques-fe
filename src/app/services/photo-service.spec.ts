import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { PhotoService } from './photo-service';
import { testProviders } from '../testing/test-providers';
import { API_URL } from '../api';

describe('PhotoService', () => {
  let service: PhotoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(PhotoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uploadPhoto sends the file and the caption as form data', () => {
    const file = new File(['fake image'], 'plaque.jpg', { type: 'image/jpeg' });
    service.uploadPhoto('p1', file, 'Front door').subscribe();

    const req = http.expectOne(API_URL + '/plaques/p1/photos');
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    expect((body.get('photo') as File).name).toBe('plaque.jpg');
    expect(body.get('caption')).toBe('Front door');
    req.flush({});
  });

  it('deletePhoto sends a DELETE for that photo', () => {
    service.deletePhoto('p1', 'f1').subscribe();
    const req = http.expectOne(API_URL + '/plaques/p1/photos/f1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
