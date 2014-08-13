(function() {
	var app = angular.module("linkslap", [ 'ngRoute', 'restangular', 'angulartics', 'angulartics.google.analytics', 'ui.bootstrap' ]);
	
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
			.when('/stream/:streamKey', {
				'templateUrl' : 'includes/stream.html'
			})
			.when('/missed-listing/:streamKey', {
				'templateUrl' : 'includes/missed-listing.html'
			})
			.when('/settings', {
				'templateUrl' : 'includes/subscription-settings.html'
			})
			.when('/remove-subscription/:subscriptionId', {
				'templateUrl' : 'includes/remove-subscription.html'
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

	app.directive('focus', ['$timeout', function($timeout) {
        return {
            scope: {
                trigger: '@focus'
            },
            link: function(scope, element) {
                scope.$watch('trigger', function(value) {
                    if (value === "true") {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
            }
        }
    }]);
}());