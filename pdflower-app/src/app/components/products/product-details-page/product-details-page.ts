import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, CurrencyPipe, MatProgressSpinnerModule],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.css',
})

export class ProductDetailsPage implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  
  // Angular binds route parameters to @Input properties automatically in standalone components
  @Input() id!: string; 

  product = signal<Product | undefined>(undefined);
  currentImageIndex = signal(0);

  ngOnInit(): void {
  if (this.id) {
    this.productService.getProductById(this.id).subscribe({
      next: (p) => {
        this.product.set(p);
      },
      error: (err) => {
        console.error('Error fetching product details:', err);
        // Optionally redirect to a 404 page or display an error message
        this.router.navigate(['/products']); 
      }
    });
  } else {
    console.error('Product ID is missing from route parameters.');
    this.router.navigate(['/products']);
  }
}

  nextImage(): void {
    const product = this.product();
    if (product && this.currentImageIndex() < product.imageUrls.length - 1) {
      this.currentImageIndex.update(i => i + 1);
    } else {
      this.currentImageIndex.set(0);
    }
  }

  prevImage(): void {
    const product = this.product();
    if (product && this.currentImageIndex() > 0) {
      this.currentImageIndex.update(i => i - 1);
    } else {
      this.currentImageIndex.set(product ? product.imageUrls.length - 1 : 0);
    }
  }

  goBackToProducts(): void {
    this.router.navigate(['/products']);
  }
}
