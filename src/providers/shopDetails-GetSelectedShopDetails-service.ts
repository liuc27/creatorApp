import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
 Generated class for the ProductListsGetSelectedProductLists provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class getSelectedShopDetails {
  data: any;

  constructor(private http: Http) {
    this.data = null;
  }

  load(query) {
    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
          this.http.post('http://localhost:8080/api/findProductByGuiderName', query)
            .map(res => res.json())
            .subscribe(data => {
              console.log(data);
              this.data = data;
              resolve(this.data);

            })
    });
  }
}
