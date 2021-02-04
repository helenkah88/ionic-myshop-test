import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Product } from 'src/app/models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private colName = 'products';

  constructor(private firestore: AngularFirestore) {}

  getAll(id) {
    return this.firestore.collection<Product>(this.colName, ref => ref.where('categoryId', '==', id))
      .snapshotChanges().pipe(
        map(data => {
          return data.map(snapshot => {
            return {
              productId: snapshot.payload.doc.id,
              ...snapshot.payload.doc.data() as Product,
            };
          });
        }),
        catchError(() => {
          return of([]);
        })
      );
  }

  getSingleById(id) {
    return this.firestore.doc<Product>(`${this.colName}/${id}`).valueChanges().pipe(
      catchError(e => {
        return of(e);
      })
    );
  }

  create(data: Product) {
    return this.firestore.collection<Product>(this.colName).add(data)
    .catch(e => {
      return Promise.reject(e);
    });
  }

  update(id, data: Product) {
    return this.firestore.doc(`${this.colName}/${id}`).update(data)
    .catch(e => {
      return Promise.reject(e);
    });
  }

  delete(id) {
    return this.firestore.doc(`${this.colName}/${id}`).delete()
    .catch(e => {
      return Promise.reject(e);
    });
  }
}
