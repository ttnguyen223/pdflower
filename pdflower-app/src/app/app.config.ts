import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()), provideFirebaseApp(() => initializeApp({ projectId: "pdflower-e42fd", appId: "1:839079857956:web:a1e6a107635ece5e7cedb1", storageBucket: "pdflower-e42fd.firebasestorage.app", apiKey: "AIzaSyAFvzX9AaGLohf_wcHYRpVD-iPxcuPRcG4", authDomain: "pdflower-e42fd.firebaseapp.com", messagingSenderId: "839079857956", measurementId: "G-W4KDWMEN4B" })), provideFirestore(() => getFirestore())
    //provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "pdflower-e42fd", appId: "1:839079857956:web:a1e6a107635ece5e7cedb1", storageBucket: "pdflower-e42fd.firebasestorage.app", apiKey: "AIzaSyAFvzX9AaGLohf_wcHYRpVD-iPxcuPRcG4", authDomain: "pdflower-e42fd.firebaseapp.com", messagingSenderId: "839079857956", projectNumber: "839079857956", version: "2" })), provideFirestore(() => getFirestore())
  ]
};
