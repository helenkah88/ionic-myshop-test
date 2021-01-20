import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Category } from 'src/app/models/category.interface';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(private firestore: AngularFirestore) {}

  private colName = 'categories';

  getAll() {
    return this.firestore.collection<Category>(this.colName).valueChanges({ idField: 'categoryId'});
  }

  getSingleById(id) {
    return this.firestore.doc<Category>(`${this.colName}/${id}`).valueChanges();
  }

  create(data: Category) {
    return this.firestore.collection<Category>(this.colName).add(data);
  }

  update(id, data: Category) {
    return this.firestore.doc(`${this.colName}/${id}`).update(data);
  }

  delete(id) {
    return this.firestore.doc(`${this.colName}/${id}`).delete()
      .then(() => {
        console.log(id);
        return this.firestore.collection('products', ref => ref.where('categoryId', '==', id)).get().pipe(
          tap(items => {
            if (items) {
              items.forEach(item => {
                item.ref.delete();
              });
            }
          })
        ).subscribe();
      })
      .catch(console.log);
  }
}
