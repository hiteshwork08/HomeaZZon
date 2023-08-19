import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { Constants } from 'src/app/common/Constants';
import { IPropertyDto } from 'src/app/models/dto/interfaces/IPropertyDto';
import { BasePage } from 'src/app/pages/base/base.page';
import { UxNotifierService } from 'src/app/services/uxNotifier/ux-notifier.service';

@Component({
	selector: 'app-property-profile-general-information',
	templateUrl: './property-profile-general-information.page.html',
	styleUrls: ['./property-profile-general-information.page.scss'],
})
export class PropertyProfileGeneralInformationPage extends BasePage {

	public property: IPropertyDto;
	constants = new Constants;

	constructor(public navCtrl: NavController,
		public platform: Platform,
		public router: Router,
		private toast: UxNotifierService) {
		super(navCtrl, null, null, null, platform, router, null, null, null);
		this.constants = new Constants();

		this.property = {} as IPropertyDto;
		this.property.SqFt = 0;
	}
	async ngOnInit() {
		console.log('ngOnInit PropertyProfileGeneralInformationPage');
		//this.AppInsights.trackPageView({ name: 'PropertyProfileGeneralInformationPage' });
	}

	ionViewDidLoad() { }

	//increment the quantity
	increment() {
		if (this.property.TotalStories === undefined || this.property.TotalStories === 0) {
			this.property.TotalStories = 1;
		} else {
			this.property.TotalStories += 1;
		}
	}

	//decrement the quantity
	decrement() {
		if (this.property.TotalStories === undefined || this.property.TotalStories === 0) {
			this.property.TotalStories = 0;
		} else {
			this.property.TotalStories -= 1;
		}
	}

	//navigate to ProfileBedrooms page
	gotobathroompage() {
		if (this.property.TotalStories === undefined || this.property.TotalStories === 0) {
			this.toast.showToast('Total stories must be greater than 0', this.constants.ToastColorBad)
			return;
		}

		if (this.property.SqFt === undefined || this.property.SqFt === 0) {
			this.toast.showToast('Sq Ft must be greater than 0', this.constants.ToastColorBad)
			return;
		}

		if (this.property.Name === undefined || this.property.Name === '') {
			this.toast.showToast('Please enter a name', this.constants.ToastColorBad)
			return;
		}

		let customProperty = this.CustomProperty;

		if (customProperty == null) {
			customProperty = {} as IPropertyDto;
		}
		
		customProperty.TotalStories = this.property.TotalStories;
		customProperty.SqFt = this.property.SqFt;
		customProperty.Name = this.property.Name;

		this.CustomProperty = customProperty;

		this.router.navigate(['property-profile-bedrooms']);
	}

	public close() {
		this.navCtrl.pop();
	}
}
