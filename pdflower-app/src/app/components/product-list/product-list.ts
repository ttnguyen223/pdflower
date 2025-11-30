import { Component, signal, input, computed } from '@angular/core';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  category = input<string>('all');
  productList = signal<Product[]>([
    {
      id: 1,
      name: 'Bó hoa đặc biệt',
      description: 'Bó hoa đặc biệt.',
      imageUrl: 'assets/flowers/colorful_flowers.jpg',
      price: 150000,
      quantity: 1,
      isActive: true,
      category: 'Indoor Plants',
      insertDate: new Date('2025-01-15T10:00:00Z'),
      updateDate: new Date('2025-10-20T14:30:00Z'),
    },
    {
      id: 2,
      name: 'Bó hoa hồng đỏ',
      description: 'Bó hoa hồng đỏ.',
      imageUrl: 'assets/flowers/red_flowers.jpg',
      price: 120000,
      quantity: 1,
      isActive: true,
      category: 'Pots & Accessories',
      insertDate: new Date('2025-02-01T11:45:00Z'),
      updateDate: new Date('2025-11-25T09:15:00Z'),
    },
    {
      id: 3,
      name: 'Bó hoa trắng',
      description: 'Bó hoa trắng.',
      imageUrl: 'assets/flowers/white_flowers.jpg',
      price: 200000,
      quantity: 1,
      isActive: true,
      category: 'Gardening Kits',
      insertDate: new Date('2025-03-10T09:00:00Z'),
      updateDate: new Date('2025-03-10T09:00:00Z'),
    },
    {
      id: 4,
      name: 'Bó hoa màu tím',
      description: 'Bó hoa màu tím.',
      imageUrl: 'assets/flowers/purple_flowers.jpg',
      price: 200000,
      quantity: 30,
      isActive: true,
      category: 'Home Decor',
      insertDate: new Date('2025-04-05T16:20:00Z'),
      updateDate: new Date('2025-04-05T16:20:00Z'),
    },
  ]);

  filteredProducts = computed(() => {
    if (!this.category() || this.category().toLowerCase() === 'all') {
        return this.productList().filter(p => p.isActive == true);
    }
    return this.productList().filter(p => p.category.toLowerCase() === this.category().toLowerCase() && p.isActive == true);
  });

  addToCart(item: any) {
    alert(item.name + ' added to cart!');
  }
}
