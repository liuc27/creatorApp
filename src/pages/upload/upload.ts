import { Component } from '@angular/core';
import { NavController, Events, ToastController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

declare var ImgWarper: any;

import {CheckLogin} from '../../providers/check-login'
import {Storage} from '@ionic/storage'

@Component({
  templateUrl: 'upload.html',
        providers:[CheckLogin]
})
export class UploadPage {

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

  public product:any = {};

  uploadedImg = {data: undefined};
  f = {api_key: undefined, api_id: undefined, api_secret: undefined, img: undefined, face_id: undefined,category:undefined};
  year : number;
  month :number;
  day :number;
  buttonDisabled : boolean;

  categories = [
    'funding',
    'investment',
    'beauty',
    'accounting',
        'language',
    'operator',
    'skill',
    'childcare',
        'true'
  ]

  constructor(public navCtrl: NavController, private events: Events,
              private http: Http,
              public storage:Storage,
              private toastCtrl: ToastController,
              private checkLogin: CheckLogin
  ) {
    this.buttonDisabled = false;
        this.checkLogin.load()
        .then(data => {
          this.guiderValidation = data
          this.product.guiderName = data.guiderName;
          this.product.password = data.password;
          this.alreadyLoggedIn.data = true;
        });

    this.f.api_key = "0ef14fa726ce34d820c5a44e57fef470";
    this.f.api_secret = "4Y9YXOMSDvqu1Ompn9NSpNwWQFHs1hYD";

    // this.PointDefiner = ImgWarper.PointDefiner;
    // this.Warper = ImgWarper.Warper;
    // this.Animator = ImgWarper.Animator;


  }


  uploadImage(event) {
    console.log("upla")
    var eventTarget = event.srcElement || event.target;
    //console.log( eventTarget.files);
    //console.log( eventTarget.files[0].name);

    var file = eventTarget.files[0];
    var reader = new FileReader();
    var self = this;

    reader.onload = function (e) {
      self.product.imageURL = reader.result;
      self.presentToast()

    }
    reader.readAsDataURL(file);

  }

  uploadFaceImage(event) {
    console.log("upla")
    var eventTarget = event.srcElement || event.target;
    //console.log( eventTarget.files);
    //console.log( eventTarget.files[0].name);

    var file = eventTarget.files[0];
    var reader = new FileReader();
    var self = this;

    reader.onload = function (e) {
      self.uploadedImg.data = reader.result;
      //console.log(self.uploadedImg);
      //var addon ={"img": atob(reader.result.split(',')[1])};
      //Object.assign( self.f,  self.f, addon);
      self.product.faceImage = reader.result;

      self.f.img = atob(reader.result.split(',')[1]);

      self.getFaceLandmarks(self.f, reader.result);

    }
    reader.readAsDataURL(file);
  }

  getFaceLandmarks(f, readerResult) {

    var self = this;
    var buff = new ArrayBuffer(f.img.length);
    var arr = new Uint8Array(buff);

// blobの生成
    for (var i = 0, dataLen = f.img.length; i < dataLen; i++) {
      arr[i] = f.img.charCodeAt(i);
    }
    var blob = new Blob([arr], {type: 'image/png'});

    var formData = new FormData();
    formData.append('img', blob);

    this.http.post('http://apicn.faceplusplus.com/v2/detection/detect' + '?api_key=' + f.api_key + '&api_secret=' + f.api_secret, formData)
      .map(res => res.json())
      .subscribe(faceLandmarks => {
        // we've got back the raw data, now generate the core schedule data
        // and save the data for later reference
        console.log(faceLandmarks);

        if(faceLandmarks.face.length<1){
          alert("无法监测到人脸！")
        }else {
          // console.log(faceLandmarks1.face[0].position);
          self.f.face_id = faceLandmarks.face[0].face_id;

          this.http.get('http://apicn.faceplusplus.com/v2/detection/landmark' + '?api_key=' + f.api_key + '&api_secret=' + f.api_secret + '&face_id=' + f.face_id + '&type=83p')
            .map(res => res.json())
            .subscribe(landmarkResult => {


              var array = Object.keys(landmarkResult.result[0].landmark).map(key => landmarkResult.result[0].landmark[key]);
              var array1 = Object.keys(landmarkResult.result[0].landmark).map(key => key);

              for (var i = 0; i < array.length; i++) {
                if (typeof array[i] != "object") {
                  array.splice(i, 1);
                }
              }

              for (var i = 0; i < array1.length; i++) {
                if (array1[i] == "height" || array1[i] == "width") {
                  array1.splice(i, 1);
                }
              }
              var oldKeyArray = [].concat(array1);

              var facePoints = array;
              array1.sort();
              for (var i = 0; i < array1.length; i++) {
                var j = oldKeyArray.indexOf(array1[i]);
                facePoints[i] = array[j];
              }


              var image = new Image();
              var self = this;

              image.onload = function () {
                console.log(facePoints)
                self.product.faceImagePoints = facePoints;
                self.product.faceImageHeight = image.naturalHeight;
                self.product.faceImageWidth = image.naturalWidth;


                if (facePoints != undefined) {
                  //alert("添加成功!");
                  self.presentToast()
                } else {
                  alert("添加失败!");
                }
                console.log(this.width);
              }

              image.src = readerResult;
            });
        }
      },
        error =>  {
          alert("添加失败")
        });
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

  replaceProduct() {
    this.buttonDisabled = true;
    if (this.product.guiderName && this.product.productName) {
      this.product.name = this.product.guiderName + "." + this.product.productName;


      console.log(this.product)

      this.http.post("http://localhost:8080/api/product", this.product)
        .subscribe(data => {
            console.log(data);
            alert(data.statusText)
            this.buttonDisabled = false;
          },

          (err) => {
            console.log("error");
            this.buttonDisabled = false;
          }
        )
    }else{
      alert("请填写化妆师名,产品名!")
      this.buttonDisabled = false;

    }
  }
}
