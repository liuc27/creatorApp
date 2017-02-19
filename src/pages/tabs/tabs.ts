import { Component } from '@angular/core';

import { UploadPage } from '../upload/upload';
import { SettingsPage } from '../settings/settings';
import { Reservation } from '../reservation/reservation';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = UploadPage;
  tab2Root: any = Reservation;
  tab3Root: any = SettingsPage;

  constructor() {

  }
}
