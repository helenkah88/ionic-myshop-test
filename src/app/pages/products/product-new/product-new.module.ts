import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductNewPageRoutingModule } from './product-new-routing.module';

import { ProductNewPage } from './product-new.page';
import { SharedModule } from '../../../shared/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    ProductNewPageRoutingModule
  ],
  declarations: [ProductNewPage]
})
export class ProductNewPageModule {}
