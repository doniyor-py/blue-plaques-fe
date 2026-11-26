import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { Profile } from './profile';
import { testProviders } from '../../testing/test-providers';
import { API_URL } from '../../api';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the collection headline, borough progress and recent visits', () => {
    http.expectOne(API_URL + '/users/me').flush({ username: 'jane_doe', email: 'jane@example.com', favourites: [],
                                                 created_at: 'Sun, 01 Mar 2026 10:00:00 GMT' });
    http.expectOne(API_URL + '/users/me/stats').flush({ visits: 3, boroughs_visited: 1, avg_rating_given: 4.2 });
    http.expectOne(API_URL + '/users/me/progress').flush([{ borough: 'Camden', visited: 2, total: 412, percent: 0.5 }]);
    http.expectOne(r => r.url === API_URL + '/users/me/visits').flush({ total: 2, page: 1, pages: 1, visits: [
      { visit_id: 'v1', plaque_id: 'p1', title: 'Charles Dickens blue plaque', colour: 'blue', borough: 'Camden',
        date: '2026-10-28', ratings: { history: 5, condition: 4, accessibility: 4 } },
      { visit_id: 'v2', plaque_id: 'p2', title: 'Sydney Smith brown plaque', colour: 'brown', borough: 'Camden',
        date: '2026-10-21' }
    ] });
    http.expectOne(API_URL + '/users/me/favourites').flush([]);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('.avatar')!.textContent).toContain('JD');
    expect(page.textContent).toContain('Member since March 2026');
    expect(page.querySelector('#stats-heading')!.textContent).toContain('2 plaques visited');
    expect(page.querySelector('.borough')!.textContent).toContain('2 of 412 visited');
    expect(page.querySelectorAll('.visit-name')[0].textContent).toContain('Charles Dickens');
    expect(page.textContent).toContain('You rated it 4.3');
    const rate = page.querySelector('.rate-link')!;
    expect(rate.getAttribute('href')).toBe('/plaques/p2?visit=v2&review=1');
    expect(page.textContent).toContain("You haven't saved any plaques yet.");
  });

  it('removes a favourite straight away, and puts it back in the same place if that fails', () => {
    http.expectOne(API_URL + '/users/me').flush({ username: 'user0', email: 'user0@example.com', favourites: [] });
    http.expectOne(API_URL + '/users/me/stats').flush({ visits: 0, boroughs_visited: 0, avg_rating_given: null });
    http.expectOne(API_URL + '/users/me/progress').flush([]);
    http.expectOne(r => r.url === API_URL + '/users/me/visits').flush({ total: 0, page: 1, pages: 0, visits: [] });
    http.expectOne(API_URL + '/users/me/favourites').flush([
      { _id: 'p1', title: 'First', borough: 'Camden' },
      { _id: 'p2', title: 'Second', borough: 'Hackney' },
      { _id: 'p3', title: 'Third', borough: 'Islington' }
    ]);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const titles = () => component.favourites.map(f => f.title);

    page.querySelector<HTMLButtonElement>('button[aria-label="Remove Second from favourites"]')!.click();
    fixture.detectChanges();
    expect(titles()).toEqual(['First', 'Third']);
    expect(page.querySelectorAll('app-plaque-card .heart-button').length).toBe(2);

    http.expectOne(API_URL + '/users/me/favourites/p2')
      .flush({ error: 'Something went wrong on the server' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(titles()).toEqual(['First', 'Second', 'Third']);
    expect(page.textContent).toContain('Something went wrong on the server');
  });
});
