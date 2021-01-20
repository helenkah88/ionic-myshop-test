import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductsService } from 'src/app/services/products.service';
import { Observable } from 'rxjs';
import { Category } from 'src/app/models/category.interface';
import { CategoriesService } from 'src/app/services/categories.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Product } from '../../../models/product.interface';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-product-new',
  templateUrl: './product-new.page.html',
  styleUrls: ['./product-new.page.scss'],
})
export class ProductNewPage implements OnInit {

  form: FormGroup;
  categoryId;
  categories$: Observable<(Category & { categoryId: string; })[]>;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.categoryId = this.activatedRoute.snapshot.paramMap.get('categoryId');
    this.categories$ = this.categoriesService.getAll();

    this.form = new FormGroup({
      name: new FormControl('', { validators: [Validators.required] }),
      description: new FormControl('', { validators: [Validators.required, Validators.maxLength(100)] }),
      price: new FormControl('', { validators: [Validators.required, Validators.max(1000000)] }),
      categoryId: this.categoryId
        ? new FormControl(this.categoryId)
        : new FormControl('', { validators: [Validators.required] })
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.authService.user.pipe(
      take(1),
      map((user) => {
        if (!user) {
          return;
        }
        const product: Product = {
          ...this.form.value,
          checkIn: new Date(),
          photoUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRBVItn_oqnXbd-bSzgnM5bt1wdiuJ8jxUQLqPh_IuZHzS3MZ3HCIxZ3-xZ6v6nmskFSy_gWzecIrwzEwGQPRnjmH_3I8Jfz5vgWOkZbgt8Q17YhUN9uaFclA&usqp=CAc',
          createdBy: user.uid
        };
        return product;
      }),
      map(product => {
        this.productsService.create(product);
      })
    ).subscribe();
  }

}
