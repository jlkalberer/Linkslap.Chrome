(function() {
	var app = angular.module("linkslap", [ 'ngRoute', 'restangular' ]);
	
	app.config(function ($routeProvider) {
		$routeProvider
			.when('/authenticate', {
				'templateUrl' : 'includes/authenticate.html'
			})
			.when('/register', {
				'templateUrl' : 'includes/register.html'
			})
			.when('/new-stream', {
				'templateUrl' : 'includes/new-stream.html'
			})
			.when('/share-link/:subscriptionId', {
				'templateUrl' : 'includes/share-link.html'
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
					if (!auth.isAuthenticated() && next.$$route.originalPath !== '/register') {
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

}());