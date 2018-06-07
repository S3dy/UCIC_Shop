import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';

// Custom
import { TranslateService } from '../../module/ng2-translate';
import { Toast } from '@ionic-native/toast';

// Page
import { LoginPage } from '../login/login';
import { CoreValidator } from '../../validator/core';
import { Core } from '../../service/core.service';

import { AddressPage } from '../address/address';
declare var wordpress_url;

@Component({
	selector: 'page-login',
	templateUrl: 'signup.html',
	providers: [Core]
})
export class SignupPage {
	LoginPage = LoginPage;
	formSignup: FormGroup;
	trans:Object;
	AddressPage = AddressPage;
	wordpress_user:string = wordpress_url+'/wp-json/mobiconnector/user';

	constructor(
		private navCtrl: NavController,
		private formBuilder: FormBuilder,
		private storage: Storage,
		private http: Http,
		private core: Core,
		translate: TranslateService,
		private Toast: Toast
	){
		translate.get('signup').subscribe(trans => this.trans = trans);
		this.formSignup = formBuilder.group({
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			username: ['', Validators.required],
			email: ['', Validators.compose([Validators.required, CoreValidator.isEmail])],
			password: ['', Validators.required],
			repass: ['', Validators.compose([Validators.required, CoreValidator.confirmPassword])]
		});
	}
	removeConfirm(){
		this.formSignup.patchValue({ repass: null });
	}
	register(){
		let params = this.formSignup.value;
		params["display_name"] = params["first_name"] + ' ' + params["last_name"];
		params = this.core.objectToURLParams(params);
		this.core.showLoading();
		this.http.post(wordpress_url+'/wp-json/mobiconnector/user/register', params)
		.subscribe(res => {
			this.core.hideLoading();
			this.Toast.showShortBottom(this.trans["success"]).subscribe(
				toast => {},
				error => {console.log(error);}
			);
			this.http.post(wordpress_url+'/wp-json/jwt-auth/v1/token', this.formSignup.value)
			.subscribe(
				res => {
					let login = res.json();
					login.username = this.formSignup.value.username;
					let params = this.core.objectToURLParams({'username':login["username"]});
					this.http.post(this.wordpress_user+'/get_info', params).subscribe(user => {
						this.core.hideLoading();
						this.storage.set('user', user.json()).then(() => {
						this.storage.set('login', login).then(() => this.navCtrl.push(this.AddressPage));
						});
					}, err => {
						this.core.hideLoading();
						//this.formLogin.patchValue({password: null});
						//this.wrong = true;
					});
				},
				err => {
					this.core.hideLoading();
					//this.formLogin.patchValue({password: null});
					//this.wrong = true;
				},

			);
			//this.gotoLogin();
		}, err => {
			this.core.hideLoading();
			this.Toast.showShortBottom(err.json()["message"]).subscribe(
				toast => {},
				error => {console.log(error);}
			);
		});
	}
	gotoLogin(){
		if(this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.LoginPage)
			this.navCtrl.pop();
		else this.navCtrl.push(this.LoginPage);
	}
}
