import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Insights } from './insights';
import { testProviders } from '../../testing/test-providers';

describe('Insights', () => {
  let component: Insights;
  let fixture: ComponentFixture<Insights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Insights],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Insights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
