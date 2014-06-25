(function() {
	var app = angular.module("linkslap", [ 'ngStorage', 'restangular' ]);

	app.config(['RestangularProvider', 'SettingsProvider', function (rest, settings) {
			rest.setBaseUrl(settings.baseUrl);
		}]);

	// This will initialize link and set the browser
	// TODO: use messaging so the browser will not need to be set to the window object.
	app.run(['Link', 'Browser', function (link, browser) {
		window.browser = browser;
	}]);
}());