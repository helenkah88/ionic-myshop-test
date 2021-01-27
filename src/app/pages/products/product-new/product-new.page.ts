import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductsService } from 'src/app/services/products.service';
import { Observable, of } from 'rxjs';
import { Category } from 'src/app/models/category.interface';
import { CategoriesService } from 'src/app/services/categories.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Product } from '../../../models/product.interface';
import { map, take, switchMap, tap } from 'rxjs/operators';
import { CameraSource } from '@capacitor/core';
import { StorageService } from '../../../services/storage.service';
import { convertToBase64 } from 'src/app/utilities/convert-image';
import { LoadingController } from '@ionic/angular';
import { Image } from '../../../models/image.interface';

@Component({
  selector: 'app-product-new',
  templateUrl: './product-new.page.html',
  styleUrls: ['./product-new.page.scss'],
})
export class ProductNewPage implements OnInit {

  form: FormGroup;
  categoryId: string;
  categories$: Observable<(Category & { categoryId: string; })[]>;
  image: Image;
  imageFrom: CameraSource = CameraSource.Prompt;
  showPreview: boolean;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private storageService: StorageService,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private router: Router,
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
        : new FormControl('', { validators: [Validators.required] }),
      photoUrl: new FormControl('')
    });
  }

  /** Getters for form controls */
  get name() {
    return this.form.get('name');
  }

  get price() {
    return this.form.get('price');
  }

  get category() {
    return this.form.get('categoryId');
  }

  get description() {
    return this.form.get('description');
  }

  async onSubmit() {
    if (!this.form.valid) {
      return;
    }

    let userData;

    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });

    loader.present();

    this.categories$ = this.categoriesService.getAll().pipe(
      tap(() => {
        loader.dismiss();
      })
    );

    this.authService.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          return;
        }
        userData = user;
        return this.storageService.saveImg(this.image);
      }),
      map(url => {
        this.form.patchValue({ photoUrl: url });
        const product: Product = {
          ...this.form.value,
          checkIn: new Date().toISOString(),
          createdBy: userData.uid
        };
        return product;
      }),
      map(product => {
        this.productsService.create(product);
      })
    ).subscribe(() => {
      this.form.reset();
      this.showPreview = false;
      loader.dismiss();
      this.router.navigateByUrl('/categories');
    });
  }

  async onImgPicked(file) {
      // const file = await convertToBlob(file);
      file.photoUrl = convertToBase64(file);
      this.image = file;
  }
}
