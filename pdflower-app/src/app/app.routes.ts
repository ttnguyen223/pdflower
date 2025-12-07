import { Routes } from '@angular/router';
import { ProductList } from './components/products/product-list/product-list';
import { CartPage} from './components/cart-page/cart-page';

export const routes: Routes = [
    {
        path: '',
        component: ProductList,
        data: { defaultCategory: 'all' } 
    },
    {
        path: 'products/:category',
        loadComponent: () => import('./components/products/product-list/product-list').then(m => m.ProductList)
    },
    // {
    //     path: 'cart', component: CartPage
    // }
];
