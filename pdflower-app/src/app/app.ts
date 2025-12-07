import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'; // Import Router and RouterOutlet
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../app/services/cart.service';
import { MatBadgeModule } from '@angular/material/badge'; 

@Component({
  selector: 'app-root',
  standalone: true, // Assuming standalone based on imports
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private router = inject(Router);
  public showCart: boolean = false;

  constructor(public cartService: CartService) {}

  openMenu() {
    console.log('Open sidebar menu logic here');
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}