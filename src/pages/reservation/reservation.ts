/**
 * Created by liuchao on 6/25/16.
 */
import { Component } from '@angular/core';
import { Events, NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import {CheckLogin} from '../../providers/check-login'
import {GetCalendar} from '../../providers/getCalendar'

import { Storage } from '@ionic/storage'
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { ReservationDetails } from './reservationDetails/reservationDetails';

import { NgCalendarModule  } from 'ionic2-calendar';
import moment from 'moment';

//Japan locale
import 'moment/src/locale/ja';

//China locale
import 'moment/src/locale/zh-cn';


//timezone
import 'moment-timezone';

@Component({
  selector: 'page-reservation',
  templateUrl: 'reservation.html',
  providers: [CheckLogin, GetCalendar]
})
export class Reservation {
  guider: any = {
    comment: [],
    likedBy: []
  };
  guiderDetails: any = [];
  alreadyLoggedIn = false;
  showCommentBox;
  comment;
  rate;
  guiderValidation: any = {};

  eventSource = [];
  chatEventSource = [];
  guideEventSource = [];
  viewTitle;

  isToday: boolean;
  calendar = {
    mode: 'week',
    currentDate: new Date()
  };

  serviceType;
  start = 0
  chatPricePerHour = 100;
  guidePricePerHour = 1000;


  //    reservationId;

  constructor(private params: NavParams,
    private nav: NavController,
    private popover: PopoverController,
    private events: Events,
    public storage: Storage,
    public checkLogin: CheckLogin,
    private http: Http,
    public alertCtrl: AlertController,
    private getCalendar: GetCalendar) {
    console.log("params.data is")
    console.log(params.data)
    this.events = events;

    var eventDataFromServer = []
    this.checkLogin.load()
      .then(data => {
        this.guiderValidation = data
        this.alreadyLoggedIn = true;
        console.log("checklogin loaded")
        this.getCalendar.load()
          .then(data2 => {
            if (data2[0]) {

              data2.forEach((element, index) => {
                eventDataFromServer.push({
                  _id: element._id,
                  title: element.title,
                  serviceType: element.serviceType,
                  startTime: new Date(element.startTime),
                  endTime: new Date(element.endTime),
                  allDay: element.allDay,
                  creatorName: element.creatorName,
                  guiderName: element.guiderName,
                  userName: element.username,
                  guiderNumberLimit: element.guiderNumberLimit,
                  userNumberLimit: element.userNumberLimit,
                  pricePerHour: element.pricePerHour,
                  price: element.price,
                  repeat: element.repeat
                })
              });
              console.log(this.eventSource)

              if (data2[0].serviceType === "guide") {
                this.eventSource = [].concat(eventDataFromServer)
                this.guideEventSource = this.eventSource
              } else if (data2[0].serviceType === "chat") {
                this.eventSource = [].concat(eventDataFromServer)
                this.chatEventSource = this.eventSource
              }
            }
          })
      });


    if (!this.serviceType) {
      this.serviceType = "guide"
    }

    events.subscribe('guide', (data) => {
      console.log('Welcome');
      this.guideEventSource = []

      var guiderNameArray = [];
      guiderNameArray.push(this.guiderValidation.guiderName)
      data.forEach((element, index) => {
        this.guideEventSource.push({
          _id: element._id,
          title: 'guideReservation',
          serviceType: 'guide',
          startTime: new Date(element.startTime),
          endTime: new Date(element.endTime),
          allDay: false,
          creatorName: this.guiderValidation.guiderName,
          guiderName: guiderNameArray,
          userName: [],
          guiderNumberLimit: element.guiderNumberLimit,
          userNumberLimit: element.userNumberLimit,
          pricePerHour: element.pricePerHour,
          price: element.price,
          repeat: element.repeat

        })
      });
      this.eventSource = this.guideEventSource
      console.log("guideBack")
      console.log(this.guideEventSource)

    });

    events.subscribe('chat', (data) => {
      console.log('chat');
      this.chatEventSource = []
      var guiderNameArray = [];
      guiderNameArray.push(this.guiderValidation.guiderName)
      data.forEach((element, index) => {
        this.chatEventSource.push({
          _id: element._id,
          title: 'chatReservation',
          serviceType: 'chat',
          startTime: new Date(element.startTime),
          endTime: new Date(element.endTime),
          allDay: false,
          creatorName: this.guiderValidation.guiderName,
          guiderName: guiderNameArray,
          userName: [],
          guiderNumberLimit: element.guiderNumberLimit,
          userNumberLimit: element.userNumberLimit,
          pricePerHour: element.pricePerHour,
          price: element.price,
          repeat: element.repeat

        })
      });

      this.eventSource = this.chatEventSource

    });

  }

  ionViewWillEnter() {
    // console.log("send hideTabs event")
    // this.events.publish('hideTabs');
  }
  generateId() {
    const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
      s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h))
    return ObjectId
  }
  changeMode(mode) {
    this.calendar.mode = mode;
  }

  today() {
    this.calendar.currentDate = new Date();
  }

  onViewTitleChanged(title) {
    this.viewTitle = title;
  }

  onEventSelected(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  }



  onTimeSelected(ev) {
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' + (ev.events !== undefined && ev.events.length !== 0));
    console.log(ev);
    console.log("sesesese")

    if (this.calendar.mode == "month" && this.serviceType == "guide") {
      let confirm1 = this.alertCtrl.create({
        title: 'Make reservation?',
        message: 'How many hours do you need?',
        buttons: [
          {
            text: 'choose specified hours',
            handler: () => {
              this.calendar.mode = "week"
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

    } else if (this.calendar.mode == "month" && this.serviceType == "chat") {
      let confirm2 = this.alertCtrl.create({
        title: 'Make chat reservation?',
        message: '1 hour support for any time in a day',
        buttons: [
          {
            text: '8AM~10PM support',
            handler: () => {
              this.createCallReservation(ev, "dayTime")
            }
          }, {
            text: '10PM~8AM support',
            handler: () => {
              this.createCallReservation(ev, "nightTime")
            }
          }, {
            text: '24hour support',
            handler: () => {
              this.createCallReservation(ev, "fullTime")
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
    } else if (this.calendar.mode == "week" && this.serviceType == "guide") {
      var alertType = 0;
      var theIndex;

      for (var i = 0; i < this.guideEventSource.length && alertType == 0; i++) {
        if (ev.selectedTime.getTime() == this.guideEventSource[i].startTime.getTime()) {
          alertType = 1;
          theIndex = i
        }
      }


      if (alertType === 0) {
        let confirm = this.alertCtrl.create({
          title: 'Make reservation?',
          message: 'How many hours do you need?',
          buttons: [
            {
              text: '3 hours',
              handler: () => {
                this.createEvents(ev, 3)
              }
            },
            {
              text: '5 hours',
              handler: () => {
                this.createEvents(ev, 5)
              }
            },
            {
              text: 'cancell',
              handler: () => {

              }
            }
          ]
        });
        confirm.present();
      } else if (this.guideEventSource[theIndex].username === this.guiderValidation.username) {
        let confirm = this.alertCtrl.create({
          title: 'Make reservation?',
          message: 'How many hours do you need?',
          buttons: [
            {
              text: 'delete',
              handler: () => {
                this.createEvents(ev, 999)
              }
            },
            {
              text: 'cancell',
              handler: () => {

              }
            }
          ]
        });
        confirm.present();
      } else {

        console.log("ev")
        console.log(ev)
        console.log(this.guiderValidation.username)
        console.log(this.guideEventSource)
        console.log(this.guideEventSource[theIndex].username)
        let confirm2 = this.alertCtrl.create({
          title: 'Make reservation?',
          message: 'How many hours do you need?',
          buttons: [
            {
              text: 'time is alaready reservated by other users',
              handler: () => {

              }
            }
          ]
        });
        confirm2.present();
      }
    }

  }

  createEvents(ev, h: Number) {
    if (h == 999) {
      this.guideEventSource.forEach((elementEvent, index) => {
        console.log(elementEvent.startTime.getTime())
        console.log(ev.selectedTime.getTime())
        if (ev.selectedTime.getTime() == elementEvent.startTime.getTime()) {
          console.log(index)
          this.guideEventSource.splice(index, 1);
          this.eventSource = [].concat(this.guideEventSource);

          console.log(this.eventSource)
        }
      });
    } else if (h > 24) {

    } else {
      var date = ev.selectedTime;
      var startTime, endTime;
      startTime = new Date(ev.selectedTime.getTime());
      startTime.setHours(startTime.getHours());
      endTime = new Date(ev.selectedTime.getTime());
      endTime.setHours(endTime.getHours() + h);

      var guiderNameArray = [];
      guiderNameArray.push(this.guiderValidation.guiderName)

      this.guideEventSource.push({
        _id: this.generateId(),
        title: 'guideReservation',
        serviceType: 'guide',
        startTime: startTime,
        endTime: endTime,
        allDay: false,
        creatorName: this.guiderValidation.guiderName,
        guiderName: guiderNameArray,
        userName: [],
        guiderNumberLimit: 1,
        userNumberLimit: 1,
        repeat: 0,
        pricePerHour: this.guidePricePerHour

      })
      this.eventSource = [].concat(this.guideEventSource);



      this.guideEventSource = this.eventSource;
    }
  }

  createCallReservation(ev, option: String) {
    var date = ev.selectedTime;
    var startTime, endTime;
    if (option === "dayTime") {
      startTime = new Date(ev.selectedTime.getTime());
      startTime.setHours(startTime.getHours() + 8);
      // startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
      endTime = new Date(ev.selectedTime.getTime());
      endTime.setHours(endTime.getHours() + 20);
    } else if (option === "nightTime") {
      startTime = new Date(ev.selectedTime.getTime());
      startTime.setHours(startTime.getHours() + 20);
      // startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
      endTime = new Date(ev.selectedTime.getTime());
      endTime.setHours(endTime.getHours() + 30);
    } else if (option === "fullTime") {
      startTime = new Date(ev.selectedTime.getTime());
      startTime.setHours(startTime.getHours() + 0);
      // startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
      endTime = new Date(ev.selectedTime.getTime());
      endTime.setHours(endTime.getHours() + 24);
    }

    var guiderNameArray = [];
    guiderNameArray.push(this.guiderValidation.guiderName)
    // endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
    this.chatEventSource.push({
      _id: this.generateId(),
      title: 'chatReservation',
      serviceType: 'chat',
      startTime: startTime,
      endTime: endTime,
      allDay: false,
      creatorName: this.guiderValidation.guiderName,
      guiderName: guiderNameArray,
      userName: [],
      guiderNumberLimit: 1,
      userNumberLimit: 1,
      repeat: 0,
      pricePerHour: this.chatPricePerHour

    })
    this.eventSource = [].concat(this.chatEventSource);
    this.chatEventSource = this.eventSource;
  }

  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }

  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }

  selectedChat() {
    console.log("chat")
    this.eventSource = this.chatEventSource
    this.calendar.mode = "month"
    this.serviceType = "chat"
  }

  selectedGuide() {
    this.eventSource = this.guideEventSource
    this.calendar.mode = "week"
    this.serviceType = "guide"
  }


  setReservationDetails() {

    if (this.guiderValidation.guiderName && this.guiderValidation.guiderName&&this.eventSource.length>0) {
      console.log(this.eventSource)
      this.nav.push(ReservationDetails, { eventSource: this.eventSource });
    } else if(!this.guiderValidation.guiderName){
      alert("Please sign in first !")
    } else if(this.eventSource.length==0){
      alert("No event planed!")
    }
  }

}
