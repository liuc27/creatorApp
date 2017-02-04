import { Component } from '@angular/core';
import { NavController, Events, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { UpdatePage } from './update/update';

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
  guiderName: String;
  password: String;
  guiderValidation = {
    guiderName: undefined,
    password: undefined
  }
  alreadyLoggedIn = {data:false};


  public guider = {
    guiderName: undefined,
    password: undefined,
    guiderImageURL: "",
    guiderIntroduction: undefined,
      guiderTitle:null,
      guiderLevel:null
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
          this.guiderValidation = data
          this.alreadyLoggedIn.data = true;
        });
  }


  uploadguiderImageURL(event) {
    console.log("upla")
    var eventTarget = event.srcElement || event.target;
    //console.log( eventTarget.files);
    //console.log( eventTarget.files[0].name);

    var file = eventTarget.files[0];
    var reader = new FileReader();
    var self = this;

    reader.onload = function (e) {
      self.guider.guiderImageURL = reader.result;
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
    this.guiderValidation.guiderName = this.guider.guiderName
    this.guiderValidation.password = this.guider.password
    console.log(this.guiderValidation)
    this.http.post('http://localhost:8080/api/guiderLogin',this.guiderValidation)
      .map(res => res.json())
      .subscribe(data => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        if(data.data == "OK"){
          console.log(data)
          this.storage.set('guiderValidation',this.guiderValidation).then((data) => {

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
    this.guider.guiderName = null
    this.guider.password = null

    this.alreadyLoggedIn.data = false
    console.log(this.alreadyLoggedIn)
        this.storage.remove('guiderValidation').then(data1 => {
          console.log(data1)
          console.log("data1")
        })
}
  replaceGuider() {
    this.buttonDisabled = true;
    if (this.guider.guiderName) {

      var request: any = {};



      if (this.guider.guiderName) {
        request.guiderName = this.guider.guiderName;
      }

      if (this.guider.password) {
        request.password = this.guider.password;
      }

      if (this.guider.guiderImageURL) {
        request.guiderImageURL = this.guider.guiderImageURL;
      }

      if (this.guider.guiderIntroduction) {
        request.guiderIntroduction = this.guider.guiderIntroduction;
      }

      if (this.guider.guiderLevel) {
        request.guiderLevel = this.guider.guiderLevel;
      }

      if (this.guider.guiderTitle) {
        request.guiderTitle = this.guider.guiderTitle;
      }

      console.log(request);

      this.http.post("http://localhost:8080/api/guiderRegister", request)
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
