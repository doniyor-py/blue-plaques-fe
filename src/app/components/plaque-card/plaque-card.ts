import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { plaqueName, street, categoryLabel, averageRating, reviewCount } from '../../plaque-text';

@Component({
  selector: 'app-plaque-card',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './plaque-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plaque-card.css'
})
export class PlaqueCard {
  @Input({ required: true }) plaque!: any;

  photo(): string | null {
    const first = this.plaque.photos?.[0];
    return first ? first.thumb_url || first.url : null;
  }

  meta(): string {
    return [this.plaque.borough, categoryLabel(this.plaque)].filter(part => part).join(' · ');
  }

  name(): string { return plaqueName(this.plaque); }
  street(): string { return street(this.plaque); }
  rating(): number | null { return averageRating(this.plaque); }
  reviews(): number { return reviewCount(this.plaque); }
}
