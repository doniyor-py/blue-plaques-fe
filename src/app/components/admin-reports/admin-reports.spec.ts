import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReports } from './admin-reports';
import { testProviders } from '../../testing/test-providers';

describe('AdminReports', () => {
  let component: AdminReports;
  let fixture: ComponentFixture<AdminReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReports],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
