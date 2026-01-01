import { Component, signal, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sticky-panel',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule],
  templateUrl: './sticky-panel.html',
  styleUrl: './sticky-panel.css'
})
export class StickyPanelComponent {
  private router = inject(Router);
  isVisible = signal(false);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects;
      this.isVisible.set(currentUrl.startsWith('/products') || currentUrl == '/' || currentUrl.startsWith('/contact-us'));
    });
  }
}