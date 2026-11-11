
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  ErrorHandler
} from '@angular/core';

import {
  provideRouter,
  withComponentInputBinding
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';
import { requestInterceptor } from './core/interceptors/request.interceptor';
import { GlobalErrorHandler } from './core/handlers/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([requestInterceptor])
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
};
