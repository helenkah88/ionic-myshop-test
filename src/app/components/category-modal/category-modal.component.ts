import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoriesService } from 'src/app/services/categories.service';
import { Category } from '../../models/category.interface';
import { take } from 'rxjs/operators';
import { CameraSource } from '@capacitor/core';
import { StorageService } from '../../services/storage.service';

export type mode = 'create' | 'edit';

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss'],
})
export class CategoryModalComponent implements OnInit {

  @Input() mode: mode = 'create';
  @Input() categoryId: string = null;

  form: FormGroup;
  image: { photoUrl: string, format: string };
  imageFrom: CameraSource = CameraSource.Photos;
  showPreview: boolean;
  defaultPreview: string;
  isLoaded: boolean;

  constructor(
    private categoriesService: CategoriesService,
    private storageService: StorageService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.required, Validators.maxLength(200)] }),
      coverImg: new FormControl('')
    });

    if (this.mode === 'edit' && this.categoryId) {
      this.categoriesService.getSingleById(this.categoryId)
        .pipe(take(1))
        .subscribe((category: Category) => {
          this.populateForm(category);
          this.showPreview = true;
          this.defaultPreview = category.coverImg;
          this.isLoaded = true;

          this.form.valueChanges.subscribe(val => {
            console.log(val);
          });
        });
    }
  }

  private populateForm(data: Category) {
    this.form.setValue({
      name: data.name,
      description: data.description,
      coverImg: data.coverImg
    });
  }

  private convertToBase64({ photoUrl, format }) {
    return photoUrl.replace(`data:image/${format};base64,`, '');
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.storageService.saveImg(this.image).pipe(
      take(1)
    ).subscribe(url => {
      this.form.patchValue({ coverImg: url });
      this.modalCtrl.dismiss({
        data: this.form.value,
        mode: this.mode
      }, 'confirm').then(() => {
        this.form.reset();
        this.showPreview = false;
      });
    });
  }

  async onImgPicked(file) {
    // const file = await convertToBlob(file);
    file.photoUrl = this.convertToBase64(file);
    this.image = file;
  }
}
