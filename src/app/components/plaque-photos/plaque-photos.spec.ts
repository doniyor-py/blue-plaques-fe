import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Dialog } from '@angular/cdk/dialog';

import { PlaquePhotos } from './plaque-photos';
import { testProviders } from '../../testing/test-providers';
import { API_URL } from '../../api';

describe('PlaquePhotos', () => {
  let component: PlaquePhotos;
  let fixture: ComponentFixture<PlaquePhotos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaquePhotos],
      providers: testProviders
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaquePhotos);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('plaqueId', 'p1');
    fixture.detectChanges();
  });

  afterEach(() => TestBed.inject(Dialog).closeAll());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows small thumbnails in the grid and the full photo when one is opened', () => {
    const photos = API_URL + '/photos/';
    TestBed.inject(HttpTestingController).expectOne(API_URL + '/plaques/p1/photos').flush([
      { _id: 'a', url: photos + 'a.webp', thumb_url: photos + 'a-thumb.webp', username: 'user0', uploaded: '2026-11-01' },
      { _id: 'b', url: photos + 'b.jpg', username: 'user0', uploaded: '2026-11-01' }
    ]);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    const grid = [...page.querySelectorAll('.photo-thumb img')].map(img => img.getAttribute('src'));
    expect(grid).toEqual([photos + 'a-thumb.webp', photos + 'b.jpg']);

    const thumb = page.querySelector<HTMLButtonElement>('.photo-thumb')!;
    thumb.focus();
    thumb.click();
    TestBed.tick();
    const viewer = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(viewer.getAttribute('aria-label')).toBe('Photo, full size');
    expect(viewer.querySelector('img')!.getAttribute('src')).toBe(photos + 'a.webp');
    expect(document.activeElement!.id).toBe('photo-close');

    viewer.querySelector<HTMLButtonElement>('#photo-close')!.click();
    TestBed.tick();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(thumb);
  });
});
