(function() {
	var app = angular.module("linkslap");

	app.factory('AccountService', [ 'Browser', 'Restangular', function (browser, rest) {
		var account = null,
			output = {
				login: function (credentials) {
					return browser.$trigger('account.login', credentials).then(function(value) {
						return account = value;
					});
				},
				logOut: function () {
					account = null;
					return browser.$trigger('account.logout').then(function() {
						account = null;
					});
				},
				getAccount: function () {
					return account;
				},
				isAuthenticated: function () {

					if (!this.getAccount()) {
						return false;
					}

					return true;
				},
				register: function (model) {
					return browser.$trigger('account.register', model);
				},
				// This is used in the main app.js in order to go to the auth screen if the user hasn't logged in
				accountLoaded: browser.$trigger('account.getaccount').then(function (value) {
					return account = value;
				})
			};



		rest.addFullRequestInterceptor(function (element, operation, route, url, headers, params, httpConfig) {
			if (output.isAuthenticated()) {
				headers.Authorization = 'Bearer ' + account.access_token;
			}

		    return {
		        element: element,
		        headers: headers,
		        params: params,
		        httpConfig: httpConfig
		    };
		});

		return output;
	}]);
}());