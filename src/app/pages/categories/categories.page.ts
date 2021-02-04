import { Component, OnInit } from '@angular/core';

import { AlertController, LoadingController, ModalController } from '@ionic/angular';

import { map, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Category } from 'src/app/models/category.interface';
import { CategoriesService } from 'src/app/services/categories.service';
import { CategoryModalComponent, mode } from 'src/app/components/category-modal/category-modal.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  categories$: Observable<(Category & { categoryId: string; })[]>;

  constructor(
    private categoriesService: CategoriesService,
    public authService: AuthService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });

    loader.present();

    this.categories$ = this.categoriesService.getAll().pipe(
      tap(() => {
        loader.dismiss();
      })
    );
  }

  private async showModal(selectedMode: mode, id?: string) {
    const modal = await this.modalCtrl.create({
      component: CategoryModalComponent,
      componentProps: {
        mode: selectedMode,
        categoryId: id
      }
    });
    modal.present();
    const { data, role } = await modal.onDidDismiss<{ data: Category, mode: mode }>();
    if (role === 'confirm') {
      switch (data.mode) {
        case 'create':
          this.authService.user.pipe(
            take(1),
            map((user) => {
              if (!user) {
                return;
              }
              const cat: Category = {
                ...data.data,
                createdBy: user.uid,
              };
              return cat;
            }),
            map(cat => {
              return this.categoriesService.create(cat);
            })
          ).subscribe();
          break;

        case 'edit':
          this.categoriesService.update(id, data.data);
          break;
        }
      }
  }

  private async onDelete(id: string) {
    const loader = await this.loadingCtrl.create({
      message: 'loading...'
    });
    await loader.present();
    try {
      await this.categoriesService.delete(id);
      loader.dismiss();
    } catch (err) {
      console.log(err);
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

  create() {
    this.showModal('create');
  }

  edit(e: MouseEvent, id) {
    e.preventDefault();
    e.stopPropagation();
    this.showModal('edit', id);
  }

  async delete(e: MouseEvent, id) {
    e.preventDefault();
    e.stopPropagation();

    const modal = await this.alertCtrl.create({
      header: 'Category deletion',
      message: 'Are you sure you want to delete this category?',
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
