import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Observable, switchMap, tap, of, finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-product-details-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CurrencyPipe,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './product-details-page.html',
  styleUrl: './product-details-page.css',
})
export class ProductDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);

  product$: Observable<Product | undefined> | undefined;
  mainImage = signal<string | undefined>(undefined);
  loading = signal(true);

  ngOnInit(): void {
    // Read the 'id' parameter from the route and use switchMap to fetch the product
    this.product$ = this.route.paramMap.pipe(
      tap(() => this.loading.set(true)), // Start loading
      switchMap((params) => {
        const id = params.get('id');
        if (id) {
          return this.productService.getProductById(id);
        } else {
          return of(undefined);
        }
      }),
      tap((product) => {
        if (product && product.mainImageUrl) {
          this.mainImage.set(product.mainImageUrl);
        }
      }),
      finalize(() => this.loading.set(false)) // Stop loading when observable completes (emits or errors)
    );
  }

  goBack(): void {
    this.router.navigate(['/products']); // Navigate back to the product list route
  }

  setMainImage(imageUrl: string): void {
    this.mainImage.set(imageUrl);
  }

  nextImage(urls: string[]): void {
    const current = this.mainImage() || urls[0];
    const idx = urls.indexOf(current);
    this.setMainImage(urls[(idx + 1) % urls.length]);
  }

  prevImage(urls: string[]): void {
    const current = this.mainImage() || urls[0];
    const idx = urls.indexOf(current);
    this.setMainImage(urls[(idx - 1 + urls.length) % urls.length]);
  }
}
