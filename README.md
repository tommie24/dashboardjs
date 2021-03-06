# DashboardJS

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)


DashboardJS is a Javascript/jQuery Library that handles dashboard events, async views, XHR requests and responses/notifications and form handling allow you to concentrate on your front-end app logic. This Library is suitable for building typical dashboard based applications simple or complex.

## Install

Include dashboard.js in your .html or view file

```html
<script src="scripts/lib/dashboard.js"></script>
```

## Usage
You can access the global Dashboard, Event, Global, Actions and Handler objects. All functionality is attached to these objects.

```js
var data = Dashboard.serializeFormData();

Dashboard.actionAjax('route/to/your/server', data, function(response) {
	console.log(response);
	
	// Do whatever you want with response
});
```
## Contributing

Contributions are welcome, [Check Here](https://github.com/krecent/dashboardjs/graphs/contributors) :)

## Documentation

Still working on documentation.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
