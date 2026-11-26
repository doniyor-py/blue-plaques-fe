import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navigation } from './navigation';
import { testProviders } from '../../testing/test-providers';

describe('Navigation', () => {
  let component: Navigation;
  let fixture: ComponentFixture<Navigation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navigation],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navigation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show guests Log in, Sign up and a members-only Insights link', () => {
    const nav = fixture.nativeElement as HTMLElement;
    expect(nav.textContent).toContain('Log in');
    expect(nav.querySelector('a.btn-primary')?.textContent).toContain('Sign up');
    expect(nav.querySelector('a[href="/insights"]')?.textContent).toContain('(members only)');
  });

  it('should make initials from the username', () => {
    spyOn(component.authService, 'getUsername').and.returnValue('jane_doe');
    expect(component.initials()).toBe('JD');
    (component.authService.getUsername as jasmine.Spy).and.returnValue('u0');
    expect(component.initials()).toBe('U0');
  });

  it('should open and close the phone menu', () => {
    const toggler = (fixture.nativeElement as HTMLElement).querySelector('.navbar-toggler') as HTMLButtonElement;
    toggler.click();
    fixture.detectChanges();
    expect(toggler.getAttribute('aria-expanded')).toBe('true');
    toggler.click();
    fixture.detectChanges();
    expect(toggler.getAttribute('aria-expanded')).toBe('false');
  });
});
