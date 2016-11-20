import { Component } from '@angular/core';
import { NavController, ToastController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {CheckLogin} from '../../../providers/check-login'
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
    creatorTitle: undefined,
    creatorLevel: undefined
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

    this.creator = params.data.creatorInformation;

    this.buttonDisabled = false;
    this.checkLogin.load()
        .then(data => {
          this.creatorValidation = data
          this.alreadyLoggedIn.data = true;
        });
              }

   uploadCreatorImage(event) {
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
