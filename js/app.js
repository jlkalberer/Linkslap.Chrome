(function() {
	var app = angular.module("linkslap", [ 'ngRoute', 'restangular', 'angulartics', 'angulartics.google.analytics' ]);
	
	app.config(function ($routeProvider) {
		$routeProvider
			.when('/authenticate', {
				'templateUrl' : 'includes/authenticate.html'
			})
			.when('/forgot-password', {
				'templateUrl' : 'includes/forgot-password.html'
			})
			.when('/register', {
				'templateUrl' : 'includes/register.html'
			})
			.when('/new-stream', {
				'templateUrl' : 'includes/new-stream.html'
			})
			.when('/share-link/:subscriptionId/:url?', {
				'templateUrl' : 'includes/share-link.html'
			})
			.when('/find-gif/:subscriptionId', {
				'templateUrl' : 'includes/find-gif.html'
			})
			.when('/settings/:subscriptionId', {
				'templateUrl' : 'includes/subscription-settings.html'
			})
			.when('/', {
				'templateUrl' : 'includes/listing.html'
			})
            .otherwise({
                redirectTo: '/'
            });
		})
		.config(['$httpProvider', function ($httpProvider) {
			$httpProvider.defaults.useXDomain = true;
        	delete $httpProvider.defaults.headers.common['X-Requested-With'];
		}])
		.config(['RestangularProvider', 'SettingsProvider', function (rest, settings) {
			rest.setBaseUrl(settings.baseUrl);
		}])
		.run(['$rootScope', 'AccountService', '$location', function(root, auth, $location) {
			auth.accountLoaded.then(function (value) {
				root.$on( "$routeChangeStart", function(event, next, current) {
					var path = next.$$route.originalPath;
					if (!auth.isAuthenticated() && path !== '/register' && path !== '/forgot-password') {
						$location.path('/authenticate');
					}
				});

				if (!value) {
					$location.path('/authenticate');
				}
			});
		}]);

	app.config(function($compileProvider){
	    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
  	});

	app.filter('escape', function() {
	  return window.escape;
	});

	app.directive('imageonload', ['$parse', function($parse) {
	    return {
	        restrict: 'A',
	        link: function(scope, element, attrs) {
	        	var expressionHandler = $parse(attrs.imageonload);
	            element.bind('load', function (event, data) {
                    scope.$apply(function() {
                        event.preventDefault();
		                expressionHandler(scope, {$event:event});
		            });
                })
	        }
	    };
	}]);
}());