import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { InfoPictureService } from '../../../services/info-picture.service'; // New
import { Product } from '../../../models/product.model';
import { Observable, switchMap, tap, of, finalize, combineLatest, map } from 'rxjs'; // Updated
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Location } from '@angular/common';

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
  private infoService = inject(InfoPictureService); // New
  private location = inject(Location);

  product$: Observable<Product | undefined> | undefined;
  mainImage = signal<string | undefined>(undefined);
  loading = signal(true);

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      tap(() => this.loading.set(true)),
      switchMap((params) => {
        const id = params.get('id');
        if (!id) return of(undefined);

        // Fetch product and info cards concurrently
        return combineLatest([
          this.productService.getProductById(id),
          this.infoService.getActiveInfoCards()
        ]).pipe(
          map(([product, infoCardUrls]) => {
            if (product) {
              // Combine main image + gallery + info cards
              const combinedImages = [
                product.mainImageUrl,
                ...(product.imageUrls || []),
                ...infoCardUrls
              ].filter(url => !!url); // Remove any empty/null strings

              // Update the product object in the stream with the merged array
              // so the HTML template receives the combined list via product.imageUrls
              product.imageUrls = [...new Set(combinedImages)];
              
              if (!this.mainImage() && product.mainImageUrl) {
                this.mainImage.set(product.mainImageUrl);
              }
            }
            return product;
          })
        );
      }),
      finalize(() => this.loading.set(false))
    );
  }

  goBack(): void {
    this.location.back();
  }

  setMainImage(imageUrl: string): void {
    this.mainImage.set(imageUrl);
  }

  // Accepts the array from the template, which now contains combined images
  nextImage(urls: string[]): void {
    if (!urls || urls.length === 0) return;
    const current = this.mainImage() || urls[0];
    const idx = urls.indexOf(current);
    this.setMainImage(urls[(idx + 1) % urls.length]);
  }

  prevImage(urls: string[]): void {
    if (!urls || urls.length === 0) return;
    const current = this.mainImage() || urls[0];
    const idx = urls.indexOf(current);
    this.setMainImage(urls[(idx - 1 + urls.length) % urls.length]);
  }
}
