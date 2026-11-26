import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { Navigation } from './components/navigation/navigation';
import { Footer } from './components/footer/footer';
import { Toast } from './components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, Footer, Toast],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css'
})
export class App {
  constructor(private location: Location) {}


  isMapPage(): boolean {
    return this.location.path().startsWith('/nearby');
  }

  skipToMain(event: Event) {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }
}
