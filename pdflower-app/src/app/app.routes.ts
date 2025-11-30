import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products/all'
    },
    {
        path: 'products/:category',
        loadComponent: () => import('./components/product-list/product-list').then(m => m.ProductList)
    }
];
