import { TestBed } from '@angular/core/testing';

import { PlaqueService } from './plaque-service';

describe('PlaqueService', () => {
  let service: PlaqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
