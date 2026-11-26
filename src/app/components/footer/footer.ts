import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.css'
})
export class Footer {
  constructor(private router: Router) {}

  // the map page keeps a one-line footer so the map can fill the screen
  isSlim(): boolean {
    return this.router.url.startsWith('/nearby');
  }
}
