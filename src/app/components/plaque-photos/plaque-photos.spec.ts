import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaquePhotos } from './plaque-photos';
import { testProviders } from '../../testing/test-providers';

describe('PlaquePhotos', () => {
  let component: PlaquePhotos;
  let fixture: ComponentFixture<PlaquePhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaquePhotos],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaquePhotos);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('plaqueId', 'p1');     // the parent page normally gives this
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
