import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Plaques } from './plaques';
import { testProviders } from '../../testing/test-providers';

describe('Plaques', () => {
  let component: Plaques;
  let fixture: ComponentFixture<Plaques>;
  let http: HttpTestingController;
  let router: Router;
  const query = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    query.next(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [Plaques],
      providers: [...testProviders, { provide: ActivatedRoute, useValue: { queryParamMap: query } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plaques);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  function answerSearch(total: number, plaques: any[] = []) {
    const requests = http.match(req => req.url.endsWith('/plaques/search'));
    requests[requests.length - 1].flush({ total: total, pages: Math.ceil(total / 12), page: 1, plaques: plaques });
    fixture.detectChanges();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the count, the active filters as chips and the cards', () => {
    query.next(convertToParamMap({ borough: 'Camden', category: 'literature' }));
    answerSearch(128, [{ _id: 'p1', title: 'Charles Dickens blue plaque', people: [] }]);
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('[role="status"]')?.textContent).toContain('128 plaques in Camden · Writers');
    const chips = Array.from(page.querySelectorAll('.chip-removable')).map(chip => chip.textContent?.trim());
    expect(chips).toEqual(['Camden', 'Writers']);
    expect(page.querySelectorAll('app-plaque-card').length).toBe(1);
    expect(page.querySelector('.pager')?.textContent).toContain('Page 1 of 11');
  });

  it('should keep other filters in the URL when a chip is removed', () => {
    component.filters = { borough: 'Camden', category: 'literature', q: 'zzz' };
    component.removeFilter('borough');
    expect(router.navigate).toHaveBeenCalledWith(['/plaques'], { queryParams: { q: 'zzz', category: 'literature' } });
  });

  it('should toggle a category chip on and off', () => {
    component.toggleCategory('music');
    expect(router.navigate).toHaveBeenCalledWith(['/plaques'], { queryParams: { category: 'music' } });
    component.filters = { category: 'music' };
    component.toggleCategory('music');
    expect(router.navigate).toHaveBeenCalledWith(['/plaques'], { queryParams: {} });
  });

  it('should offer to clear the borough when nothing matches', () => {
    query.next(convertToParamMap({ q: 'zzz', borough: 'Camden' }));
    answerSearch(0);
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('.empty-state h3')?.textContent).toContain('No plaques match “zzz” in Camden');
    const button = page.querySelector('.empty-state .btn-main') as HTMLButtonElement;
    expect(button.textContent).toContain('Clear the borough filter');
    button.click();
    expect(router.navigate).toHaveBeenCalledWith(['/plaques'], { queryParams: { q: 'zzz' } });
  });

  it('should count the filters on the phone Filters button', () => {
    component.filters = { q: 'zzz', borough: 'Camden', category: 'literature' };
    expect(component.filterCount()).toBe(2);
  });
});
