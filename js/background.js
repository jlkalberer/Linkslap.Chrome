(function() {
	return;
	
	var app = angular.module("linkslap", [ 'ngStorage', 'restangular', 'SignalR' ]);

	app.run(['$localStorage', 'Settings', 'Restangular', 'AccountService', function (store, settings, rest, account) {
		// If this is a fresh install, set the lastUpdated so it doesn't pull down the entire stream
		if (!store.lastUpdated) {
			store.lastUpdated = moment.utc(settings.dateFormat);
		}

		// check if authenticated
		if (!account.isAuthenticated()) {

		}

		var a = account.getAccount();

		// pull down streams
		// communicate with popup
	}]);
}());