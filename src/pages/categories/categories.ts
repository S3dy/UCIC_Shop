import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { NavController , Platform} from 'ionic-angular';
import { Http ,Headers } from '@angular/http';
import { AlertController } from 'ionic-angular';
// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { StorageMulti } from '../../service/storage-multi.service';

// Page
import { DetailCategoryPage } from '../detail-category/detail-category';
import { SearchPage } from '../search/search';
import { Geolocation } from '@ionic-native/geolocation';
import {} from '@types/googlemaps';
declare var wordpress_url:string;
//declare var google: any;
declare let cordova: any;
@Component({
	selector: 'page-categories',
	templateUrl: 'categories.html',
	providers: [StorageMulti,Core,Geolocation]
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
	lang:string='ar';
	//marker: any;
	 vars: any  = {
		vendorid:0,
		};
	data: any = {};
	isLogin: boolean=false;
	startshopping:boolean =false;
	constructor(
		private http: Http,
		private core: Core,
		private navCtrl: NavController,
		public platform: Platform,
		private storage: Storage,
		private geolocation: Geolocation,
		private toast: Toast,
		private cd:ChangeDetectorRef,
		private storageMul: StorageMulti,
		public alertCtrl: AlertController
	){
		core.showLoading();
		//this.locations.push({name:'home',latitude:21.312269359774167,longitude:39.22146383056622});

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
this.forceLocation();
	let areaCoords =[];
	let polygons= [];
	for(var key in polygons){
  this.zones.push({polygon:new google.maps.Polygon({
	paths: polygons[key],

	strokeColor: "#00FF00",
	strokeOpacity: 0.8,
	strokeWeight: 3,
	fillColor: "#00FF00",
	fillOpacity: 0.35
}), vendorid:58+Number(key)});
this.selectvendor();
this.cd.detectChanges();
}


			google.maps.event.addListener(this.map,'bounds_changed', ()=> {
					this.marker.setPosition(this.map.getCenter());
					this.selectvendor();
					this.cd.detectChanges();
					//this.selectedaddress= null;
				});
    this.initMap();
		this.loadZones();
		core.hideLoading();
		setTimeout(this.selectvendor(),2000);
		this.getData();


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

		this.takemylocation();

	}

	takemylocation(){
		cordova.plugins.locationAccuracy.canRequest(function(canRequest){
	    if(canRequest){
	        cordova.plugins.locationAccuracy.request(function (success){
	            console.log("Successfully requested accuracy: "+success.message);
	        }, function (error){
	           console.error("Accuracy request failed: error code="+error.code+"; error message="+error.message);
	           if(error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED){
	               if(window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")){
	                   cordova.plugins.diagnostic.switchToLocationSettings();
	               }
	           }
	        }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
	    }else{
	        // request location permission and try again
	    }
	});

							this.geolocation.getCurrentPosition({ maximumAge: 3000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
								let mylocation = new google.maps.LatLng(resp.coords.latitude,resp.coords.longitude);
								this.map.setCenter(mylocation);
							}).catch((error) => {
								//this.toast.show(`Location service isn't enabled in your device. Kindly enable location permissions to the app for accurate positioning.`, '5000', 'center')
								console.log('Error getting location', error);
								//this.initMapMarkers(mylocation);
								const alert = this.alertCtrl.create({
								title: 'GPS Support',
								subTitle: 'Please enable location support for better service - فضلا قم بتفعيل خدمة تحديد المواقع لنتمكن من خدمتك بشكل افضل',
								buttons: ['OK - موافق']
							});
							alert.present();
							this.selectvendor();
							this.cd.detectChanges();
							});

	}
	initMapMarkers(mylocation){
		this.map.setCenter(mylocation);
	//	this.initMapListeners();
	}
	locate(selectedaddress){
		console.log(selectedaddress);
		console.log(this.selectedaddress,"is the selected value");
		let newlocation = new google.maps.LatLng(this.selectedaddress.latitude,this.selectedaddress.longitude);
		this.map.setCenter(newlocation);
	}

	loadZones(){
		this.zones = [];
		this.http.get(wordpress_url + '/wp-json/wooconnector/product/vendormap').subscribe(data => {
		//console.log(data.json());
		var points = data.json();

		for(var key in points){
			this.zones.push({polygon:new google.maps.Polygon({
			paths: points[key],

			strokeColor: "#00FF00",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FFFF00",
			fillOpacity: 0.35
		}), vendorid: key})

		}

		console.log(this.zones);

		for(var key in this.zones)
		this.zones[key].polygon.setMap(this.map);
	 });

	}

	getData() {
		this.storageMul.get(['login', 'user','lang']).then(val => {
			if (val) {
				if (val["login"] && val["login"]["token"]) {
					this.data["login"] = val["login"];
					this.isLogin = true;
					this.cd.detectChanges();
					this.data['order'] = 0;
					let params = { post_num_page: 1, post_per_page: 1000 };
					let loadOrder = () => {
						let headers = new Headers();
						headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
						headers.set('Authorization', 'Bearer ' + this.data["login"]["token"]);
						this.http.get(wordpress_url + '/wp-json/wooconnector/product/useraddress', {
							headers: headers,
							search: this.core.objectToURLParams(params)
						}).subscribe(res => {
						/*	if (Array.isArray(res.json())) this.data['order'] += res.json().length;
							if (res.json().length == 1000) {
								params['post_num_page']++;
								*/
								this.locations = res.json();
								this.cd.detectChanges();

						//	} else this.loadedOrder = true;
						});
					};
				}
				if (val["user"]) this.data["user"] = val["user"];
				if (val["lang"]) this.lang = val["lang"];

			}
		});
	}
	selectvendor(){
		var location =this.map.getCenter();
		for(var key in this.zones){
			if( google.maps.geometry.poly.containsLocation(location, this.zones[key].polygon) ) {
				this.vars.vendorid = this.zones[key].vendorid;
				this.storage.set('vendor', this.vars.vendorid);
				this.storage.set('orderlocation', location);
				console.log(this.vars.vendorid);
				return;
			}
		}
		this.vars.vendorid = 0;
		console.log(this.vars.vendorid);

	}

	forceLocation(){

	}

}
