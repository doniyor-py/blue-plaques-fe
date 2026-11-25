import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from './components/navigation/navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css'
})
export class App {
  // move the keyboard focus to <main> ourselves
  skipToMain(event: Event) {
    event.preventDefault();
    document.getElementById('main-content')?.focus();
  }
}
