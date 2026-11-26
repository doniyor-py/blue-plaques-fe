import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { PlaqueService } from '../../services/plaque-service';
import { AuthService } from '../../services/auth-service';
import { PlaqueCard } from '../plaque-card/plaque-card';
import { plaqueName, lifeYears, roleLine, street } from '../../plaque-text';

const FEATURED_INSCRIPTION = 'Charles Dickens 1812-1870 novelist lived here';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe, PlaqueCard],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.css'
})
export class Home implements OnInit {
  @ViewChild('roundel') roundel?: ElementRef<HTMLElement>;

  randomPlaque: any = null;
  loading: boolean = false;
  announcement: string = '';

  total: number | null = null;
  boroughCount: number | null = null;

  cards: any[] = [];
  cardsLoading: boolean = true;
  cardsError: string = '';

  chips = [
    { label: 'Writers', category: 'literature',
      icon: 'M3 13l1.5-5L10 2.5 13.5 6 8 11.5zM3 13l3.5-3.5' },
    { label: 'Scientists', category: 'science-medicine',
      icon: 'M6 2h4M7 2v4.5L3.2 12.6A1 1 0 0 0 4 14h8a1 1 0 0 0 .8-1.4L9 6.5V2' },
    { label: 'Musicians', category: 'music',
      icon: 'M6 12V3.5l7-1.5v8.5M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM13 10.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z' },
    { label: 'Politicians', category: 'politics-military',
      icon: 'M2 6l6-4 6 4zM3.5 7v5M6.5 7v5M9.5 7v5M12.5 7v5M2 14h12' },
    { label: 'Artists', category: 'art-design',
      icon: 'M8 2a6 6 0 1 0 0 12c1 0 1.4-.8.9-1.5-.6-.8 0-1.8 1-1.8H12a2 2 0 0 0 2-2A6 6 0 0 0 8 2z' }
  ];

  constructor(private plaqueService: PlaqueService,
              public authService: AuthService) {}

  ngOnInit() {
    this.loadCards();
    this.plaqueService.getBoroughs().subscribe({ next: (list) => this.boroughCount = list.length });
    this.plaqueService.searchPlaques({ q: FEATURED_INSCRIPTION }, 1, 1).subscribe({
      next: (response) => this.randomPlaque = this.randomPlaque || response.plaques[0] || null
    });
  }

  loadCards() {
    this.cardsLoading = true;
    this.cardsError = '';
    this.plaqueService.getPlaques(1, 4).subscribe({
      next: (response) => {
        this.cards = response.plaques;
        this.total = response.total;
        this.cardsLoading = false;
      },
      error: () => {
        this.cardsError = 'Could not load the plaques. Please try again.';
        this.cardsLoading = false;
      }
    });
  }

  surpriseMe() {
    this.loading = true;
    this.plaqueService.getRandomPlaque().subscribe({
      next: (response) => {
        this.randomPlaque = response;
        this.loading = false;
        this.announcement = 'Showing ' + plaqueName(response);
        // on phones the roundel sits below the buttons
        this.roundel?.nativeElement.scrollIntoView({ block: 'nearest' });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  name(plaque: any): string { return plaqueName(plaque); }
  years(plaque: any): string { return lifeYears(plaque); }
  role(plaque: any): string { return roleLine(plaque); }

  place(plaque: any): string {
    const where = [street(plaque), plaque.borough].filter(part => part).join(', ');
    return plaque.erected_year ? `${where} · Erected ${plaque.erected_year}` : where;
  }
}
