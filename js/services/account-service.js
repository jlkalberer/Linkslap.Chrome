(function() {
	var app = angular.module("linkslap");

	app.factory('AccountService',[ '$rootScope', 'Restangular', '$localStorage', 'Browser', function (root, rest, storage, browser) {
		var output = {
				login: function (credentials) {
					var authorization = rest.one('token').withHttpConfig({transformRequest: angular.identity});
					
					return authorization
						.customPOST(decodeURIComponent($.param({
								'grant_type':'password',
								'username': credentials.userName,
								'password': credentials.password
							})), '', {}, { 
								'Content-Type' : 'application/x-www-form-urlencoded'
							})
						.then(function (response) {
							storage.auth = response;

							root.$emit('account.loggedin', response);
							browser.$trigger('account.loggedin', response);

							return response;
						});
				},
				logOut: function () {
					storage.auth = null;
					root.$emit('account.loggedout');
		        	browser.$trigger('account.loggedout', null);
				},
				getAccount: function () {
					return storage.auth;
				},
				isAuthenticated: function () {

					if (!output.getAccount()) {
						return false;
					}

					return true;
				},
				register: function (model) {
					return rest.one("api/account").customPOST(model, 'register');
				}
			};

		for (var key in output) {
			browser.$on('account.' + key.toLowerCase(), output[key]);
		}

		rest.addFullRequestInterceptor(function (element, operation, route, url, headers, params, httpConfig) {
			if (output.isAuthenticated()) {
				headers.Authorization = 'Bearer ' + storage.auth.access_token;
			}

		    return {
		        element: element,
		        headers: headers,
		        params: params,
		        httpConfig: httpConfig
		    };
		});

		rest.setErrorInterceptor(function (response, deferred, responseHandler) {
		    if(response.status === 401) {
		    	output.logOut();

		        return false; // error handled
		    }

		    return true; // error not handled
		});
		
		return output;
	}]);
}());