import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, Event as RouterEvent } from '@angular/router'; // Import Router and RouterOutlet
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CartService } from '../app/services/cart.service';
import { MatBadgeModule } from '@angular/material/badge';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AuthService } from '../app/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { firstValueFrom } from 'rxjs';
import { MessageDialog, MessageDialogData } from '../app/components/dialogs/message-dialog/message-dialog'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StickyPanelComponent } from './components/contact/sticky-panel/sticky-panel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    CommonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    StickyPanelComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  public showCart: boolean = false;
  public user$: Observable<User | null>;
  public isAdmin$: Observable<boolean>;
  public loading = false;

  constructor(public cartService: CartService) {
    this.user$ = this.authService.user$;
    this.isAdmin$ = this.authService.isAdmin$;
    

    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.loading = true; // Start loading indicator
      } else if (event instanceof NavigationEnd || event instanceof NavigationError || event instanceof NavigationCancel) {
        this.loading = false; // Hide loading indicator
      }
    });
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/']); // Redirect home after logout
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Use the MessageDialogComponent to show the error elegantly
      const dialogData: MessageDialogData = {
        title: 'Logout Failed',
        message: 'There was a problem signing you out. Please try closing your browser and logging in again.'
      };
      
      this.dialog.open(MessageDialog, {
        data: dialogData
      });
    }
  }
  // async goToAccount() {
  //   const user = await firstValueFrom(this.user$);

  //   if (user) {
  //     this.router.navigate(['/admin'])
  //   } else {
  //     this.router.navigate(['/login']);
  //   }
  // }

  openMenu() {
    console.log('Open sidebar menu logic here');
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}
