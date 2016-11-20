import { Component } from '@angular/core';
import { NavController, Events, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {CheckLogin} from '../../providers/check-login'
import {Storage} from '@ionic/storage'

declare var ImgWarper: any;


@Component({
  templateUrl: 'settings.html',
      providers:[CheckLogin]

})
export class SettingsPage {

  PointDefiner: any;
  Warper: any;
  Point: any;
  Animator: any;
  creatorName: String;
  password: String;
  creatorValidation = {
    creatorName: undefined,
    password: undefined
  }
  alreadyLoggedIn = {data:false};


  public creator = {
    creatorName: undefined,
    password: undefined,
    creatorImageURL: "",
    creatorIntroduction: undefined,
      creatorTitle:null,
      creatorLevel:null
  };

  uploadedImg = {data: undefined};
  year : number;
  month :number;
  day :number;
  buttonDisabled : boolean;

  categories = [
    '一级',
    '二级',
    '经验',
    '网络',
  ]






  constructor(public navCtrl: NavController, private events: Events,
              private http: Http,
                       public storage:Storage,
                public checkLogin:CheckLogin,
              private toastCtrl: ToastController
  ) {
    this.buttonDisabled = false;
    this.checkLogin.load()
        .then(data => {
          this.creatorValidation = data
          this.alreadyLoggedIn.data = true;
        });
  }


  uploadcreatorImageURL(event) {
    console.log("upla")
    var eventTarget = event.srcElement || event.target;
    //console.log( eventTarget.files);
    //console.log( eventTarget.files[0].name);

    var file = eventTarget.files[0];
    var reader = new FileReader();
    var self = this;

    reader.onload = function (e) {
      self.creator.creatorImageURL = reader.result;
      self.presentToast()

    }
    reader.readAsDataURL(file);
  }

  presentToast() {
    let toast = this.toastCtrl.create({
      message: '添加成功',
      duration: 2000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log(' ');
    });

    toast.present();
  }

  login(){
    this.creatorValidation.creatorName = this.creator.creatorName
    this.creatorValidation.password = this.creator.password
    console.log(this.creatorValidation)
    this.http.post('http://localhost:8080/api/creatorLogin',this.creatorValidation)
      .map(res => res.json())
      .subscribe(data => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        if(data.data == "OK"){
          console.log(data)
          this.storage.set('creatorValidation',this.creatorValidation).then((data) => {

            if (data == null) console.log("error");
            else {
              this.alreadyLoggedIn.data = true;
              alert("login sucessfully")
              location.reload();
            }
          });
        }else if(data.data == "NO"){
          alert("account already exists and the password was wrong")
        }else{
          alert("not exist ,pls register")
        }
      });
  }

logout(){
    this.creator.creatorName = null
    this.creator.password = null

    this.alreadyLoggedIn.data = false
    console.log(this.alreadyLoggedIn)
        this.storage.remove('creatorValidation').then(data1 => {
          console.log(data1)
          console.log("data1")  
        })
}
  replaceCreator() {
    this.buttonDisabled = true;
    if (this.creator.creatorName) {

      var request: any = {};



      if (this.creator.creatorName) {
        request.creatorName = this.creator.creatorName;
      }

      if (this.creator.password) {
        request.password = this.creator.password;
      }

      if (this.creator.creatorImageURL) {
        request.creatorImageURL = this.creator.creatorImageURL;
      }

      if (this.creator.creatorIntroduction) {
        request.creatorIntroduction = this.creator.creatorIntroduction;
      }

      if (this.creator.creatorLevel) {
        request.creatorLevel = this.creator.creatorLevel;
      }

      if (this.creator.creatorTitle) {
        request.creatorTitle = this.creator.creatorTitle;
      }

      console.log(request);

      this.http.post("http://localhost:8080/api/creatorRegister", request)
              .map(res => res.json())
        .subscribe(data => {
            console.log(data.data);
            alert(data.data)
            this.buttonDisabled = false;
          },

          (err) => {
            console.log("error");
            this.buttonDisabled = false;
          }
        )
    }else{
      alert("请填写化妆师名和密码!")
      this.buttonDisabled = false;

    }
  }
}
