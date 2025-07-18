import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes'; // <<< ENSURE THIS IMPORT IS PRESENT

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient() // <<< ENSURE THIS IS PRESENT
  ]
};
