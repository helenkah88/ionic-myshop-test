import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from 'src/app/models/category.interface';
import { CategoriesService } from 'src/app/services/categories.service';

import { ModalController, LoadingController } from '@ionic/angular';
import { CategoryModalComponent, mode } from 'src/app/components/category-modal/category-modal.component';
import { AuthService } from 'src/app/services/auth.service';
import { map, take, tap } from 'rxjs/operators';

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
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.categories$ = this.categoriesService.getAll();
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
      this.loadingCtrl.create({
        message: 'loading...'
      }).then(loadingElem => {
        loadingElem.present();
        switch (data.mode) {
          case 'create':
            this.authService.user.pipe(
              take(1),
              map((user) => {
                if (!user) {
                  return;
                }
                console.log(user);
                const cat: Category = {
                  ...data.data,
                  createdBy: user.uid,
                };
                return cat;
              }),
              map(cat => {
                console.log(cat);
                return this.categoriesService.create(cat)
                  .then(() => {
                    loadingElem.dismiss();
                  });
              })
            ).subscribe();
            break;

          case 'edit':
            this.categoriesService.update(id, data.data)
              .then(() => {
                loadingElem.dismiss();
              });
            break;
          }
        });
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

  delete(e: MouseEvent, id) {
    e.preventDefault();
    e.stopPropagation();
    this.categoriesService.delete(id);
  }
}
