import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { plaqueName, lifeYears, roleLine, plaqueColour } from '../../plaque-text';

@Component({
  selector: 'app-plaque-roundel',
  templateUrl: './plaque-roundel.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './plaque-roundel.css'
})
export class PlaqueRoundel {
  @Input() plaque: any = null;

  name(): string { return plaqueName(this.plaque); }
  years(): string { return lifeYears(this.plaque); }
  role(): string { return roleLine(this.plaque); }
  colour(): string { return plaqueColour(this.plaque); }
}
