import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductNewPage } from './product-new.page';

const routes: Routes = [
  {
    path: '',
    component: ProductNewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductNewPageRoutingModule {}
