import { Routes } from '@angular/router';

// This file is typically used for defining routes that are specific to the server-side rendering
// context, or for re-exporting the main application routes for SSR.
// In most cases, it simply re-exports the client-side routes.

// Import the main application routes
import { routes } from './app.routes';

// Re-export the main application routes for server-side rendering.
export const appRoutes: Routes = routes;
