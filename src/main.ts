import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { initializeApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';
import { environment } from './environments/environment.prod'; // Asegúrate de importar el entorno correcto

// Inicialización explícita de Firebase Performance
const app = initializeApp(environment.firebase);
const perf = getPerformance(app);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));