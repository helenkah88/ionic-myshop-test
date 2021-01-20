import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Product } from 'src/app/models/product.interface';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private colName = 'products';

  constructor(private firestore: AngularFirestore) {}

  getAll(id) {
    return this.firestore.collection<Product>(this.colName, ref => ref.where('categoryId', '==', id))
      .valueChanges({ idField: 'productId'}).pipe(
        catchError(() => {
          return of([]);
        })
      );
  }

  getSingleById(id) {
    return this.firestore.doc<Product>(`${this.colName}/${id}`).valueChanges();
  }

  create(data: Product) {
    return this.firestore.collection<Product>(this.colName).add(data);
  }

  update(id, data: Product) {
    return this.firestore.doc(`${this.colName}/${id}`).update(data);
  }

  delete(id) {
    return this.firestore.doc(`${this.colName}/${id}`).delete()
      .catch(console.log);
  }
}
