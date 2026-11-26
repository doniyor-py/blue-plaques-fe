import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footer } from './footer';
import { testProviders } from '../../testing/test-providers';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('should show the links and the map and data credits', () => {
    const footer = fixture.nativeElement as HTMLElement;
    const links = Array.from(footer.querySelectorAll('a')).map(link => link.textContent?.trim());
    expect(links).toEqual(['Browse plaques', 'Map', 'Insights', 'Privacy', 'Terms']);
    expect(footer.textContent).toContain('Plaque data: Open Plaques');
    expect(footer.textContent).toContain('© OpenStreetMap');
  });
});
