import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Image } from '../../models/image.interface';
import {
  Plugins,
  CameraResultType,
  CameraSource,
} from '@capacitor/core';

@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.scss'],
})
export class ImageLoaderComponent implements OnInit {

  @Input() cameraSourceType: CameraSource;
  @Input() showPreview: boolean;
  @Input() defaultPreview: string;

  @Output() imgPicked = new EventEmitter<Image>();

  photo: string;

  constructor() { }

  ngOnInit() {
  }

  async takePicture() {
    const { Camera } = Plugins;

    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: this.cameraSourceType,
        quality: 100,
        correctOrientation: true
      });

      if (capturedPhoto && capturedPhoto.dataUrl) {
        this.photo = capturedPhoto.dataUrl;
        const photo: Image = {
          photoUrl: capturedPhoto.dataUrl,
          format: capturedPhoto.format
        };
        this.showPreview = true;
        this.imgPicked.emit(photo);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
