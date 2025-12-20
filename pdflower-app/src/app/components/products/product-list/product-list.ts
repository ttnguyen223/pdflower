import { Component, signal, input, computed, inject, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../services/product.service';
import { startWith, tap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core'; 
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';  
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterDialog, FilterDialogData } from '../../dialogs/filter-dialog/filter-dialog';
import { MatMenuModule } from '@angular/material/menu';
import { DateTimeUtils } from '../../../utilities/date-time-utils';

interface SortOption {
  value: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'recent';
  label: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatOptionModule,
    MatCardModule, MatFormFieldModule, MatSelectModule, MatTooltipModule, FormsModule,
    MatChipsModule, MatProgressSpinnerModule, MatMenuModule
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
  public showCart = false;

  category = input<string>();
  loading = signal(true);

  productList = toSignal<Product[]>(
    this.productService.getProducts().pipe(
      tap(() => this.loading.set(false)),
      startWith([])
    )
  );

  public allCategories$: Observable<string[]> = this.productService.getCategories().pipe(
    map((categories: any[]) => categories.map(c => c.name))
  );
  public allCategoryNames = toSignal(this.allCategories$, { initialValue: [] });
  public selectedCategories = signal<string[]>([]);
  public sortOption = signal<SortOption['value']>('recent'); // Default sort: Most Recent

  public sortOptions: SortOption[] = [
    { value: 'recent', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá: Tăng dần' },
    { value: 'price_desc', label: 'Giá: Giảm dần' },
    { value: 'name_asc', label: 'Tên: A - Z' },
    { value: 'name_desc', label: 'Tên: Z - A' },
  ];

    currentCategory = computed(() => {
    if (this.category()) {
      return this.category()!;
    }
    return this.route.snapshot.data['defaultCategory'] || 'all';
  });

  filteredProducts = computed(() => {
    const allProducts = this.productList() ?? [];
    let result = allProducts.filter(p => p.isActive === true);
    const filters = this.selectedCategories();
    const sort = this.sortOption();

    // 1. Filter by categories (if any selected)
    if (filters.length > 0) {
        result = result.filter(p => 
            p.categories.some(productCategory => filters.includes(productCategory))
        );
    } 
    // Note: The previous logic of routing to a single category input is replaced by the multi-select filter above.

    // 2. Sort the results
    return result.sort((a, b) => {
        switch (sort) {
            case 'price_asc':
                return a.price - b.price || a.name.localeCompare(b.name); // Tie-breaker by name
            case 'price_desc':
                return b.price - a.price || a.name.localeCompare(b.name); // Tie-breaker by name
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

  private getTimestampValue(dateField: any): number {
    if (dateField instanceof Date) {
      return dateField.getTime();
    }
    // Assumes Firestore returns an object with seconds and nanoseconds if not a JS Date
    if (dateField && typeof dateField === 'object' && 'seconds' in dateField) {
      return dateField.seconds * 1000; // Convert seconds to milliseconds
    }
    // Fallback if the format is unexpected
    return new Date(dateField).getTime(); 
  }
  
  openFilterDialog(): void {
    const dialogData: FilterDialogData = {
      allCategories: this.allCategoryNames(),
      selectedCategories: this.selectedCategories()
    };

    const dialogRef = this.dialog.open(FilterDialog, {
      width: '300px',
      data: dialogData,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) this.selectedCategories.set(result);
    });
  }

  removeFilter(category: string): void {
    this.selectedCategories.update(filters => filters.filter(f => f !== category));
  }

  goToProductDetails(product: Product): void {
    // Navigate to the new route using the product ID
    console.log("trigger!")
    this.router.navigate(['/products', product.id]); 
  }

  onCategoryFilterChange(selectedItems: string[]): void {
    this.selectedCategories.set(selectedItems);
  }

  onSortChange(selectedSortValue: SortOption['value']): void {
    this.sortOption.set(selectedSortValue);
  }

  addToCart(item: Product) {
    this.cartService.addToCart(item);
  }
}