  import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
  import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
  import { provideHttpClient } from '@angular/common/http';

  import { routes } from './app.routes';
  import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
  import { getFirestore, provideFirestore } from '@angular/fire/firestore';
  import { provideAuth, getAuth } from '@angular/fire/auth';
  import { provideStorage, getStorage } from '@angular/fire/storage';
  import { environment } from '../environments/environment';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', 
        anchorScrolling: 'enabled'
      })), 
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
      provideStorage(() => getStorage()),
      provideHttpClient(),
    ]
  };
