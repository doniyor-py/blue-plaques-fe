import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plaque } from './plaque';
import { testProviders } from '../../testing/test-providers';

describe('Plaque', () => {
  let component: Plaque;
  let fixture: ComponentFixture<Plaque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plaque],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plaque);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
