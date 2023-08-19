import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
// TODO: remove the '../../..' and use the "~" or whatever
// TODO: remove the " and use '
import { Deeplinks } from "@ionic-native/deeplinks/ngx";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser/ngx";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { AlertController, LoadingController, MenuController, ModalController, NavController, Platform, ToastController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { Constants } from "src/app/common/Constants";
import { Credential } from "src/app/models/Credential";
import { ICompanyTypeDto } from "src/app/models/dto/interfaces/ICompanyTypeDto";
import { BasePage } from "src/app/pages/base/base.page";
import { AccountService } from "src/app/services/account/account.service";
import { CompanyTypesService } from "src/app/services/company-types/company-types.service";
import { FirebaseAuthService } from "src/app/services/FirebaseAuth/firebase-auth.service";
import { PrivateLabelService } from "src/app/services/private-label/private-label.service";
import { UserDetailsService } from "src/app/services/user-details/user-details.service";
import { UxNotifierService } from "src/app/services/uxNotifier/ux-notifier.service";
import { IUserDto } from "../../../../models/dto/interfaces/IUserDto";
import { IUserTypeDto } from "../../../../models/dto/interfaces/IUserTypeDto";
import { FirebaseUser } from "../../../../models/FirebaseUser";
import { AuthService } from "../../../../services/auth.service";
import { UserTypesService } from "../../../../services/user-types/user-types.service";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.page.html",
  styleUrls: ["./sign-in.page.scss"],
})
export class SignInPage extends BasePage {
  private constants: Constants;

  signInForm = new FormGroup({
    email: new FormControl("", [Validators.required]),
    password: new FormControl("", [Validators.required]),
  });

  constructor(
    private safariViewController: SafariViewController,
    private deeplinks: Deeplinks,
    public authService: AuthService,
    // ionic
    public platform: Platform,
    private storage: Storage,
    // angular
    public router: Router,
    // framework controllers
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public navController: NavController,
    public modalCtrl: ModalController,
    public menuController: MenuController,
    public toastCtrl: ToastController,
    private inAppBrowser: InAppBrowser,
    // services
    private accountService: AccountService,
    private companyTypesService: CompanyTypesService,
    private privatelabelService: PrivateLabelService,
    private userService: UserDetailsService,
    public userTypesService: UserTypesService,
    public uxNotifierService: UxNotifierService,
    private firebaseAuth: FirebaseAuthService
  ) {
    super(navController, null, null, null, platform, router, uxNotifierService, userTypesService, null);
    this.constants = new Constants();

    this.AppInsights.trackEvent({
      name: "SignInPage.Constructor()",
      properties: [{}],
    });
    //this.generateChallenge();

    localStorage.removeItem("IsPropertiesFetched");
    localStorage.removeItem("ProfileItem");
    localStorage.removeItem("Metattachments");
    localStorage.removeItem("User");
    localStorage.removeItem("ProfileItemLineItems");
    localStorage.removeItem("IsMetattachment");
    localStorage.removeItem("ActiveItem");
    localStorage.removeItem("LineItem");
    localStorage.removeItem("Lineitems");
    localStorage.removeItem("Properties");
    localStorage.removeItem("ActiveAttachmentItem");
    localStorage.removeItem("CurrentView");
  }

  async ngOnInit() {
    console.log("ionViewDidLoad SigninPage");

    this.AppInsights.trackEvent({
      name: "SignInPage.ngOnInit()",
      properties: [{}],
    });
    //this.AppInsights.trackPageView({ name: 'SigninPage' });

    this.menuController.enable(false, "propertyMenu");
    this.menuController.enable(false, "mainMenu");

    await this.getCompanyTypeInformation();
    await this.getUserTypes();
  }

  // TODO: rename "SignInWithEmail" or something like that
  async signIn() {
    if (this.signInForm.valid) {
      const credential = new Credential();
      credential.email = this.signInForm.value.email;
      credential.password = this.signInForm.value.password;

      await this.firebaseAuth.signInWithEmail(credential).then(async (x: any) => {
        if (x) {
          await this.next();
        } else {
          this.uxNotifierService.showToast("Invalid Credentials", "danger");
        }

        return;
      });
    } else {
      this.uxNotifierService.showToast("Fill all the fields to continue", "danger");
    }
  }

  async signInGoogle() {
    this.firebaseAuth
      .signInGoogle()
      .then((a: FirebaseUser) => {
        this.AppInsights.trackEvent({
          name: "SignInPage.signInGoogle().then()",
          properties: [{}],
        });
        this.next();
      })
      .catch((err) => {});
  }

  async signInApple() {
    this.firebaseAuth
      .signInApple()
      .then((a: any) => {
        this.AppInsights.trackEvent({
          name: "SignInPage.signInApple().then()",
          properties: [{}],
        });
        if (a) {
          this.next();
        } else {
          this.uxNotifierService.showToast("Error occured while signing with apple.", "danger");
        }
      })
      .catch((err) => {});
  }

  async signInFb() {
    this.firebaseAuth
      .signInFacebook()
      .then((a: FirebaseUser) => {
        this.next();
      })
      .catch((err) => {});
  }

  async signUp() {
    this.navController.navigateForward(["sign-up"]);
  }

  private async getCompanyTypeInformation() {
    // load the company types (if they aren't in local storage)
    let areCompanyTypesInLocalStorage = false;
    // TODO: move to Base class
    // TODO: move most, if not all storage stuff to Base class
    this.storage.get("CompanyTypes").then((x) => {
      if (x && x == true) {
        areCompanyTypesInLocalStorage = true;
      }
    });

    this.AppInsights.trackEvent({
      name: "SignInPage.getCompanyTypeInformation()",
      properties: [
        {
          areCompanyTypesInLocalStorage: areCompanyTypesInLocalStorage,
        },
      ],
    });

    if (!areCompanyTypesInLocalStorage) {
      this.companyTypesService.getCompanyTypes().subscribe((x: any) => {
        this.CompanyTypes = x.map((a: any) => {
          let b: ICompanyTypeDto = {} as ICompanyTypeDto;
          b.Id = a.Id;
          b.Name = a.Name;
          return b;
        });
        this.storage.set("CompanyTypes", x);

        this.AppInsights.trackEvent({
          name: "SignInPage.getCompanyTypeInformation().companyTypesService.getCompanyTypes(): success",
          properties: [
            {
              CompanyTypes: x,
            },
          ],
        });
      });
    }
  }

  private async getUserTypes() {
    this.userTypesService.getAllUserTypes().subscribe((response: Array<IUserTypeDto>) => {
      this.UserTypes = response;
      console.log(this.UserTypes);
    });
  }

  private async getUser() {
    await this.accountService
      .getUser()
      .then(async (x: IUserDto) => {
        if (x === undefined || x === null) {
          const user: any = {
            Email: this.firebaseAuth.FirebaseUser.email,
            Types: [{ Id: 0, IsActive: null, Name: "Owner" }], //TODO: need to not default to owner, maybe here need to ask user for their type
            // and then go into other registration screens (give option to save for later)
            FullName: this.firebaseAuth.FirebaseUser.displayName,
            Provider: this.firebaseAuth.FirebaseUser.provider,
            ProviderUniqueId: this.firebaseAuth.FirebaseUser.uid,
          };

          await this.accountService
            .signUp(user)
            .then(async (x) => {
              await this.refreshUser();
            })
            .catch(async (e) => {
              this.AppInsights.trackEvent({
                name: "SignInPage.next().getUser().accountService().catch()",
                properties: [{ Error: e.message }],
              });
              throw e;
            });
        } else {
          this.User = x;
        }
      })
      .catch((e) => {
        console.log("error", e);
        this.AppInsights.trackEvent({
          name: "SignInPage.next().getUser().catch()",
          properties: [{ Error: e.message }],
        });
      });
  }

  async refreshUser() {
    await this.accountService
      .getUser()
      .then(async (x: IUserDto) => {
        this.User = x;
      })
      .catch((e) => {
        console.log("error", e);
        this.AppInsights.trackEvent({
          name: "SignInPage.refreshUser().getUser().catch()",
          properties: [{ Error: e.message }],
        });
      });
  }

  async next() {
    if (this.User === undefined || this.User === null || this.User.Email === undefined || this.User.Email === null || this.User.Email === "") {
      await this.refreshUser()
        .then(async () => {
          await this.finish();
        })
        .catch((e) => {
          console.log("error", e);
          this.AppInsights.trackEvent({
            name: "SignInPage.next().getUser().catch()",
            properties: [{ Error: e.message }],
          });
        });
    } else {
      await this.finish();
    }
  }

  async finish() {
    this.router.navigate(["dashboard"]);
  }
}
