import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  async canActivate(): Promise<boolean | UrlTree> {
    const isAdmin = await this.authService.isAdmin();
    
    if (isAdmin) {
      return true;
    } else {
      return this.router.createUrlTree(['/']); 
    }
  }
}