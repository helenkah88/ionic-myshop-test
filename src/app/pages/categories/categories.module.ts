import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriesPageRoutingModule } from './categories-routing.module';

import { CategoriesPage } from './categories.page';
import { CategoryModalComponent } from 'src/app/components/category-modal/category-modal.component';
import { SharedModule } from '../../shared/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    IonicModule,
    CategoriesPageRoutingModule
  ],
  declarations: [
    CategoriesPage,
    CategoryModalComponent
  ]
})
export class CategoriesPageModule {}
