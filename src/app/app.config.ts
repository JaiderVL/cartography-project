import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp({"projectId":"cartography-project-cb7ef","appId":"1:9332522344:web:c704ce068dbb24c162eadd","storageBucket":"cartography-project-cb7ef.appspot.com","apiKey":"AIzaSyDjvopFBwLgUi4rWbEriM-SwtA76vyGbO4","authDomain":"cartography-project-cb7ef.firebaseapp.com","messagingSenderId":"9332522344","measurementId":"G-ZQFF71VX3N"})), provideFirestore(() => getFirestore())]
};
