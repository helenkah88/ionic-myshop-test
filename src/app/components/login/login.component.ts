import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  isLogin = true;

  constructor(
    private auth: AngularFireAuth,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', { validators: [Validators.required, Validators.email]}),
      password: new FormControl('', { validators: [Validators.required, Validators.minLength(6)] })
    });

    this.auth.user.subscribe(user => {
      // console.log(user.getIdTokenResult());
    });
  }

  async onSubmit() {
    if (!this.form.valid) {
      return;
    }
    try {
      const user = await this.authenticate(this.form.value);
      this.form.reset();
      if (user) {
        console.log(user);
        this.router.navigateByUrl('/');
      }
    } catch (e) {
      const errCode = e.code;
      let message = 'Could not sign you up, please try again.';
      if (errCode === 'auth/email-already-in-use') {
        message = 'This email address exists already!';
      } else if (errCode === 'auth/user-not-found') {
        message = 'Please sign up first.';
      } else if (errCode === 'auth/invalid-password') {
        message = 'This password is not correct.';
      } else if (errCode === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      this.showAlert(message);
    }
  }

  private authenticate({email, password}) {
    if (this.isLogin) {
      return this.authService.login(email, password);
    } else {
      // this.isLogin = !this.isLogin;
      return this.authService.signup(email, password);
    }
  }

  private async showAlert(msg) {
    const modal = await this.alertCtrl.create({
      header: 'Authentication failed',
      message: msg,
      buttons: ['Okay']
    });
    modal.present();
  }

  toggleLoginState() {
    this.isLogin = !this.isLogin;
  }

}