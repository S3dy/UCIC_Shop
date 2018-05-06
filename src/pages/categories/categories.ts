import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController , Platform} from 'ionic-angular';
import { Http } from '@angular/http';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

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
	public areamap=[];
	marker;
	vendorid=0;

	constructor(
		private http: Http,
		private core: Core,
		private navCtrl: NavController,
		public platform: Platform,
		private storage: Storage,
		private geolocation: Geolocation,
		private Toast: Toast,
	){
		core.showLoading();
		this.areamap[58] = new google.maps.Polygon({
		paths: [new google.maps.LatLng(21.41504803916235, 39.25614042871098),
		new google.maps.LatLng(21.39949308208154, 39.346907556152246),
		new google.maps.LatLng(21.314035940293635, 39.329978540039065),
		new google.maps.LatLng(21.26940401302275, 39.31540914306629),
		new google.maps.LatLng(21.25922089539485, 39.28844648681638),
		new google.maps.LatLng(21.2553, 39.26769999999988),
		new google.maps.LatLng(21.2504, 39.237699999999904),
		new google.maps.LatLng(21.2543, 39.20649999999989),
		new google.maps.LatLng(21.26529, 39.19249999999988),
		new google.maps.LatLng(21.28625970522107, 39.175583703613256),
		new google.maps.LatLng(21.3450975901386, 39.1808160263671),
		new google.maps.LatLng(21.385787796792904, 39.19904689941404)],
		strokeColor: "#00FF00",
		strokeOpacity: 0.8,
		strokeWeight: 3,
		fillColor: "#00FF00",
		fillOpacity: 0.35
		});

		this.areamap[59] = new google.maps.Polygon({
		paths: [new google.maps.LatLng(21.440071522591765, 39.86615254609376),
		new google.maps.LatLng(21.42611367070063, 39.88928509101561),
		new google.maps.LatLng(21.4090824, 39.90291180000008),
		new google.maps.LatLng(21.385885610961964, 39.916151546093715),
		new google.maps.LatLng(21.36002995473438, 39.91665471015631),
		new google.maps.LatLng(21.34363396852816, 39.895564900585896),
		new google.maps.LatLng(21.324662178292847, 39.866251546093736),
		new google.maps.LatLng(21.335598581019322, 39.8171987628906),
		new google.maps.LatLng(21.361938381445487, 39.79770559882809),
		new google.maps.LatLng(21.392179132364202, 39.787999080273494),
		new google.maps.LatLng(21.426063065778216, 39.7970079533203),
		new google.maps.LatLng(21.439896795992443, 39.82141863593756)],
		strokeColor: "#00FF00",
		strokeOpacity: 0.8,
		strokeWeight: 3,
		fillColor: "#00FF00",
		fillOpacity: 0.35
		});
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
			let updateVendor= (position)=>{
			console.log(this.areamap);
			for (var key in this.areamap){
				if(this.areamap[key])
				if( google.maps.geometry.poly.containsLocation(this.marker.position, this.areamap[key]) ) {
					this.vendorid = Number(key);
					return;
				}
			}
			this.vendorid = 0;
			console.log(this.vendorid);
		};
		this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
    let mylocation = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 15,
      center: mylocation
    });
	this.marker = new google.maps.Marker({
	 position: mylocation,
	 map: this.map,
	 draggable:true
  });
for (var key in this.areamap){
	this.areamap[key].setMap(this.map);
	if( google.maps.geometry.poly.containsLocation(this.marker.position, this.areamap[key]) ) {
		this.vendorid = Number(key);
		return;
	}
}
this.map.addListener('center_changed', function() {
	    // 3 seconds after the center of the map has changed, pan back to the
	    // marker.
	  });
this.marker.addListener('dragend', updateVendor);


updateVendor(this.marker.position);
}).catch((error) => {
	this.toast.show(`Location service isn't enabled in your device. Kindly enable location permissions to the app for accurate positioning.`, '5000', 'center')
  console.log('Error getting location', error);
	let mylocation = new google.maps.LatLng(21.312269359774167,39.22146383056622);
	this.map = new google.maps.Map(this.mapElement.nativeElement, {
		zoom: 15,
		center: mylocation
	});
this.marker = new google.maps.Marker({
 position: mylocation,
 map: this.map,
 draggable:true
});
for (var key in this.areamap){
this.areamap[key].setMap(this.map);
if( google.maps.geometry.poly.containsLocation(this.marker.position, this.areamap[key]) ) {
	this.vendorid = Number(key);
	return;
}
}
this.map.addListener('center_changed', function() {
		// 3 seconds after the center of the map has changed, pan back to the
		// marker.
	});
this.marker.addListener('dragend', updateVendor);


updateVendor(this.marker.position);
});
;

		}
		loadCategories();
		platform.ready().then(() => {
    initMap();

  	});
	}
	ionViewDidEnter(){
		this.buttonCart.update();
	}
	startShopping() {
	//this.navCtrl.pop(DetailCategoryPage);
	}
	onSwipeContent(e){
		if(e['deltaX'] < -150 || e['deltaX'] > 150){
			if(e['deltaX'] < 0) this.navCtrl.push(this.SearchPage);
			else this.navCtrl.popToRoot();
		}
	}


}
