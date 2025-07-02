import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

// This file defines the specific configuration for server-side rendering.
// It merges the base application configuration with server-specific providers.
const serverConfig: ApplicationConfig = {
  providers: [
    // Provides server-side rendering capabilities.
    provideServerRendering()
  ]
};

// Merges the base application configuration (appConfig) with the server-specific configuration (serverConfig).
// This ensures that all client-side providers are also available on the server,
// along with the server-rendering specific providers.
export const config = mergeApplicationConfig(appConfig, serverConfig);
