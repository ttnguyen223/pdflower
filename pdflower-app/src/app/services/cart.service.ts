import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private _cartItems = signal<Product[]>([]);

  public readonly cartItems = this._cartItems.asReadonly(); 

  cartItemCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  addToCart(product: Product) {
    this._cartItems.update(currentItems => {
      const updatedItems = [...currentItems]; 
      const existingItem = updatedItems.find(i => i.id === product.id);

      if (existingItem) {
        existingItem.quantity++;
      } else {
        updatedItems.push({ ...product, quantity: 1 });
      }
      return updatedItems; 
    });
  }
  
  clearCart() {
    this._cartItems.set([]); 
  }

  removeItem(productId: string) {
    this._cartItems.update(items => items.filter(item => item.id !== productId));
  }
}