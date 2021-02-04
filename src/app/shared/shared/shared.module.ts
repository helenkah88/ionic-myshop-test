import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ImageLoaderComponent } from 'src/app/components/image-loader/image-loader.component';
import { MapComponent } from '../../components/map/map.component';
import { MapCardComponent } from '../../components/map/map-card/map-card.component';

@NgModule({
  declarations: [
    ImageLoaderComponent,
    MapCardComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ImageLoaderComponent,
    MapCardComponent,
    MapComponent
  ]
})
export class SharedModule { }
