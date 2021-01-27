import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) { }

  get isAuthenticated() {
    return this.auth.user.pipe(map(user => !!user));
  }

  get user() {
    return this.auth.user;
  }

  login(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  async signup(email, password) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      if (userCredential) {
        const userData: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoUrl: userCredential.user.photoURL
        };
        return this.firestore.collection<User>('users').add(userData);
      }
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }

  autoLogin() {
    return this.isAuthenticated.pipe(
      map(user => {
        if (!user) {
          this.router.navigateByUrl('/login');
        }
        return user;
      })
    );
  }

  logout() {
    this.auth.signOut();
    this.router.navigateByUrl('/login');
  }
}
