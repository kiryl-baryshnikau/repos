Research of Angular i18n
https://blog.dangl.me/archive/serving-localized-angular-single-page-applications-with-aspnet-core/

WebApplication1
Base application

WebApplication2
Localization example from 
https://angular.io/guide/i18n
https://angular.io/generated/zips/i18n/i18n.zip

WebApplication3
We cannot do CLI for multiple languages
https://angular.io/guide/i18n#merge-the-completed-translation-file-into-the-app
The CLI development server (ng serve) can only be used with a single locale.

WebApplication4 
Do i18n at least for production according to 
https://blog.dangl.me/archive/serving-localized-angular-single-page-applications-with-aspnet-core/
Notes:
2/13/2020: If new angular always have "aot" should i suspend this research?
2/14/2020: I bleieve I guess how to do localization for services: the same way as environment: we need to add *.ts file that will have all translations in it and plug it during colmpilation accordingly. The same for registering locale.
2/14/2020: End Of Research: Success: localization of views is plugged by angular i18n, localizatin of service with build replacement; Switch language via extension to Spa Static files.
Works only for production mode but debuggable on local service by build-prod (no CLI at that time)