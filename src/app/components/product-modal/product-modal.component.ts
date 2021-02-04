import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AlertController, ModalController } from '@ionic/angular';
import { CameraSource } from '@capacitor/core';

import { Observable, of, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

import { dirtyCheck } from '@ngneat/dirty-check-forms';

import { ProductsService } from 'src/app/services/products.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertToBase64 } from 'src/app/utilities/convert-image';
import { Image } from '../../models/image.interface';

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
  isDirty$: Observable<boolean>;
  onDestroy$: Subject<null>;
  form: FormGroup;

  constructor(
    private productsService: ProductsService,
    private storageService: StorageService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    this.form = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.required, Validators.maxLength(100)] }),
      price: new FormControl('', { validators: [Validators.required, Validators.max(1000000)] }),
      photoUrl: new FormControl('')
    });
  }

  ngOnInit() {
    this.productsService.getSingleById(this.productId).pipe(
      take(1),
      map(data => {
        return {
          name: data.name,
          description: data.description,
          price: data.price,
          photoUrl: data.photoUrl
        };
      }),
      takeUntil(this.onDestroy$)
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
    this.isDirty$.pipe(
      take(1),
      takeUntil(this.onDestroy$)
    )
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
    if (!this.isImgModified) {
      this.handleModal(this.form.value);
    } else {
      this.storageService.saveImg(this.image).pipe(
        take(1),
        takeUntil(this.onDestroy$)
      ).subscribe(url => {
        this.updateForm({ photoUrl: url });
        this.handleModal(this.form.value);
      });
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next(null);
  }

  async onImgPicked(file) {
    // const file = await convertToBlob(file);
    file.photoUrl = convertToBase64(file);
    this.image = file;
    this.isImgModified = true;
  }
}
