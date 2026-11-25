import { TestBed } from '@angular/core/testing';

import { PlaqueService } from './plaque-service';
import { testProviders } from '../testing/test-providers';

describe('PlaqueService', () => {
  let service: PlaqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(PlaqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
