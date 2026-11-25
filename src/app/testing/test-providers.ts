import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

// What most components and services need in a test:
// HttpClient with a fake back end (nothing is sent to the real API) and a router.
export const testProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([])
];
