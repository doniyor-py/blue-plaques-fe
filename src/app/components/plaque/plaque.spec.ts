import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plaque } from './plaque';

describe('Plaque', () => {
  let component: Plaque;
  let fixture: ComponentFixture<Plaque>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plaque]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plaque);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
