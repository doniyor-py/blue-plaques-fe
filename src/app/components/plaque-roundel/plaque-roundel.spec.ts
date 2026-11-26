import { TestBed } from '@angular/core/testing';

import { PlaqueRoundel } from './plaque-roundel';

describe('PlaqueRoundel', () => {
  it('should show the name, years and role in the plaque colour', () => {
    const fixture = TestBed.createComponent(PlaqueRoundel);
    fixture.componentInstance.plaque = {
      colour: 'brown', inscription: 'Sydney Smith 1771-1845 author and wit lived here',
      people: [{ name: 'Sydney Smith', born: 1771, died: 1845 }]
    };
    fixture.detectChanges();
    const roundel = fixture.nativeElement as HTMLElement;
    expect(roundel.querySelector('.roundel-name')?.textContent).toContain('Sydney Smith');
    expect(roundel.querySelector('.roundel-years')?.textContent).toContain('1771–1845');
    expect(roundel.querySelector('.roundel-role')?.textContent).toContain('author and wit lived here');
    expect((roundel.querySelector('.big-roundel') as HTMLElement).style.getPropertyValue('--disc')).toBe('var(--marker-brown)');
  });

  it('should be an empty disc while there is no plaque', () => {
    const fixture = TestBed.createComponent(PlaqueRoundel);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.roundel-name')).toBeNull();
  });
});
