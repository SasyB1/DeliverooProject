import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { TranslateService, TranslateStore } from '@ngx-translate/core';

bootstrapApplication(AppComponent, appConfig).then((appRef) => {
  const translateService = appRef.injector.get(TranslateService);
  const translateStore = appRef.injector.get(TranslateStore); 
  translateService.setDefaultLang('it');
  translateService.use('it');
});
