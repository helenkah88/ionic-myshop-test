import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';
import { Product } from '../../models/product.interface';
import { map, take } from 'rxjs/operators';
import { CameraSource } from '@capacitor/core';
import { StorageService } from 'src/app/services/storage.service';
import { dirtyCheck } from '@ngneat/dirty-check-forms';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit, OnDestroy {

  @Input() productId: string;

  image: { photoUrl: string, format: string };
  imageFrom: CameraSource = CameraSource.Photos;
  showPreview: boolean;
  defaultPreview: string;
  isLoaded: boolean;
  isImgModified: boolean;
  productSub: Subscription;
  isDirtySub: Subscription;

  form: FormGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl('', { validators: [Validators.required, Validators.maxLength(100)] }),
    price: new FormControl('', { validators: [Validators.required, Validators.max(1000000)] }),
    photoUrl: new FormControl('')
  });

  isDirty$: Observable<boolean>;

  constructor(
    private productsService: ProductsService,
    private storageService: StorageService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.productSub = this.productsService.getSingleById(this.productId).pipe(
      take(1),
      map(data => {
        return {
          name: data.name,
          description: data.description,
          price: data.price,
          photoUrl: data.photoUrl
        };
      })
    )
    .subscribe(product => {
      this.populateForm(product);
      this.showPreview = true;
      this.defaultPreview = product.photoUrl;
      this.isLoaded = true;

      this.isDirty$ = dirtyCheck(this.form, of(product));

    });
  }

  private populateForm(data) {
    this.form.setValue({
      ...data
    });
  }

  private convertToBase64({ photoUrl, format }) {
    return photoUrl.replace(`data:image/${format};base64,`, '');
  }

  onCancel() {
    this.isDirtySub = this.isDirty$.pipe(take(1))
    .subscribe(async (dirty) => {
      if (!dirty && !this.isImgModified) {
        this.modalCtrl.dismiss(null, 'cancel');
      } else {
        const modal = await this.alertCtrl.create({
          message: 'You have unsaved changes. Are you sure you want to leave?',
          buttons: [
            {
              text: 'Leave',
              handler: () => {
                this.modalCtrl.dismiss(null, 'cancel');
                return true;
              }
            },
            {
              text: 'Stay',
              role: 'Cancel'
            }
          ]
        });
        modal.present();
      }
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.storageService.saveImg(this.image).pipe(
      take(1)
    ).subscribe(url => {
      this.form.patchValue({ photoUrl: url });
      this.modalCtrl.dismiss(this.form.value, 'confirm')
        .then(() => {
          this.form.reset();
          this.showPreview = false;
        });
    });
  }

  ngOnDestroy() {
    // tslint:disable-next-line: no-unused-expression
    this.productSub && this.productSub.unsubscribe();
    // tslint:disable-next-line: no-unused-expression
    this.isDirtySub && this.isDirtySub.unsubscribe();
  }

  async onImgPicked(file) {
    // const file = await convertToBlob(file);
    file.photoUrl = this.convertToBase64(file);
    this.image = file;
    this.isImgModified = true;
  }
}
