angular.module('linkslap')
	.constant('$', $)
	.factory('Hub', ['$', '$timeout', 'Settings', function ($, $timeout, settings) {
		//This will allow same connection to be used for all Hubs
		//It also keeps connection as singleton.
		var reconnect = 30000, globalConnection = $.hubConnection(settings.baseUrl + "signalr");
		globalConnection.disconnected(function() {
		   $timeout(function() {
		       location.reload();
		   }, reconnect); // Restart connection after 5 seconds.
		});

		return function (hubName, listeners, methods) {
			var Hub = this;
			Hub.connection = globalConnection;
			Hub.proxy = Hub.connection.createHubProxy(hubName);
			Hub.on = function (event, fn) {
				Hub.proxy.on(event, fn);
			};
			Hub.invoke = function (method, args) {
				return Hub.proxy.invoke.apply(Hub.proxy, arguments)
			};

			if (listeners) {
				angular.forEach(listeners, function (fn, event) {
					Hub.on(event, fn);
				});
			}
			if (methods) {
				angular.forEach(methods, function (method) {
					Hub[method] = function () {
						var args = $.makeArray(arguments);
						args.unshift(method);
						return Hub.invoke.apply(Hub, args);
					};
				});
			}
			
			// Adding additional property of promise allows to access it in rest of the application.
			Hub.promise = Hub.connection.start();	
			Hub.promise.done(function () {
				reconnect = 0; // Set this to zero so that it wont take 60 seconds to reload the plugin.
			});
			
			return Hub;
		};
	}]);