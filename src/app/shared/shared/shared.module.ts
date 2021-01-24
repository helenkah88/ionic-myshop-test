import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageLoaderComponent } from 'src/app/components/image-loader/image-loader.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [ImageLoaderComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ImageLoaderComponent]
})
export class SharedModule { }
