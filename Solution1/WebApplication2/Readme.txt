How to make dependencies in ClientApp/angular.json
Right now i have to do following:
ng build default-lib
ng build extension-lib
ng build WebApplication2

Must be 
ng build

Attempt to do:
    "build": "ng build default-lib && ng build extension-lib && ng build WebApplication2",
Does not work