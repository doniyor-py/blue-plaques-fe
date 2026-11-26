import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { plaqueName, street, categoryLabel } from '../../plaque-text';

@Component({
  selector: 'app-plaque-card',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './plaque-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plaque-card.css'
})
export class PlaqueCard {
  @Input({ required: true }) plaque!: any;
  @Input() saved: boolean = false;
  @Output() unsave = new EventEmitter<void>();

  // small card summary: photo_thumb, rating and review_count
  photo(): string | null {
    return this.plaque.photo_thumb || null;
  }

  meta(): string {
    return [this.plaque.borough, categoryLabel(this.plaque)].filter(part => part).join(' · ');
  }

  name(): string { return plaqueName(this.plaque); }
  street(): string { return street(this.plaque); }
  rating(): number | null { return this.plaque.rating ?? null; }
  reviews(): number { return this.plaque.review_count ?? 0; }
}
