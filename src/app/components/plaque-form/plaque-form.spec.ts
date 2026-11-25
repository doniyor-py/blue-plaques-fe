import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaqueForm } from './plaque-form';
import { testProviders } from '../../testing/test-providers';

describe('PlaqueForm', () => {
  let component: PlaqueForm;
  let fixture: ComponentFixture<PlaqueForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaqueForm],
      providers: testProviders
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
