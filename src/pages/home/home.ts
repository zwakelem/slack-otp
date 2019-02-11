import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Http } from '@angular/http';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BackgroundMode } from '@ionic-native/background-mode';
declare var SMS: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  otp = '';
  constructor(public navCtrl: NavController, private http: Http, private platform: Platform, private androidPermissions: AndroidPermissions, private backgroundMode: BackgroundMode) {
  }

  ionViewWillEnter() {
    if(this.platform.is('core') || this.platform.is('mobileweb')) {
      console.log("is on browser")
    } else {
      // this.backgroundMode.enable();
      this.readListSMS();
      console.log("is on mobile device");
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_SMS).then(
        result => console.log('Has permission?',result.hasPermission),
        err => {
          console.log("failed to check permissions", err);
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS)
        }
      );
      
      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_SMS]).then(result =>{
        console.log("permissions requested",result);
      }, err =>{
        console.log("failed to request permission", err);
      });
    }
  }

  ionViewDidEnter() {

    // this.platform.ready().then((readySource) => {
    //   if(this.platform.is('core') || this.platform.is('mobileweb')) {
    //     console.log("is on browser")
    //   } else {
    //     if (SMS) SMS.startWatch(() => {
    //       console.log('watching started');
    //     }, Error => {
    //       console.log('failed to start watching');`
    //     });
  
    //     document.addEventListener('onSMSArrive', (e: any) => {
    //       var sms = e.data;
    //       console.log(sms);
    //       alert(sms)
    //     });
    //   }

    // });
  }

  sendSlackMessage() {
    const url = 'https://hooks.slack.com/services/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';
    const messageText = {
      'text': this.otp
    };
    return this.http.post(url, JSON.stringify(messageText))
      .subscribe(res => {
        alert('Message successfully posted');
      }, error => {
        alert('Failed to post message');
      });
  }

  findOtp(array: Array<any>): string {
    let result ="";
    array.forEach(sms =>{
      if(sms.body.toLowerCase().includes("use this code for microsoft verification")){
        result = sms.body.substring(0,sms.body.indexOf("\n"));
      }
    })
    return result;
  }

  readListSMS()
  {
  
  this.platform.ready().then((readySource) => {
  
  let filter = {
         box : 'inbox', // 'inbox' (default), 'sent', 'draft'
         indexFrom : 0, // start from index 0
         maxCount : 10, // count of SMS to return each time
              };
  
         if(SMS) SMS.listSMS(filter, (listSms)=>{
             console.log("Sms",listSms);
             if(listSms){
               this.otp = this.findOtp(listSms);
             }
            },
  
            Error=>{
            console.log('error list sms: ' + Error);
            });
       
      });
  }

}
