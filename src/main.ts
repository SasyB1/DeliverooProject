import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [...appConfig.providers, provideRouter(routes)],
}).then((appRef) => {
  const translateService = appRef.injector.get(TranslateService);
  const savedLanguage = localStorage.getItem('language') || 'it';
  translateService.setDefaultLang(savedLanguage);
  translateService.use(savedLanguage);
});
