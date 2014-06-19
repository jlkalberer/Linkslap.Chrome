(function() {
	var app = angular.module("linkslap", [ 'ngStorage', 'restangular' ]);
	
	app.config(['RestangularProvider', 'SettingsProvider', function (rest, settings) {
			rest.setBaseUrl(settings.baseUrl);
		}]);
}());