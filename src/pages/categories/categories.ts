import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
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
import {} from '@types/googlemaps';
declare var wordpress_url:string;
//declare var google: any;
@Component({
	selector: 'page-categories',
	templateUrl: 'categories.html',
	providers: [Core,Geolocation]
})
export class CategoriesPage {
	@ViewChild('gmap') gmapElement: any;
	map: google.maps.Map;
	marker: google.maps.Marker;
	zones:any[]=[];
	@ViewChild('cart') buttonCart;
	DetailCategoryPage = DetailCategoryPage;
	SearchPage = SearchPage;
	parents:Object[] = [];
	id:Number;
	noResuilt:boolean = false;
	locations:Object[]=[];
	selectedaddress:any;
	//marker: any;
	 vars: any  = {
		vendorid:0,
		};
	startshopping:boolean =false;
	constructor(
		private http: Http,
		private core: Core,
		private navCtrl: NavController,
		public platform: Platform,
		private storage: Storage,
		private geolocation: Geolocation,
		private toast: Toast,
		private cd:ChangeDetectorRef
	){
		core.showLoading();
		this.locations.push({name:'home',latitude:21.312269359774167,longitude:39.22146383056622});


		platform.ready().then(() => {
			let mylocation = new google.maps.LatLng(21.312269359774167,39.22146383056622);
			var mapprop = {
				zoom: 15,
				center: mylocation,
				zoomControl: false,
				mapTypeControl: true,
				scaleControl: false,
				streetViewControl: false,
				rotateControl: false,
				fullscreenControl: false
			};
			this.map = new google.maps.Map(this.gmapElement.nativeElement, mapprop );
			 this.marker=new google.maps.Marker({
				map:this.map,
				position:mylocation,
			});
	let areaCoords =[];
	let polygons= [[new google.maps.LatLng(21.900216599713712, 39.26352186791996),
new google.maps.LatLng(21.77874622576213, 39.25695699462881),
new google.maps.LatLng(21.634324312406413, 39.26148565063477),
new google.maps.LatLng(21.52497094318719, 39.325537164306525),
new google.maps.LatLng(21.38587025480786, 39.45049482666013),
new google.maps.LatLng(21.306485976883167, 39.40502910156238),
new google.maps.LatLng(21.299028720410007, 39.212980761718654),
new google.maps.LatLng(21.46085532457363, 39.16530126953114),
new google.maps.LatLng(21.59893339647663, 39.113535766601444),
new google.maps.LatLng(21.72211282270258, 39.076706750488256),
new google.maps.LatLng(21.843088795736765, 39.0379937607421),
new google.maps.LatLng(21.932692605067366, 39.00609951171873)],
[new google.maps.LatLng(21.440071522591765, 39.86615254609376),
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
new google.maps.LatLng(21.439896795992443, 39.82141863593756)]];
	for(var key in polygons){
  this.zones.push({polygon:new google.maps.Polygon({
	paths: polygons[key],

	strokeColor: "#00FF00",
	strokeOpacity: 0.8,
	strokeWeight: 3,
	fillColor: "#00FF00",
	fillOpacity: 0.35
}), vendorid:58+Number(key)});
}
for(var key in this.zones)
this.zones[key].polygon.setMap(this.map);

			google.maps.event.addListener(this.map,'bounds_changed', ()=> {
					this.marker.setPosition(this.map.getCenter());
					this.selectvendor();
					this.cd.detectChanges();
					//this.selectedaddress= null;
				});
    this.initMap();
		core.hideLoading();
		this.selectvendor();


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
	initMap(){

		this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
			let mylocation = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
			this.initMapMarkers(mylocation);
		}).catch((error) => {
			this.toast.show(`Location service isn't enabled in your device. Kindly enable location permissions to the app for accurate positioning.`, '5000', 'center')
			console.log('Error getting location', error);
			//this.initMapMarkers(mylocation);

		});

	}

	takemylocation(){
		console.log('taking back my location');
		this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
			let mylocation = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
			this.map.setCenter(mylocation);
		}).catch((error) => {
			this.toast.show(`Location service isn't enabled in your device. Kindly enable location permissions to the app for accurate positioning.`, '5000', 'center')
			console.log('Error getting location', error);
			//this.initMapMarkers(mylocation);

		});

	}
	initMapMarkers(mylocation){
		this.map.setCenter(mylocation);
	//	this.initMapListeners();
	}
	locate(selectedaddress){
		console.log(selectedaddress,"is the selected value");
		this.map.setCenter(new google.maps.LatLng(selectedaddress.latitude,selectedaddress.longitude));
	}


	selectvendor(){
		var location =this.map.getCenter();
		for(var key in this.zones){
			if( google.maps.geometry.poly.containsLocation(location, this.zones[key].polygon) ) {
				this.vars.vendorid = this.zones[key].vendorid;
				this.storage.set('vendor', this.vars.vendorid);
				this.storage.set('orderlocation', location);

				return;
			}
		}
		this.vars.vendorid = 0;
	}

}
