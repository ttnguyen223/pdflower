import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductFormModal } from '../product-form-modal/product-form-modal';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css',
})
export class ProductTable implements OnInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);

  // Define columns for the table
  displayedColumns: string[] = ['imagePreview', 'name', 'price', 'quantity', 'status', 'actions'];
  products$!: Observable<Product[]>;

  ngOnInit(): void {
    this.products$ = this.productService.getProducts().pipe(
      // Use the map operator to sort the array emitted by the observable
      map(products => this.sortProducts(products))
    );
  }

  private sortProducts(products: Product[]): Product[] {
    // We create a copy with slice() before sorting to maintain immutability 
    // and avoid potential side effects if the original array reference is used elsewhere.
    return products.slice().sort((a, b) => {
      // Determine which date to use for comparison for product A and B
      const dateA = a.updateDate || a.insertDate;
      const dateB = b.updateDate || b.insertDate;

      // Handle cases where dates might be missing entirely (though unlikely if required fields)
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // Put b before a if a has no date
      if (!dateB) return -1; // Put a before b if b has no date

      // Convert dates to numbers for easy comparison (timestamp)
      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();

      // Sort in descending order (newest first)
      // If timeB > timeA, returns a positive number, putting b before a.
      return timeB - timeA; 
    });
  }

  openProductModal(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormModal, {
      // Use dynamic units to take up most of the screen space
      width: '90vw',
      maxWidth: '1200px', // Optional: Set a max physical width for large monitors
      height: '90vh',
      maxHeight: '800px', // Optional: Set a max physical height

      // Pass existing product data for editing, or undefined for new
      data: product,

      // Optional: Prevents users from closing the dialog by clicking outside of it
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle result, perhaps refresh your product table data
        // Example: this.productService.refreshProducts();
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.productService.deleteProduct(id).catch((err) => {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Check console for details.');
      });
    }
  }

  toggleActiveStatus(product: Product): void {
    this.productService.toggleProductActivity(product).catch((err) => {
      console.error('Error toggling status:', err);
      alert('Failed to change product status.');
    });
  }
}
