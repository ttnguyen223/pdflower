import { Component, signal, input, computed, inject } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { serverTimestamp, Timestamp } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../services/product.service';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  public showCart = false;

  category = input<string>();

  productList = toSignal<Product[]>(
    this.productService.getProducts().pipe(
      startWith([]) // Ensure it starts immediately with an empty array
    )
    // When using startWith(), you don't need the options object { initialValue: [] }
  );

  currentCategory = computed(() => {
    if (this.category()) {
      return this.category()!;
    }
    return this.route.snapshot.data['defaultCategory'] || 'all';
  });


  filteredProducts = computed(() => {
    const category = this.currentCategory().toLowerCase();
    
    // Use the signal value (which is either [] initially, or the fetched data later)
    const allProducts = this.productList() ?? []; 

    if (!category || category === 'all') {
        return allProducts.filter(p => p.isActive == true);
    }
    return allProducts.filter(p =>
      p.categories.some(productCategory =>
          productCategory.toLowerCase() === category.toLowerCase()
      ) && p.isActive === true
    );
  });

  addToCart(item: Product) {
    this.cartService.addToCart(item);
  }
}