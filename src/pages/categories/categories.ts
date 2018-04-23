import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController , Platform} from 'ionic-angular';
import { Http } from '@angular/http';

// Custom
import { Core } from '../../service/core.service';

// Page
import { DetailCategoryPage } from '../detail-category/detail-category';
import { SearchPage } from '../search/search';
import { Geolocation } from '@ionic-native/geolocation';

declare var wordpress_url:string;
declare var google: any;
@Component({
	selector: 'page-categories',
	templateUrl: 'categories.html',
	providers: [Core,Geolocation]
})
export class CategoriesPage {
	@ViewChild('map') mapElement: ElementRef;
	map: any;
	@ViewChild('cart') buttonCart;
	DetailCategoryPage = DetailCategoryPage;
	SearchPage = SearchPage;
	parents:Object[] = [];
	id:Number;
	noResuilt:boolean = false;
	constructor(
		private http: Http,
		private core: Core,
		private navCtrl: NavController,
		public platform: Platform,
		private geolocation: Geolocation
	){
		core.showLoading();
		let params = {cat_num_page:1, cat_per_page:100, parent: '0'};
		let loadCategories = () => {
			http.get(wordpress_url+'/wp-json/wooconnector/product/getcategories', {
				search:core.objectToURLParams(params)
			}).subscribe(res => {
				this.parents = this.parents.concat(res.json());
				if(res.json() && res.json().length == 100){
					this.noResuilt = false;
					params.cat_num_page++;
					loadCategories();
				} else {
					this.noResuilt = true;
					core.hideLoading();
				}
			});
		};
		let initMap=() => {
			this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
    let mylocation = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 15,
      center: mylocation
    });
		let marker = new google.maps.Marker({
	 position: mylocation,
	 map: this.map,
	 draggable:true
  });
  });

		}
		loadCategories();
		platform.ready().then(() => {
    initMap();
  	});
	}
	ionViewDidEnter(){
		this.buttonCart.update();
	}
	onSwipeContent(e){
		if(e['deltaX'] < -150 || e['deltaX'] > 150){
			if(e['deltaX'] < 0) this.navCtrl.push(this.SearchPage);
			else this.navCtrl.popToRoot();
		}
	}
}
