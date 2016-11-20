/**
 * Created by liuchao on 6/25/16.
 */
import {Component, ViewChild, ElementRef} from '@angular/core';
import {Events, NavController, NavParams, PopoverController} from 'ionic-angular';
import {getSelectedShopDetails} from '../../providers/shopDetails-GetSelectedShopDetails-service';
import {CheckLogin} from '../../providers/check-login'
import {Storage} from '@ionic/storage'
import {UpdateModifyProductPage} from'./update-modify-product/update-modify-product'
import {UpdateModifySelfPage} from'./update-modify-self/update-modify-self'

import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Component({
  selector: 'page-update',
  templateUrl: 'update.html',
    providers:[getSelectedShopDetails,CheckLogin]
})
export class UpdatePage {
    @ViewChild('popoverContent', {read: ElementRef}) content: ElementRef;
    @ViewChild('popoverText', {read: ElementRef}) text: ElementRef;
    shop = {
      creatorName:null,
      password:null,
      creatorImageURL:"",
      creatorComment:[],
      creatorIntroduction:null,
      creatorTitle:null,
      creatorLevel:null
    }
    productOrShop;
    shopDetails;
  alreadyLoggedIn = false;
  showCommentBox;
  comment;
  rate;
  creatorValidation = {
    creatorName: undefined,
    password: undefined
  };

    constructor(private params: NavParams,
    private nav:NavController,
    private popover: PopoverController,
    private events: Events,
                public storage:Storage,
                public checkLogin:CheckLogin,
                private http:Http,
    public shopDetailsService:getSelectedShopDetails) {
      
      this.storage.get('creatorValidation').then(data1 => {
      if(data1!=null&&data1!=undefined){

        console.log(data1)
        this.http.post('http://localhost:8080/api/findCreator',data1)
          .map(res => res.json())
          .subscribe(data2 => {
            console.log(data2)
              this.shop = data2;
              this.loadSelectedShopDetails(this.shop);
        })
      
      }
      else alert("login first")
      })
      this.events = events;

      
        this.popover = popover;
      this.checkLogin.load()
        .then(data => {
          this.creatorValidation = data
          this.alreadyLoggedIn = true;
        });

    }

    ionViewWillEnter() {
        // console.log("send hideTabs event")
        // this.events.publish('hideTabs');
    }

    loadSelectedShopDetails(query) {
        this.shopDetailsService.load(query)
          .then(data => {
            this.shopDetails = data;
            console.log("shopDetail")
            console.log(data)
          })
    }

  modifyProduct(product){

  this.nav.push(UpdateModifyProductPage,{product:product});

  //   if (this.creatorValidation.creatorName == undefined) {
  //     alert("login before use,dude")
  //   }else{
  //     var likedProduct = {
  //       name: product.name,
  //       creatorName: this.validation.username,
  //       password: this.validation.password
  //     }
  //     console.log(product.likedBy);

  //     this.http.post('http://localhost:8080/api/likeProduct',likedProduct)
  //       .map(res => res.json())
  //       .subscribe(data => {
  //         // we've got back the raw data, now generate the core schedule data
  //         // and save the data for later reference
  //         // alert(data);

  //         console.log(data)
  //         //var flag = data[_body]

  //         var flag = data.data
  //         if(flag=="push"){
  //           product.likedBy.push(this.validation.username);
  //         }else if(flag=="pull"){

  //           var index = product.likedBy.indexOf(this.validation.username);
  //           if (index > -1) {
  //             product.likedBy.splice(index, 1);
  //           }
  //         }
  //         console.log(product.likedBy);

  //       });
  //   }
  }


  modifySelfIntroduction(shop){

      this.nav.push(UpdateModifySelfPage,{creatorInformation:shop});

  //   if (this.validation.username == undefined) {
  //     alert("login before use,dude")
  //   }else{
  //     var likedCreator = {
  //       name: shop.name,
  //       username: this.validation.username,
  //       password: this.validation.password
  //     }
  //     console.log(shop.likedBy);

  //     this.http.post('http://localhost:8080/api/likeCreator',likedCreator)
  //       .map(res => res.json())
  //       .subscribe(data => {
  //         // we've got back the raw data, now generate the core schedule data
  //         // and save the data for later reference
  //         // alert(data);

  //         console.log(data)
  //         //var flag = data[_body]

  //         var flag = data.data
  //         if(flag=="push"){
  //           shop.likedBy.push(this.validation.username);
  //         }else if(flag=="pull"){

  //           var index = shop.likedBy.indexOf(this.validation.username);
  //           if (index > -1) {
  //             shop.likedBy.splice(index, 1);
  //           }
  //         }
  //         console.log(shop.likedBy);

  //       });
  //   }
  console.log("selfIntro")
  console.log(shop)
  }

  

    openProductDetailsPage(product){
        console.log("detail open");
        // this.nav.push(ProductDetails,{product:product});
    }

  sendComment(){
    console.log(this.shop)
  //   var commentData:any = {}
  //   var now = new Date()
  //   commentData.discussion_id = this.shop._id
  //   commentData.parent_id = null
  //   commentData.posted = now.toUTCString()
  //   commentData.username = this.validation.username
  //   commentData.password = this.validation.password
  //   commentData.text = this.comment
  //   commentData.rate = this.rate
  //   console.log(commentData)
  //   this.http.post('http://localhost:8080/api/addShopComment',commentData)
  //   //.map(res => res.json())
  //     .subscribe(data => {
  //       // we've got back the raw data, now generate the core schedule data
  //       // and save the data for later reference
  //       console.log(data)
  //       this.shop.comment.unshift(commentData);
  //       this.comment = null
  //       this.showCommentBox = !this.showCommentBox
  //     });
  }
}
