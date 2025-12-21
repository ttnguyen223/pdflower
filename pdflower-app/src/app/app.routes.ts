import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProductList } from './components/products/product-list/product-list';
import { CartPage} from './components/cart-page/cart-page';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { ProductTable } from './components/admin/product-table/product-table';
import { AdminGuard } from '../app/guards/admin-guard';
import { ProductDetailsPage } from './components/products/product-details-page/product-details-page'; 
import { InfoPictureManager } from './components/admin/info-picture-manager/info-picture-manager';

export const routes: Routes = [
    {
        path: '',
        component: ProductList,
        data: { defaultCategory: 'all' } 
    },
    { path: 'login', component: Login },
    { path: 'register', component: Register},
    { path: 'cart', component: CartPage },
    { path: 'admin', component: ProductTable, canActivate: [AdminGuard] },
    { path: 'admin/info-cards', component: InfoPictureManager, canActivate: [AdminGuard] },
    { path: 'products', component: ProductList },
    { path: 'products/:id', component: ProductDetailsPage }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }