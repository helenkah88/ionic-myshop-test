import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/products.service';
import { Product } from '../../models/product.interface';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {

  @Input() productId;

  form: FormGroup;

  constructor(
    private productsService: ProductsService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.required, Validators.maxLength(100)] }),
      price: new FormControl('', { validators: [Validators.required, Validators.max(1000000)] }),
    });

    this.productsService.getSingleById(this.productId)
      .pipe(take(1))
      .subscribe(product => {
        this.populateForm(product);
      });
  }

  private populateForm(data: Product) {
    this.form.setValue({
      name: data.name,
      description: data.description,
      price: data.price
    });
  }


  onCancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.modalCtrl.dismiss(this.form.value, 'confirm');
  }
}
