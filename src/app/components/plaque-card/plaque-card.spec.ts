import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaqueCard } from './plaque-card';
import { testProviders } from '../../testing/test-providers';

describe('PlaqueCard', () => {
  let fixture: ComponentFixture<PlaqueCard>;

  function render(plaque: any): HTMLElement {
    fixture = TestBed.createComponent(PlaqueCard);
    fixture.componentInstance.plaque = plaque;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaqueCard],
      providers: testProviders
    }).compileComponents();
  });

  it('should show a photo, the details and the rating', () => {
    const card = render({
      _id: 'p1', title: 'Charles Dickens blue plaque', borough: 'Camden', category: 'literature',
      address: '48 Doughty Street, Camden, WC1', people: [{ name: 'Charles Dickens' }],
      photo_thumb: '/thumb.jpg', rating: 4.7, review_count: 1
    });
    expect(card.querySelector('img')?.getAttribute('src')).toBe('/thumb.jpg');
    expect(card.querySelector('.meta')?.textContent).toContain('Camden · Writers');
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/plaques/p1');
    expect(card.querySelector('.street')?.textContent).toContain('48 Doughty Street');
    expect(card.querySelector('.rating')?.textContent).toContain('4.7');
    expect(card.querySelector('.rating')?.textContent).toContain('1 review');
  });

  it('should show a plain tile and "No reviews yet" without photos or ratings', () => {
    const card = render({ _id: 'p2', title: 'Stone plaque', people: [], photo_thumb: null, rating: null, review_count: 0 });
    expect(card.querySelector('img')).toBeNull();
    expect(card.querySelector('.tile')).toBeTruthy();
    expect(card.querySelector('.rating')?.textContent).toContain('No reviews yet');
  });

  it('should leave out the rating line when the list sends no card summary', () => {
    const card = render({ _id: 'p3', title: 'Stone plaque', people: [] });
    expect(card.querySelector('.rating')).toBeNull();
  });
});
