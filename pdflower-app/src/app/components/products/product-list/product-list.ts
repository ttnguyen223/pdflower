import { Component, signal, input, computed, inject } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../../services/cart.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  category = input<string>();

  productList = signal<Product[]>([
    {
      id: 1,
      name: 'Bó hoa đặc biệt',
      description: 'Bó hoa đặc biệt.',
      mainImageUrl: 'assets/flowers/colorful_flowers.jpg',
      imageUrls: [],
      price: 150000,
      quantity: 1,
      isActive: true,
      categories: ['Indoor Plants'],
      insertDate: new Date('2025-01-15T10:00:00Z'),
      updateDate: new Date('2025-10-20T14:30:00Z'),
    },
    {
      id: 2,
      name: 'Bó hoa hồng đỏ',
      description: 'Bó hoa hồng đỏ.',
      mainImageUrl: 'assets/flowers/red_flowers.jpg',
      imageUrls: [],
      price: 120000,
      quantity: 1,
      isActive: true,
      categories: ['Pots & Accessories'],
      insertDate: new Date('2025-02-01T11:45:00Z'),
      updateDate: new Date('2025-11-25T09:15:00Z'),
    },
    {
      id: 3,
      name: 'Bó hoa trắng',
      description: 'Bó hoa trắng.',
      mainImageUrl: 'assets/flowers/white_flowers.jpg',
      imageUrls: [],
      price: 200000,
      quantity: 1,
      isActive: true,
      categories: ['Gardening Kits'],
      insertDate: new Date('2025-03-10T09:00:00Z'),
      updateDate: new Date('2025-03-10T09:00:00Z'),
    },
    {
      id: 4,
      name: 'Bó hoa màu tím',
      description: 'Bó hoa màu tím.',
      mainImageUrl: 'assets/flowers/purple_flowers.jpg',
      imageUrls: [],
      price: 200000,
      quantity: 30,
      isActive: true,
      categories: ['Home Decor'],
      insertDate: new Date('2025-04-05T16:20:00Z'),
      updateDate: new Date('2025-04-05T16:20:00Z'),
    },
  ]);

  currentCategory = computed(() => {
    if (this.category()) {
      return this.category()!;
    }
    return this.route.snapshot.data['defaultCategory'] || 'all';
  });


  filteredProducts = computed(() => {
    const category = this.currentCategory().toLowerCase();

    if (!category || category === 'all') {
        return this.productList().filter(p => p.isActive == true);
    }
    return this.productList().filter(p =>
      p.categories.some(productCategory =>
          productCategory.toLowerCase() === category.toLowerCase()
      ) && p.isActive === true
    );
  });

  addToCart(item: Product) {
    this.cartService.addToCart(item);
  }
}