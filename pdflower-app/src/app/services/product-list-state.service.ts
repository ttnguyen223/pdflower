import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductListStateService {
  // 1. Store the current page (e.g., Page 1, 2, etc.)
  pageIndex = signal(0);

  // 2. Store the vertical scroll distance in pixels
  scrollPosition = 0;

  // 3. Store the active filters (Categories)
  selectedCategories = signal<string[]>([]);

  // 4. Store the active sort method (e.g., 'recent', 'price_asc')
  // We initialize it to 'recent' to match your component's default
  sortOption = signal<'recent' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'>('recent');

  /**
   * Reset the state to defaults (optional helper method)
   */
  resetState(): void {
    this.pageIndex.set(0);
    this.scrollPosition = 0;
    this.selectedCategories.set([]);
    this.sortOption.set('recent');
  }
}
