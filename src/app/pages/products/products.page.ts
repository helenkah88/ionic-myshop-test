import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Product } from 'src/app/models/product.interface';
import { ProductsService } from 'src/app/services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.interface';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { ProductModalComponent } from 'src/app/components/product-modal/product-modal.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

  products: (Product & { productId: string})[];
  categoryId;
  category: Category;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(
      take(1),
      switchMap(params => {
        const id = params.get('categoryId');
        this.categoryId = id;

        return combineLatest([
          this.categoriesService.getSingleById(id),
          this.productsService.getAll(id)
        ]);
      })
    ).subscribe(([category, productList]) => {
      this.category = category;
      this.products = productList;
    });
  }

  async edit(e: MouseEvent, id, slidingItem: IonItemSliding) {
    e.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: ProductModalComponent,
      componentProps: {
        productId: id
      }
    });

    modal.present();
    const { data, role } = await modal.onDidDismiss<Product>();

    if (role === 'confirm') {
      this.productsService.update(id, data);
    }

    if (role === 'cancel') {
      slidingItem.close();
    }
  }

  delete(e: MouseEvent, id) {
    e.stopPropagation();
    this.productsService.delete(id);
  }
}
