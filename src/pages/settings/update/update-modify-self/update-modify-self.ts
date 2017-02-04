import { Component } from '@angular/core';
import { NavController, ToastController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {CheckLogin} from '../../../../providers/check-login'
import {Storage} from '@ionic/storage'

/*
  Generated class for the UpdateModifySelf page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-update-modify-self',
  templateUrl: 'update-modify-self.html',
        providers:[CheckLogin]
})
export class UpdateModifySelfPage {

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
    guiderTitle: undefined,
    guiderLevel: undefined
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



  constructor(private params: NavParams,
              public navCtrl: NavController,
              private http: Http,
                       public storage:Storage,
                public checkLogin:CheckLogin,
              private toastCtrl: ToastController
              ) {

    this.guider = params.data.guiderInformation;

    this.buttonDisabled = false;
    this.checkLogin.load()
        .then(data => {
          this.guiderValidation = data
          this.alreadyLoggedIn.data = true;
        });
              }

   uploadGuiderImage(event) {
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
