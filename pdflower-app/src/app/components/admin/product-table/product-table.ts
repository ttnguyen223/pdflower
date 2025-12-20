import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductFormModal } from '../product-form-modal/product-form-modal';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatToolbarModule,
    MatTooltipModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css',
})
export class ProductTable implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  protected readonly Math = Math;

  displayedColumns: string[] = ['imagePreview', 'name', 'price', 'status', 'actions'];
  
  // Data source that manages sorting and pagination
  dataSource = new MatTableDataSource<Product>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.productService.getProducts().subscribe((products) => {
      // Apply initial custom sort before assigning to data source
      this.dataSource.data = this.sortProducts(products);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortData = (data: Product[], sort: MatSort) => {
      const isAsc = sort.direction === 'asc';
      
      if (sort.active === 'imagePreview') {
        return data.sort((a, b) => {
          const dateA = DateTimeUtils.getTimestampValue(a.updateDate || a.insertDate);
          const dateB = DateTimeUtils.getTimestampValue(b.updateDate || b.insertDate);
          return isAsc ? (dateB - dateA) : (dateA - dateB);
        });
      }

      if (!sort.active || sort.direction === '') {
        return this.sortProducts(data);
      }

      return data.sort((a, b) => {
        switch (sort.active) {
          case 'name': return this.compare(a.name, b.name, isAsc);
          case 'price': return this.compare(a.price, b.price, isAsc);
          case 'status': return this.compare(a.isActive ? 1 : 0, b.isActive ? 1 : 0, isAsc);
          default: return 0;
        }
      });
    };
  }

  /**
   * Default sorting logic: Newest first, then alphabetical by name
   */
  private sortProducts(products: Product[]): Product[] {
    return products.slice().sort((a, b) => {
      const dateA = DateTimeUtils.getTimestampValue(a.updateDate || a.insertDate);
      const dateB = DateTimeUtils.getTimestampValue(b.updateDate || b.insertDate);
      return dateB - dateA || a.name.localeCompare(b.name);
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  openProductModal(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormModal, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      data: product,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Data source will automatically update if the service emits new values
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

   goToPage(index: number): void {
    if (this.paginator) {
      this.paginator.pageIndex = index;
      // Trigger a page event manually so the data source updates the view
      this.paginator.page.emit({
        pageIndex: index,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length
      });
    }
  }

  private showErrorMessage(title: string, message: string): void {
    this.dialog.open(MessageDialog, {
      data: { title, message }
    });
  }
}
