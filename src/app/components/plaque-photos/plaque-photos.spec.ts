import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaquePhotos } from './plaque-photos';

describe('PlaquePhotos', () => {
  let component: PlaquePhotos;
  let fixture: ComponentFixture<PlaquePhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaquePhotos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaquePhotos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
