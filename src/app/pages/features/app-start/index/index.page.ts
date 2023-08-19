import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { BasePage } from 'src/app/pages/base/base.page';
import { AccountService } from 'src/app/services/account/account.service';

@Component({
	selector: 'app-index',
	templateUrl: './index.page.html',
	styleUrls: ['./index.page.scss'],
})
export class IndexPage extends BasePage {
	loader: any;

	constructor(public router: Router,
		public storage: Storage,
		private accountService: AccountService,
		private http: HttpClient) {
		super(null, null, null, null, null, router, null, null, null);
	}

	ngOnInit() {
		console.log('ngOnInit IndexPage');

		this.isLoggedIn();
	}

	private isLoggedIn() {

		let isValidUser = this.accountService.isAuthTokenValid();

		if (isValidUser) {
			if (this.User === undefined || this.User === null) {
				this.accountService.getUser()
					.then((x) => {
						this.User = x;
						this.next();
					})
					.catch((e) => { });
			} else {
				this.next();
			}
		} else {
			this.router.navigate(['sign-in']);
		}
	}

	private next() {
		this.router.navigate(['dashboard']);
	}
}
