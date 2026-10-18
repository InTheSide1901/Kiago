
import { getAuth } from 'firebase/auth';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { initializeApp } from 'firebase/app';



bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
