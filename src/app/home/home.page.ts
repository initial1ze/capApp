import { Component, OnInit } from '@angular/core';
import {
  LocalNotifications,
  ScheduleOptions,
} from '@capacitor/local-notifications';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  constructor() {}
  ngOnInit() {
    const isPushNotificationsAvailable =
      Capacitor.isPluginAvailable('PushNotifications');
    if (isPushNotificationsAvailable) {
      this.initPush();
    }
  }

  initPush() {
    console.log('Initializing HomePage');

    PushNotifications.checkPermissions().then((check_res) => {
      if (check_res.receive !== 'granted') {
        PushNotifications.requestPermissions().then((result) => {
          if (result.receive === 'granted') {
            console.log('Request successful for LocalNotifications.');
            PushNotifications.register();
          } else {
            console.log(
              'Error while requesting permission for PushNotifications.'
            );
          }
        });
      } else {
        console.log('Permission already given for PushNotifications');
      }
    });

    LocalNotifications.checkPermissions().then((result) => {
      if (result.display !== 'granted') {
        LocalNotifications.requestPermissions().then((request_res) => {
          if (request_res.display === 'granted') {
            console.log('Request successful for LocalNotifications.');
          } else {
            console.log(
              'Error while requesting permission for LocalNotifications.'
            );
          }
        });
      } else {
        console.log('Permission already given for LocalNotifications');
      }
    });

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  scheduleNotification() {
    const options: ScheduleOptions = {
      notifications: [
        {
          id: 1,
          title: 'Local Notification',
          body: 'Test',
        },
      ],
    };

    LocalNotifications.schedule(options);
  }
}
