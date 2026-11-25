import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Terms } from './terms';
import { testProviders } from '../../testing/test-providers';

describe('Terms', () => {
  let component: Terms;
  let fixture: ComponentFixture<Terms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terms],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Terms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
