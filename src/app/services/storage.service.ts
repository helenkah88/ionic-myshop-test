import { Injectable } from '@angular/core';
import { last, switchMap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private fireStorage: AngularFireStorage) { }

  saveImg(img): Observable<string> {
    const filePath = `${new Date().getTime()}.${img.format}`;
    const fileRef = this.fireStorage.ref(filePath);
    const task = fileRef.putString(img.photoUrl, 'base64');
    // const task = this.fireStorage.upload(filePath, this.image);
    return task.snapshotChanges().pipe(
      last(),
      switchMap(() => {
        return fileRef.getDownloadURL();
      })
    );
  }
}
