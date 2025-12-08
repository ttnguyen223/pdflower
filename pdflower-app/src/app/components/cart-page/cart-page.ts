import { Component, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe, Location } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { ConfirmationDialog } from '../dialogs/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, CurrencyPipe, DecimalPipe],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css',
})
export class CartPage {
  private cartService = inject(CartService);
  private location = inject(Location);
  private dialog = inject(MatDialog);

  cartItems = this.cartService.cartItems;
  totalCount = this.cartService.cartItemCount;

  totalPrice = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.price * item.quantity, 0);
  });

  goBack() {
    this.location.back();
  }

  clearCart() {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '350px',
      data: { message: 'Are you sure you want to clear all items from your cart?' },
    });
    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result === true) {
        this.cartService.clearCart(); 
      }
    });
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId);
  }
}
