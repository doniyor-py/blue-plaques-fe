import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.css'
})
export class Footer {
  constructor(private location: Location) {}

  isSlim(): boolean {
    return this.location.path().startsWith('/nearby');
  }
}
