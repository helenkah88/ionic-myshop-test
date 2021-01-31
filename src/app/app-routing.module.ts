import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    canActivate: [AuthGuard],
    component: TabsComponent,
    children: [
      {
        path: 'categories',
        children: [
          {
            path: '',
            loadChildren: () => import('./pages/categories/categories.module').then( m => m.CategoriesPageModule)
          },
          {
            path: ':categoryId/products',
            children: [
              {
                path: '',
                loadChildren: () => import('./pages/products/products.module').then( m => m.ProductsPageModule)
              },
              {
                path: 'new',
                loadChildren: () => import('./pages/products/product-new/product-new.module').then( m => m.ProductNewPageModule)
              },
              {
                path: ':productId',
                loadChildren: () => import('./pages/products/product-details/product-details.module').then( m => m.ProductDetailsPageModule)
              }
            ]
          },
        ]
      },
      {
        path: 'new',
        loadChildren: () => import('./pages/products/product-new/product-new.module').then( m => m.ProductNewPageModule)
      },
      {
        path: '',
        redirectTo: '/categories',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'map',
    loadChildren: () => import('./pages/map/map.module').then( m => m.MapPageModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
