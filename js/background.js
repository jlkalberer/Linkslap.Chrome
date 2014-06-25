(function() {
	var app = angular.module("linkslap", [ 'ngStorage', 'restangular' ]);

	app.config(['RestangularProvider', 'SettingsProvider', function (rest, settings) {
			rest.setBaseUrl(settings.baseUrl);
		}]);

	app.run(['$localStorage', 'Settings', 'Restangular', 'AccountService', 'Linkslap', function (store, settings, rest, account, linkslap) {
		// Run this as it means Chrome is starting up...
		storage.lastUpdated = moment.utc().format(settings.dateFormat);
	}]);
}());