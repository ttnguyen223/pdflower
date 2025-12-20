import { Component, signal, input, computed, inject } from '@angular/core';
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
  protected readonly Math = Math;
  
  public showCart = false; // Thuộc tính điều khiển việc hiển thị nút giỏ hàng

  // --- Pagination Signals ---
  pageIndex = signal(0);
  pageSize = 20;

  // --- Product Data Signals ---
  category = input<string>();
  loading = signal(true);

  productList = toSignal<Product[]>(
    this.productService.getProducts().pipe(
      tap(() => this.loading.set(false)),
      startWith([])
    )
  );

  // --- Filter & Sort Signals ---
  public allCategories$: Observable<string[]> = this.productService.getCategories().pipe(
    map((categories: any[]) => categories.map(c => c.name))
  );
  public allCategoryNames = toSignal(this.allCategories$, { initialValue: [] });
  public selectedCategories = signal<string[]>([]);
  public sortOption = signal<SortOption['value']>('recent');

  public sortOptions: SortOption[] = [
    { value: 'recent', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá: Tăng dần' },
    { value: 'price_desc', label: 'Giá: Giảm dần' },
    { value: 'name_asc', label: 'Tên: A - Z' },
    { value: 'name_desc', label: 'Tên: Z - A' },
  ];

  // Logic lọc và sắp xếp chính
  filteredProducts = computed(() => {
    const allProducts = this.productList() ?? [];
    let result = allProducts.filter(p => p.isActive === true);
    const filters = this.selectedCategories();
    const sort = this.sortOption();

    // 1. Lọc theo danh mục
    if (filters.length > 0) {
        result = result.filter(p => 
            p.categories.some(productCategory => filters.includes(productCategory))
        );
    } 

    // 2. Sắp xếp kết quả
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

  // Signal cuối cùng để hiển thị trên UI (đã phân trang)
  paginatedProducts = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  // --- Methods ---

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
      if (result !== undefined) {
        this.selectedCategories.set(result);
        this.pageIndex.set(0); // Reset về trang đầu khi đổi bộ lọc
      }
    });
  }

  removeFilter(category: string): void {
    this.selectedCategories.update(filters => filters.filter(f => f !== category));
    this.pageIndex.set(0); // Reset về trang đầu khi bỏ bộ lọc
  }

  onSortChange(event: any): void {
    // Lấy giá trị từ MatSelectChange event
    this.sortOption.set(event.value);
    this.pageIndex.set(0); // Reset về trang đầu khi đổi cách sắp xếp
  }

  handlePageEvent(event: any): void {
    this.pageIndex.set(event.pageIndex);
    // Cuộn mượt lên đầu danh sách sản phẩm
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToProductDetails(product: Product): void {
    this.router.navigate(['/products', product.id]); 
  }

  addToCart(item: Product): void {
    this.cartService.addToCart(item);
  }
}