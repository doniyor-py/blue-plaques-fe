import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Privacy } from './privacy';
import { testProviders } from '../../testing/test-providers';

describe('Privacy', () => {
  let component: Privacy;
  let fixture: ComponentFixture<Privacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Privacy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
