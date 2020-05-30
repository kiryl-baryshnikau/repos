Target: Find what Angular2 provides for form data management and validation
WebApplication1:
	Check if what https://www.toptal.com/angular-js/angular-4-forms-validation is correct. Run examples, find what must be improved
	Results: For phones array it uses object instead of array. So it can do ony objects. It can be OK if ID of record is used as key. So the task in reality is not implemented. 
	Required: Separate research.
WebApplication2:
	Research One: how to do arrays.
	We need to use trackByfor arrays or it will rerender all the time - so we need something like TrackByPropertyPipe from
	https://www.bennadel.com/blog/3579-using-pure-pipes-to-generate-ngfor-trackby-identity-functions-in-angular-7-2-7.htm
	ToDO
	https://blog.bitsrc.io/angular-optimization-use-trackby-option-for-ngfor-directive-72c9509b2be9
	https://dzone.com/articles/why-we-shound-not-use-function-inside-angular-temp
	Research Two: how to create custom input that works with ngModel, has value property etc.
	https://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel