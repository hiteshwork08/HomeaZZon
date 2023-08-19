import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeableBrowser } from '@ionic-native/themeable-browser/ngx';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { Constants } from '../../../../common/Constants';
import { IUserTypeDto } from '../../../../models/dto/interfaces/IUserTypeDto';
import { ProfileItemImageDto } from '../../../../models/dto/ProfileItemImageDto';
import { CommunicatorService } from '../../../../services/communicator/communicator.service';
import { FeaturesService } from '../../../../services/features/features.service';
import { UserTypesService } from '../../../../services/user-types/user-types.service';
import { UxNotifierService } from '../../../../services/uxNotifier/ux-notifier.service';
import { BasePage } from '../../../base/base.page';

@Component({
  selector: 'app-user-types-manager',
  templateUrl: './user-types-manager.page.html',
  styleUrls: ['./user-types-manager.page.scss'],
})
export class UserTypesManagerPage extends BasePage {

	public userTypes: Array<IUserTypeDto>;
	public userTypesAnynomousType: Array<any>;
	private _constants: Constants;

	constructor(public navController: NavController,
		public communicator: CommunicatorService,
		public menuController: MenuController,
		public platform: Platform,
		public router: Router,
		public uxNotifierService: UxNotifierService,
		public userTypesService: UserTypesService,
		public featuresService: FeaturesService,
		public themeableBrowser: ThemeableBrowser) {
		super(navController, null, communicator, menuController, platform, router, uxNotifierService, userTypesService, featuresService, themeableBrowser);
		this._constants = new Constants();

		this.userTypes = this.UserTypes.filter(x => x.IsActive).filter(x => x.Name !== this._constants.UserTypes.Unassigned);
		this.userTypesAnynomousType = this.userTypes;

		let currentUserUserTypes: any = this.User.Types;

		for (var i = 0; i < this.userTypesAnynomousType.length; i++) {
			if (currentUserUserTypes.some(x => x.Name == this.userTypesAnynomousType[i].Name)) {
				this.userTypesAnynomousType[i].IsSubscribed = true;
			} else {
				this.userTypesAnynomousType[i].IsSubscribed = false;
			}
		}
	}

	ngOnInit() {
	}

	public close() {
		this.router.navigate(['dashboard']);
	}

	public setup(userTypeId: number) {
		this.chooseRole(userTypeId, 'setup');
	}

	public manage(userTypeId: number) {
		this.chooseRole(userTypeId, 'manage');
	}

	public chooseRole(userTypeId: number, action: string) {
		let selectedUserType: IUserTypeDto = this.UserTypes.filter(x => x.Id === userTypeId)[0];

		this.IsNewUserTypeSelected = true;
		this.NewSelectedUserTypeId = selectedUserType.Id;

		switch (selectedUserType.Name) {
			case this._constants.UserTypes.Appraiser:
				this.router.navigate(['dashboard']);
				break;
			case this._constants.UserTypes.Architect:
				break;
			case this._constants.UserTypes.Bank:
				break;
			case this._constants.UserTypes.Developer:
				this.router.navigate(['user-types-developer']);
				break;
			case this._constants.UserTypes.Owner:
				this.router.navigate(['user-types-owner']);
				break;
			case this._constants.UserTypes.PrivateLabelUser:
				break;
			case this._constants.UserTypes.Realtor:
				this.router.navigate(['user-types-realtor']);
				break;
			case this._constants.UserTypes.Renter:
				this.router.navigate(['user-types-renter']);
				break;
			case this._constants.UserTypes.Tradesman:
				this.router.navigate(['user-types-tradesman']);
				break;
			case this._constants.UserTypes.Unassigned:
				break;
			case this._constants.UserTypes.Vendor:
				this.router.navigate(['user-types-vendor']);
				break;
		}
	}
}
