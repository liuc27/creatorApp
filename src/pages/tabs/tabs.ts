import { Component } from '@angular/core';

import { UploadPage } from '../upload/upload';
import { UpdatePage } from '../update/update';
import { SettingsPage } from '../settings/settings';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = UploadPage;
  tab2Root: any = UpdatePage;
  tab3Root: any = SettingsPage;

  constructor() {

  }
}
