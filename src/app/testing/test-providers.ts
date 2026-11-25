import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

export const testProviders = [
  provideHttpClient(withXhr()),
  provideHttpClientTesting(),
  provideRouter([])
];
