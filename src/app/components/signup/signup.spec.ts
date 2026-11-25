import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signup } from './signup';
import { testProviders } from '../../testing/test-providers';
import { ScriptLoader } from '../../services/script-loader';

describe('Signup', () => {
  let component: Signup;
  let fixture: ComponentFixture<Signup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        ...testProviders,
        // never load the real Google or Cloudflare script in a test: this promise never finishes
        { provide: ScriptLoader, useValue: { load: () => new Promise(() => undefined) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Signup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
