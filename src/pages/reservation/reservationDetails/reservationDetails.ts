/**
 * Created by liuchao on 6/25/16.
 */
import { Component } from '@angular/core';
import { ActionSheetController, Events, NavController, NavParams, AlertController } from 'ionic-angular';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { CheckLogin } from '../../../providers/check-login'

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import moment from 'moment';
//Japan locale
import 'moment/src/locale/ja';

//China locale
import 'moment/src/locale/zh-cn';


//timezone
import 'moment-timezone';

@Component({
  selector: 'page-reservationDetails',
  templateUrl: 'reservationDetails.html',
  providers: [CheckLogin]
})
export class ReservationDetails {
  product;
  chatroomId;
  productOrGuider;
  productDetails;
  alreadyLoggedIn = false;
  guiderValidation: any = {};
  url: SafeResourceUrl;
  eventList = {
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString()
  }
  guidePrice = 1000;
  chatPrice = 100;
  totalPrice = 0;
  eventSource: any;
  eventSourceISO: any;
  serviceType;

  constructor(private params: NavParams,
    private nav: NavController,
    private actionSheet: ActionSheetController,
    private events: Events,
    private sanitizer: DomSanitizer,
    public checkLogin: CheckLogin,
    public alertCtrl: AlertController,
    private http:Http) {
    this.eventSourceISO = params.data.eventSource;
    this.eventSourceISO.forEach((element, index) => {
      element.startTime = moment(element.startTime).format()
      element.endTime = moment(element.endTime).format()
    });

    this.checkLogin.load()
      .then(data => {
        this.guiderValidation = data
        this.alreadyLoggedIn = true;
      });

    if (this.eventSourceISO) {
      if (this.eventSourceISO[0].serviceType === "guide") {
        this.serviceType = "guide"
      } else if (this.eventSourceISO[0].serviceType === "chat") {
        this.serviceType = "chat"
      }

    }

    this.recaculateTotalDefaultPrice()
    console.log(this.eventSourceISO);



    this.productOrGuider = "product";
    console.log(params.data);
    this.actionSheet = actionSheet;
    this.url = sanitizer.bypassSecurityTrustResourceUrl('https://appear.in/charlie123456789');

  }

  addReservation(x) {
    console.log(x)
    for (var i = 0; i < this.eventSourceISO.length; i++) {
      if (i === x) {
        this.eventSourceISO.push({
          _id: this.eventSourceISO[i]._id,
          title: this.eventSourceISO[i].title,
          serviceType: this.eventSourceISO[i].serviceType,
          startTime: this.eventSourceISO[i].endTime,
          endTime: this.eventSourceISO[i].endTime,
          allDay: this.eventSourceISO[i].allDay,
          guiderName: this.eventSourceISO[i].guiderNameArray,
          userName: this.eventSourceISO[i].userNameArray,
          guiderNumberLimit: 1,
          userNumberLimit: 1,
          repeat: 0,
          pricePerHour: this.eventSourceISO[i].pricePerHour,
          price: 0
        }
        );
      }
    }
    console.log(this.eventSourceISO)
  }

  cancellReservation(x) {
    console.log(x)
    for (var i = 0; i < this.eventSourceISO.length; i++) {
      if (i === x) {
        if (this.eventSourceISO[i].price) {
          this.totalPrice -= this.eventSourceISO[i].price
        }
        this.eventSourceISO.splice(i, 1);
      }
    }
    console.log(this.eventSourceISO)
  }

  changeReservationPrice(event) {
    let confirm1 = this.alertCtrl.create({
      title: 'Change Price',
      message: 'How many hours do you need?',
      inputs: [
        {
          name: 'pricePerHour',
          placeholder: 'Input Price here'
        },
      ],
      buttons: [
        {
          text: 'input price',
          handler: data => {
            if (data) {
              event.pricePerHour = Number(data.pricePerHour);;
              console.log(data);
              this.recaculateTotalDefaultPrice()
            }
          }
        },
        {
          text: 'cancell',
          handler: () => {
          }
        }
      ]
    });
    confirm1.present();
  }

  changeCustomerNumber(event) {
    let confirm2 = this.alertCtrl.create({
      title: 'Change customer number',
      message: 'How many customers do you need?',
      inputs: [
        {
          name: 'userNumberLimit',
          placeholder: 'Input customer number here'
        },
      ],
      buttons: [
        {
          text: 'input number',
          handler: data => {
            if (data) {
              event.userNumberLimit = Number(data.userNumberLimit);;
              console.log(data);
              this.recaculateTotalDefaultPrice()

            }
          }
        },
        {
          text: 'cancell',
          handler: () => {

          }
        }
      ]
    });
    confirm2.present();
  }

  changeGuiderNumber(event) {
    let confirm3 = this.alertCtrl.create({
      title: 'Change service Provider number',
      message: 'How many service Providers do you need?',
      inputs: [
        {
          name: 'guiderNumberLimit',
          placeholder: 'Input service provider number here'
        },
      ],
      buttons: [
        {
          text: 'input a number',
          handler: data => {
            if (data) {
              event.guiderNumberLimit = Number(data.guiderNumberLimit);;
              console.log(data);
              this.recaculateTotalDefaultPrice()

            }
          }
        },
        {
          text: 'cancell',
          handler: () => {

          }
        }
      ]
    });
    confirm3.present();
  }

  recaculateTotalDefaultPrice() {
    this.totalPrice = 0;
    if (this.eventSourceISO) {
      for (var i = 0; i < this.eventSourceISO.length; i++) {
        console.log(this.eventSourceISO.length)
        if (this.eventSourceISO[i].serviceType && this.eventSourceISO[i].startTime && this.eventSourceISO[i].endTime) {
          console.log(this.eventSourceISO[i].serviceType)
          var duration = moment.duration(moment(this.eventSourceISO[i].endTime).diff(moment(this.eventSourceISO[i].startTime)));
          var hours = duration.asHours();
          var price = this.eventSourceISO[i].pricePerHour * hours * this.eventSourceISO[i].userNumberLimit/this.eventSourceISO[i].guiderNumberLimit;
          this.eventSourceISO[i].price = price;
          this.totalPrice += price;
        }
      }
    }
  }

  shareActionSheet() {
    let actionSheet = this.actionSheet.create({
      title: 'SHARE',
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: 'Facebook',
          icon: 'logo-facebook',
          handler: () => {
            console.log('Delete clicked');
          }
        },
        {
          text: 'email',
          icon: 'ios-mail',
          handler: () => {
            console.log('Share clicked');
          }
        },
        {
          text: 'Wechat',
          icon: 'arrow-dropright-circle',
          handler: () => {
            console.log('Play clicked');
          }
        },
        {
          text: 'Twitter',
          icon: 'logo-twitter',
          handler: () => {
            console.log('Favorite clicked');
          }
        },
        {
          text: 'Google',
          icon: 'logo-google',
          handler: () => {
            console.log('Favorite clicked');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          icon: 'md-close',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();

  }



  openOauth(x) {
    console.log(x)
    alert("will soon add this function")
  }

  makeOffer() {
    console.log(this.eventSourceISO)
    console.log(this.guiderValidation)
    var offer : any = {};

    offer.guiderName = this.guiderValidation.guiderName
    offer.password = this.guiderValidation.password
    offer.event = this.eventSourceISO
    console.log(offer)
    this.http.post('http://localhost:8080/api/createOffers',offer)
      .map(res => res.json())
      .subscribe(data => {
        console.log(data)
    })

  }
  ionViewWillLeave() {
    console.log("leave")
    if (this.serviceType == "guide") {
      this.events.publish('guide', this.eventSourceISO);
    } else if (this.serviceType == "chat") {
      this.events.publish("chat", this.eventSourceISO);
    }
  }

}
