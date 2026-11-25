import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nearby } from './nearby';
import { testProviders } from '../../testing/test-providers';

describe('Nearby', () => {
  let component: Nearby;
  let fixture: ComponentFixture<Nearby>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nearby],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nearby);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
