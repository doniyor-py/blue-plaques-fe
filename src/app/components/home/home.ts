import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { PlaqueService } from '../../services/plaque-service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SlicePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  randomPlaque: any = null;
  loading: boolean = false;

  constructor(private plaqueService: PlaqueService) {}

  surpriseMe() {
    this.loading = true;
    this.plaqueService.getRandomPlaque().subscribe({
      next: (response) => {
        this.randomPlaque = response;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
