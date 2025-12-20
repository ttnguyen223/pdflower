import { Component, signal, input, computed, inject, effect } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../services/cart.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../services/product.service';
import { startWith, tap, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core'; 
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';  
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterDialog, FilterDialogData } from '../../dialogs/filter-dialog/filter-dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DateTimeUtils } from '../../../utilities/date-time-utils';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProductListStateService } from '../../../services/product-list-state.service';

interface SortOption {
  value: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'recent';
  label: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatOptionModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatTooltipModule, 
    FormsModule,
    MatChipsModule, 
    MatProgressSpinnerModule, 
    MatMenuModule, 
    MatPaginatorModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private stateService = inject(ProductListStateService);
  
  protected readonly Math = Math;
  public showCart = false; 

  // --- State Persistence ---
  // We point these directly to the service's signals so they persist across navigation
  pageIndex = this.stateService.pageIndex;
  selectedCategories = this.stateService.selectedCategories;
  sortOption = this.stateService.sortOption;
  
  pageSize = 20;

  // --- Product Data Signals ---
  category = input<string>();
  loading = signal(true);

  productList = toSignal<Product[]>(
    this.productService.getProducts().pipe(
      tap(() => {
        this.loading.set(false);
        // After data loads, restore the scroll position
        this.restoreScroll();
      }),
      startWith([])
    )
  );

  // --- Filter & Sort Options ---
  public allCategories$: Observable<string[]> = this.productService.getCategories().pipe(
    map((categories: any[]) => categories.map(c => c.name))
  );
  public allCategoryNames = toSignal(this.allCategories$, { initialValue: [] });

  public sortOptions: SortOption[] = [
    { value: 'recent', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá: Tăng dần' },
    { value: 'price_desc', label: 'Giá: Giảm dần' },
    { value: 'name_asc', label: 'Tên: A - Z' },
    { value: 'name_desc', label: 'Tên: Z - A' },
  ];

  constructor() {
    // Optional: Log state for debugging
    effect(() => {
      console.log('Current Page:', this.pageIndex());
    });
  }

  // Logic lọc và sắp xếp chính
  filteredProducts = computed(() => {
    const allProducts = this.productList() ?? [];
    let result = allProducts.filter(p => p.isActive === true);
    const filters = this.selectedCategories();
    const sort = this.sortOption();

    if (filters.length > 0) {
        result = result.filter(p => 
            p.categories.some(productCategory => filters.includes(productCategory))
        );
    } 

    return result.sort((a, b) => {
        switch (sort) {
            case 'price_asc':
                return a.price - b.price || a.name.localeCompare(b.name);
            case 'price_desc':
                return b.price - a.price || a.name.localeCompare(b.name);
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'recent':
                const dateA = DateTimeUtils.getTimestampValue(a.updateDate || a.insertDate);
                const dateB = DateTimeUtils.getTimestampValue(b.updateDate || b.insertDate);
                return dateB - dateA || a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
  });

  paginatedProducts = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  // --- Methods ---

  private restoreScroll(): void {
    // Delay slightly to ensure the DOM has rendered the paginated products
    setTimeout(() => {
      window.scrollTo({
        top: this.stateService.scrollPosition,
        behavior: 'instant'
      });
    }, 50);
  }

  openFilterDialog(): void {
    const counts: Record<string, number> = {};
    const allItems = this.productList() ?? [];

    allItems.forEach(product => {
      if (product.isActive && product.categories) {
        product.categories.forEach(catName => {
          counts[catName] = (counts[catName] || 0) + 1;
        });
      }
    });

    const dialogData: FilterDialogData = {
      allCategories: this.allCategoryNames(),
      selectedCategories: this.selectedCategories(),
      categoryCounts: counts
    };

    const dialogRef = this.dialog.open(FilterDialog, {
      width: '300px',
      data: dialogData,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.selectedCategories.set(result);
        this.pageIndex.set(0); 
        this.stateService.scrollPosition = 0; // Reset scroll when filter changes
      }
    });
  }

  removeFilter(category: string): void {
    this.selectedCategories.update(filters => filters.filter(f => f !== category));
    this.pageIndex.set(0); 
    this.stateService.scrollPosition = 0;
  }

  onSortChange(event: any): void {
    this.sortOption.set(event.value);
    this.pageIndex.set(0); 
    this.stateService.scrollPosition = 0;
  }

  handlePageEvent(event: any): void {
    this.pageIndex.set(event.pageIndex);
    this.stateService.scrollPosition = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToProductDetails(product: Product): void {
    // Save current scroll position to the service before navigating
    this.stateService.scrollPosition = window.scrollY;
    this.router.navigate(['/products', product.id]); 
  }

  addToCart(item: Product): void {
    this.cartService.addToCart(item);
  }
}
