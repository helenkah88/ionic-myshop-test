import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoriesService } from 'src/app/services/categories.service';
import { Category } from '../../models/category.interface';
import { take } from 'rxjs/operators';

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

  constructor(
    private categoriesService: CategoriesService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.required, Validators.maxLength(200)] })
    });

    if (this.mode === 'edit' && this.categoryId) {
      this.categoriesService.getSingleById(this.categoryId)
        .pipe(take(1))
        .subscribe((category: Category) => {
          this.populateForm(category);
        });
    }
  }

  private populateForm(data: Category) {
    this.form.setValue({
      name: data.name,
      description: data.description
    });
  }

  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.modalCtrl.dismiss({
      data: this.form.value,
      mode: this.mode
    }, 'confirm');
  }
}
