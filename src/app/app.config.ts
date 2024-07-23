import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }), provideAnimationsAsync(), provideFirebaseApp(() => initializeApp(environment.firebase)), provideFirestore(() => getFirestore()), provideFirebaseApp(() => initializeApp({"projectId":"crud-user-48870","appId":"1:764024493175:web:e0b770dc9c9510ac48a272","storageBucket":"crud-user-48870.appspot.com","apiKey":"AIzaSyBC4QzdbtEa06OfcpKe6jJvBNe-ycdrdk4","authDomain":"crud-user-48870.firebaseapp.com","messagingSenderId":"764024493175"})), provideFirestore(() => getFirestore())]
};
