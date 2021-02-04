import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Product } from 'src/app/models/product.interface';
import { ProductsService } from 'src/app/services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.interface';
import { AlertController, IonItemSliding, LoadingController, ModalController } from '@ionic/angular';
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
  showTooltip = false;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });

    let counter = 0;
    await loader.present();

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
      console.log(productList, ++counter);
      this.products = productList;
      loader.dismiss();
    });
  }

  async edit(e: MouseEvent, id: string, slidingItem: IonItemSliding) {
    e.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: ProductModalComponent,
      componentProps: {
        productId: id
      }
    });

    await modal.present();
    const { data, role } = await modal.onDidDismiss<Product>();
    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });
    await loader.present();

    if (role === 'confirm') {
      try {
        await this.productsService.update(id, data);
        loader.dismiss();

        const alert = await this.alertCtrl.create({
          message: 'A product is successfully updated!'
        });
        await alert.present();

        setTimeout(() => {
          alert.dismiss();
        }, 3000);
      } catch (e) {
        loader.dismiss();
        slidingItem.close();

        const alert = await this.alertCtrl.create({
          message: 'An error occured, please try again later'
        });
        await alert.present();

        setTimeout(() => {
          alert.dismiss();
        }, 3000);
      }
    }

    if (role === 'cancel') {
      slidingItem.close();
      loader.dismiss();
    }
  }

  private async onDelete(id) {
    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });
    await loader.present();
    try {
      await this.productsService.delete(id);
      loader.dismiss();

      const alert = await this.alertCtrl.create({
        message: 'A product is successfully deleted!'
      });
      await alert.present();

      setTimeout(() => {
        alert.dismiss();
      }, 3000);
    } catch (err) {
      loader.dismiss();

      const alert = await this.alertCtrl.create({
        message: 'An error occured, please try again later'
      });
      await alert.present();

      setTimeout(() => {
        alert.dismiss();
      }, 3000);
    }
  }

  async delete(e: MouseEvent, id, slidingItem: IonItemSliding) {
    e.stopPropagation();

    slidingItem.close();

    const modal = await this.alertCtrl.create({
      header: 'Product deletion',
      message: 'Are you sure you want to delete this product?',
      buttons: [
        {
          text: 'Delete',
          handler: this.onDelete.bind(this, id)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    modal.present();
  }
}
