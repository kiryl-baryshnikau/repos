Attempt to find client that will read javascript Date object
Complete.
using pattern from JSON.stringify on revers read produces string

examined 
https://weblog.west-wind.com/posts/2014/jan/06/javascript-json-date-parsing-and-real-dates
https://stackoverflow.com/questions/4511705/how-to-parse-json-to-receive-a-date-object-in-javascript
https://stackoverflow.com/questions/46215105/angular-httpclient-custom-json-parser-jsog

It is possible to do intercepter.
The only problem - performance - it trying to parse everything as date. 
Required optimization of transferred data via metadata to know what types are returned.
We fell back to OData...
