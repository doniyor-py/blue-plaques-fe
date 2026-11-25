import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { testProviders } from './testing/test-providers';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: testProviders
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have a skip link, the navigation bar and a main area', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('a.skip-link')?.textContent).toContain('Skip to main content');
    expect(page.querySelector('app-navigation')).toBeTruthy();
    expect(page.querySelector('main#main-content')).toBeTruthy();
  });
});
