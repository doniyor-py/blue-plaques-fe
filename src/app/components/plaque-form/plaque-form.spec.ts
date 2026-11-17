import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaqueForm } from './plaque-form';

describe('PlaqueForm', () => {
  let component: PlaqueForm;
  let fixture: ComponentFixture<PlaqueForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaqueForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaqueForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
