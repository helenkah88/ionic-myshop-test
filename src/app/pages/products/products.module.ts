import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductsPageRoutingModule } from './products-routing.module';

import { ProductsPage } from './products.page';
import { ProductModalComponent } from 'src/app/components/product-modal/product-modal.component';
import { SharedModule } from '../../shared/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    ProductsPageRoutingModule
  ],
  declarations: [
    ProductsPage,
    ProductModalComponent,
  ]
})
export class ProductsPageModule {}
