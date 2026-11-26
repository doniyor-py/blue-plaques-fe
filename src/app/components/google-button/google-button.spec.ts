import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleButton } from './google-button';
import { testProviders } from '../../testing/test-providers';
import { ScriptLoader } from '../../services/script-loader';

describe('GoogleButton', () => {
  let component: GoogleButton;
  let fixture: ComponentFixture<GoogleButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleButton],
      providers: [
        ...testProviders,
        { provide: ScriptLoader, useValue: { load: () => new Promise(() => undefined) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
