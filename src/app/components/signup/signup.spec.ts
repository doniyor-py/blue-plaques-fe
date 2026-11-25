import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Signup } from './signup';
import { testProviders } from '../../testing/test-providers';
import { ScriptLoader } from '../../services/script-loader';
import { API_URL } from '../../api';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;
  let http: HttpTestingController;
  let page: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        ...testProviders,
        { provide: ScriptLoader, useValue: { load: () => new Promise(() => undefined) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http = TestBed.inject(HttpTestingController);
    page = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => http.verify());

  function type(selector: string, value: string) {
    const input = page.querySelector(selector) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function fillIn(password: string, repeat: string) {
    type('#email', 'new@example.com');
    type('#username', 'newuser');
    type('#password', password);
    type('#confirm_password', repeat);
    (page.querySelector('#accept_terms') as HTMLInputElement).click();
  }

  function submit() {
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an error and sends nothing when the two passwords differ', () => {
    fillIn('teapot river lantern', 'teapot river lanturn');
    submit();
    expect(page.textContent).toContain("The two passwords don't match.");
    http.expectNone(API_URL + '/register');
  });

  it('asks for the human check before sending anything', () => {
    fillIn('teapot river lantern', 'teapot river lantern');
    submit();
    expect(page.querySelector('[role=alert]')!.textContent).toContain('Please complete the human check.');
    http.expectNone(API_URL + '/register');
  });

  it('sends the sign-up once the human check is done, then asks for the code', () => {
    fillIn('teapot river lantern', 'teapot river lantern');
    component.captchaToken = 'passed';
    submit();

    const req = http.expectOne(API_URL + '/register');
    expect((req.request.body as FormData).get('accept_terms')).toBe('true');
    req.flush({ message: 'Code sent' });
    fixture.detectChanges();

    expect(page.querySelector('#code')).toBeTruthy();
    expect(page.textContent).toContain('We have emailed a 6-digit code to new@example.com');
  });
});
