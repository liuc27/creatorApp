import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { UpdatePage } from '../pages/settings/update/update';
import { SettingsPage } from '../pages/settings/settings';
import { UploadPage } from '../pages/upload/upload';
import { Reservation } from '../pages/reservation/reservation';
import { ReservationDetails } from '../pages/reservation/reservationDetails/reservationDetails';

import { TabsPage } from '../pages/tabs/tabs';
import {UpdateModifyProductPage} from'../pages/settings/update/update-modify-product/update-modify-product'
import {UpdateModifySelfPage} from'../pages/settings/update/update-modify-self/update-modify-self'

import { Storage } from '@ionic/storage';

import {HttpModule,Http} from '@angular/http';
import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate/ng2-translate';

import { Ionic2RatingModule } from 'ionic2-rating/module';
import { NgCalendarModule } from 'ionic2-calendar';


@NgModule({
  declarations: [
    MyApp,
    UpdatePage,
    SettingsPage,
    UploadPage,
    Reservation,
    ReservationDetails,
    TabsPage,
    UpdateModifyProductPage,
    UpdateModifySelfPage
  ],
  imports: [
    HttpModule,
    NgCalendarModule,
    IonicModule.forRoot(MyApp, {tabsHideOnSubPages:"true"}),
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: translateLoaderFactory,
      deps: [Http]
    }),
    Ionic2RatingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    UpdatePage,
    SettingsPage,
    UploadPage,
    Reservation,
    ReservationDetails,
    TabsPage,
    UpdateModifyProductPage,
    UpdateModifySelfPage
  ],
  providers: [
    Storage, {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}

export function translateLoaderFactory(http: any) {
  return new TranslateStaticLoader(http, 'assets/i18n', '.json');
}
