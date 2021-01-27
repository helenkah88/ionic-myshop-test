import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';
import { map, take } from 'rxjs/operators';
import { CameraSource } from '@capacitor/core';
import { StorageService } from 'src/app/services/storage.service';
import { dirtyCheck } from '@ngneat/dirty-check-forms';
import { Observable, of, Subscription } from 'rxjs';
import { Image } from '../../models/image.interface';
import { convertToBase64 } from 'src/app/utilities/convert-image';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit, OnDestroy {

  @Input() productId: string;

  image: Image;
  imageFrom: CameraSource = CameraSource.Photos;
  showPreview: boolean;
  defaultPreview: string;
  isLoaded: boolean;
  isImgModified: boolean;
  productSub: Subscription;
  imageSub: Subscription;
  isDirtySub: Subscription;
  isDirty$: Observable<boolean>;

  form: FormGroup = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl('', { validators: [Validators.required, Validators.maxLength(100)] }),
    price: new FormControl('', { validators: [Validators.required, Validators.max(1000000)] }),
    photoUrl: new FormControl('')
  });

  constructor(
    private productsService: ProductsService,
    private storageService: StorageService,
    private loadingCtrl: LoadingController,
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

  /** Getters for form controls */
  get name() {
    return this.form.get('name');
  }

  get price() {
    return this.form.get('price');
  }

  get description() {
    return this.form.get('description');
  }

  private populateForm(data) {
    this.form.setValue({
      ...data
    });
  }

  private updateForm(data) {
    this.form.patchValue(data);
  }

  private handleModal(data) {
    return this.modalCtrl.dismiss(data, 'confirm').then(() => {
      this.form.reset();
      this.showPreview = false;
    });
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
                this.isDirtySub.unsubscribe();
                return true;
              }
            },
            {
              text: 'Stay',
              role: 'cancel'
            }
          ]
        });
        modal.present();
      }
    });
  }

  async onSubmit() {
    if (!this.form.valid) {
      return;
    }
    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });

    loader.present();

    if (!this.isImgModified) {
      this.handleModal(this.form.value);
      loader.dismiss();
    } else {
      this.imageSub = this.storageService.saveImg(this.image).pipe(
        take(1)
      ).subscribe(url => {
        this.updateForm({ photoUrl: url });
        this.handleModal(this.form.value);
        loader.dismiss();
      });
    }
  }

  ngOnDestroy() {
    // tslint:disable-next-line: no-unused-expression
    this.productSub && this.productSub.unsubscribe();
    // tslint:disable-next-line: no-unused-expression
    this.isDirtySub && this.isDirtySub.unsubscribe();
    // tslint:disable-next-line: no-unused-expression
    this.imageSub && this.imageSub.unsubscribe();
  }

  async onImgPicked(file) {
    // const file = await convertToBlob(file);
    file.photoUrl = convertToBase64(file);
    this.image = file;
    this.isImgModified = true;
  }
}
