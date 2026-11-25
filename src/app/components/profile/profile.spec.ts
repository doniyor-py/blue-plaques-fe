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

    http.expectOne(API_URL + '/users/me/favourites/p2')
      .flush({ error: 'Something went wrong on the server' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(titles()).toEqual(['First', 'Second', 'Third']);
    expect(page.textContent).toContain('Something went wrong on the server');
  });
});
