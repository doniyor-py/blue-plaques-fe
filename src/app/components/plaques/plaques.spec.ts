import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plaques } from './plaques';
import { testProviders } from '../../testing/test-providers';

describe('Plaques', () => {
  let component: Plaques;
  let fixture: ComponentFixture<Plaques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plaques],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plaques);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
