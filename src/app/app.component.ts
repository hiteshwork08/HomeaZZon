import { Component, NgZone } from "@angular/core";
import { Platform, AlertController, LoadingController, MenuController } from "@ionic/angular";
import { StatusBar } from "@awesome-cordova-plugins/status-bar/ngx";
import { SplashScreen } from "@awesome-cordova-plugins/splash-screen/ngx";
import { HttpClient } from "@angular/common/http";
// import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { IDeterminePathDto } from "./models/dto/interfaces/IDeterminePathDto";
import { environment } from "src/environments/environment";
import { Storage } from "@ionic/storage";
import { Router, NavigationExtras } from "@angular/router";
import { BasePage } from "./pages/base/base.page";
import { CommunicatorService } from "./services/communicator/communicator.service";
import { IUserDto } from "./models/dto/interfaces/IUserDto";
import { AppStorageService } from "./services/app-storage/app-storage.service";
import { IPropertyDto } from "./models/dto/interfaces/IPropertyDto";
// import { ThemeableBrowser, ThemeableBrowserOptions, ThemeableBrowserObject } from '@ionic-native/themeable-browser';
// Import Auth0Cordova
var Auth0Cordova = require("@auth0/cordova");
import { IAuthTokenDto } from "./models/dto/interfaces/IAuthTokenDto";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Constants } from "src/app/common/Constants";
import Axios from "axios";
import { Deeplinks } from "@awesome-cordova-plugins/deeplinks/ngx";
import { IdTokenDto } from "./models/dto/interfaces/IdTokenDto";
import { ICompanyTypeDto } from "./models/dto/interfaces/ICompanyTypeDto";
import { CompanyTypesService } from "./services/company-types/company-types.service";
import { IUserTypeDto } from "./models/dto/interfaces/IUserTypeDto";
import * as qs from "querystring";
import { AccountService } from "./services/account/account.service";
import { FirebaseAuthService } from "./services/FirebaseAuth/firebase-auth.service";
@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent extends BasePage {
  private _loading: any;

  // rootPage:any = SigninPage;
  public rootPage: any;

  //new
  pages!: Array<{ image: string; title: string; url: any }>;
  photoUrl: any =
    "https://firebasestorage.googleapis.com/v0/b/itt-content.appspot.com/o/Common%2Fassets%2Fimgs%2Flogo.png?alt=media&token=ca3a844b-8e53-489f-8530-7342edeb98b3";
  userName: any;
  displayName: any;
  userTypes: any;
  userId: any;
  UserUserTypes: any = [];
  isOwner: boolean = false;
  isPrivateLabeler: boolean = false;
  isPrivateLabelUser: boolean = false;
  userProperties: any = [];
  getPropertiesSubsription: any;
  constants = new Constants();

  //new
  constructor(
    public override platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public storage: Storage,
    private alertCtrl: AlertController,
    public http: HttpClient,
    public override communicator: CommunicatorService,
    public menu: MenuController,
    private storageCtrl: AppStorageService,
    public loadingCtrl: LoadingController,
    public override router: Router,
    private ngzone: NgZone,
    private firebaseService: FirebaseAuthService
  ) {
    super(null, null, communicator, menu, platform, router, null, null, null);

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      // Redirect back to app after authenticating
      (window as any).handleOpenURL = (url: string) => {
        Auth0Cordova.onRedirectUri(url);
      };
    });
  }

  override ngOnInit() {
    console.log("ngOnInit AppComponent");

    this.listenPropertiesLoadedEvent();
    this.listenLoginEvent();
    this.listenLogOutEvent();

    this.pages = [
      {
        image:
          "https://firebasestorage.googleapis.com/v0/b/homeazzon.appspot.com/o/common%2Ffont-awesome%2Fregular%2Fsign-out.svg?alt=media&token=af90963a-a5fa-418b-8411-f985318dce62",
        title: "Logout",
        url: "logout",
      },
      {
        image:
          "https://firebasestorage.googleapis.com/v0/b/homeazzon.appspot.com/o/common%2Ffont-awesome%2Fregular%2Fatom.svg?alt=media&token=9061a8cf-0245-4efe-83ab-f6caa51695fd",
        title: "Settings",
        url: "settings",
      },
      {
        image:
          "https://firebasestorage.googleapis.com/v0/b/homeazzon.appspot.com/o/common%2Ffont-awesome%2Fregular%2Fcorn.svg?alt=media&token=9bde19a2-7ea0-4b22-85df-47fac1703b2f",
        title: "Notifications",
        url: "notifications",
      },
      {
        image:
          "https://firebasestorage.googleapis.com/v0/b/homeazzon.appspot.com/o/common%2Ffont-awesome%2Fregular%2Fuser-friends.svg?alt=media&token=8288f72c-046b-4ec5-b44e-7aa63b8e2e7d",
        title: "User Types",
        url: "user-types-manager",
      },
      {
        image:
          "https://firebasestorage.googleapis.com/v0/b/homeazzon.appspot.com/o/common%2Ffont-awesome%2Fregular%2Fquestion.svg?alt=media&token=caebe366-1fa4-49b7-a654-ef2143635700",
        title: "Help",
        url: "help",
      },
    ];
  }

  async listenLoginEvent(): Promise<void> {
    window.addEventListener("user:loggedIn", (x: any) => {
      this.displayName = this.firebaseService.FirebaseUser.displayName;
      this.router.navigate(["dashboard"]);
    });
  }

  async listenLogOutEvent() {
    window.addEventListener("user:loggedOut", (x) => {
      this.displayName = null;
      this.menuController.close();
    });
  }

  async listenPropertiesLoadedEvent(): Promise<void> {
    window.addEventListener("properties:loaded", (x: any) => {
      this.ngzone.run(() => {
        this.userProperties = x.detail;
        this.displayName = this.firebaseService.FirebaseUser.displayName;
      });
    });
  }

  async showAlertToUserAfterUpdate(title, message) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [
        {
          text: "Ok",
          role: "cancel",
          handler: () => {
            //console.log('Cancel clicked');
          },
        },
      ],
    });
    await alert.present();
  }

  async openPage(page) {
    if (page.url === "logout") {
      const alert = await this.alertCtrl.create({
        header: "Confirm",
        message: "Are you sure want to Logout?",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              return;
            },
          },
          {
            text: "Ok",
            cssClass: "signout",
            handler: () => {
              this.firebaseService.logOut();
            },
          },
        ],
      });
      await alert.present();
      return;
    } else {
      this.router.navigate([page.url]);
      this.menuController.close();
    }
  }

  public designHome() {
    //this.appCtrl.getRootNav().push(PrivateLabelProfilePage, { showBackButton: true });
    let navExtras: NavigationExtras = {
      queryParams: {
        showBackButton: true,
      },
    };
    this.menuController.close();
    this.router.navigate(["property-profiles"], navExtras);
  }

  async viewProperty(p: IPropertyDto) {
    await this.communicator.sendSelectedProperty(p);
    localStorage.removeItem("Lineitems");
    this.menu.close("propertyMenu");
  }
}
