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
import { DateTimeUtils } from '../../../utilities/date-time-utils';
import { ConfirmationDialog } from '../../dialogs/confirmation-dialog/confirmation-dialog';
import { MessageDialog } from '../../dialogs/message-dialog/message-dialog';
import { take } from 'rxjs/operators';

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
  displayedColumns: string[] = ['imagePreview', 'name', 'price', 'status', 'actions'];
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
      const dateA = DateTimeUtils.getTimestampValue(a.updateDate || a.insertDate);
      const dateB = DateTimeUtils.getTimestampValue(b.updateDate || b.insertDate);
      return dateB - dateA || a.name.localeCompare(b.name);
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
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '350px',
      data: { 
        message: 'Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.' 
      },
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result === true) {
        this.productService.deleteProduct(id).catch((err) => {
          console.error('Error deleting product:', err);
          this.showErrorMessage(
            'Lỗi xóa sản phẩm', 
            'Không thể xóa sản phẩm. Vui lòng kiểm tra lại hoặc thử lại sau.'
          );
        });
      }
    });
  }

  toggleActiveStatus(product: Product): void {
    this.productService.toggleProductActivity(product).catch((err) => {
      console.error('Error toggling status:', err);
      this.showErrorMessage('Lỗi cập nhật trạng thái', 'Không thể thay đổi trạng thái sản phẩm lúc này.');
    });
  }

  private showErrorMessage(title: string, message: string): void {
  this.dialog.open(MessageDialog, {
    data: {
      title: title,
      message: message
    }
  });
}
}
