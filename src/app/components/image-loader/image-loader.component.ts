import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  Plugins,
  CameraResultType,
  CameraSource,
} from '@capacitor/core';

/* export async function convertToBlob(file: string) {
  const res = await fetch(file);
  const blob = await res.blob();
  return blob;
}
 */
@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.scss'],
})
export class ImageLoaderComponent implements OnInit, AfterViewInit {

  @Input() cameraSourceType: CameraSource;
  @Input() showPreview: boolean;
  @Input() defaultPreview: string;

  @Output() imgPicked = new EventEmitter<{ [K in string]: string }>();

  photo: string;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    console.log(this.cameraSourceType, this.showPreview, this.defaultPreview);
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
        const photo = {
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
