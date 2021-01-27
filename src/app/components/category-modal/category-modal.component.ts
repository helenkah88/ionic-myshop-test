import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoriesService } from 'src/app/services/categories.service';
import { Category } from '../../models/category.interface';
import { map, take } from 'rxjs/operators';
import { CameraSource } from '@capacitor/core';
import { StorageService } from '../../services/storage.service';
import { dirtyCheck } from '@ngneat/dirty-check-forms';
import { Observable, of, Subscription } from 'rxjs';
import { Image } from '../../models/image.interface';
import { convertToBase64 } from 'src/app/utilities/convert-image';

export type mode = 'create' | 'edit';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss'],
})
export class CategoryModalComponent implements OnInit, OnDestroy {

  @Input() mode: mode = 'create';
  @Input() categoryId: string = null;

  image: Image;
  imageFrom: CameraSource = CameraSource.Photos;
  showPreview: boolean;
  defaultPreview: string;
  isLoaded: boolean;
  isImgModified: boolean;
  categorySub: Subscription;
  imageSub: Subscription;
  isDirtySub: Subscription;
  isDirty$: Observable<boolean>;

  form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    description: new FormControl('', { validators: [Validators.required, Validators.maxLength(100)] }),
    coverImg: new FormControl('')
  });

  constructor(
    private categoriesService: CategoriesService,
    private storageService: StorageService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    if (this.mode === 'edit' && this.categoryId) {
      this.categorySub = this.categoriesService.getSingleById(this.categoryId).pipe(
        take(1),
        map((category: Category) => {
          return {
            name: category.name,
            description: category.description,
            coverImg: category.coverImg
          };
        })
      )
      .subscribe(category => {
        this.populateForm(category);
        this.showPreview = true;
        this.defaultPreview = category.coverImg;
        this.isLoaded = true;

        this.isDirty$ = dirtyCheck(this.form, of(category));
      });
    } else if (this.mode === 'create') {
      const data = {
        name: '',
        description: '',
        coverImg: ''
      };
      this.isLoaded = true;
      this.isDirty$ = dirtyCheck(this.form, of(data));
    }
  }

  /** Getters for form controls */
  get name() {
    return this.form.get('name');
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

  async onSubmit() {
    if (!this.form.valid) {
      return;
    }
    let formData = {
      data: this.form.value,
      mode: this.mode
    };

    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });

    loader.present();

    if (!this.isImgModified) {
      this.handleModal(formData);
      loader.dismiss();
    } else {
      this.imageSub = this.storageService.saveImg(this.image).pipe(
        take(1)
      ).subscribe(url => {
        this.updateForm({ coverImg: url });
        formData = {
          ...formData,
          data: this.form.value
        };
        this.handleModal(formData);
        loader.dismiss();
      });
    }
  }

  ngOnDestroy() {
    // tslint:disable-next-line: no-unused-expression
    this.categorySub && this.categorySub.unsubscribe();
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
