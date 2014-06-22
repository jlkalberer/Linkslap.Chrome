(function() {
	var app = angular.module("linkslap", [ 'ngRoute', 'restangular' ]);
	
	app.config(function ($routeProvider) {
		$routeProvider
			.when('/authenticate', {
				'templateUrl' : 'includes/authenticate.html',
				'controller' : 'AuthenticateCtrl'
			})
			.when('/register', {
				'templateUrl' : 'includes/register.html',
				'controller' : 'RegisterCtrl'
			})
			.when('/new-stream', {
				'templateUrl' : 'includes/new-stream.html',
				'controller' : 'NewStreamCtrl'
			})
			.when('/', {
				'templateUrl' : 'includes/listing.html',
				'controller' : 'ListingCtrl'
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
			root.$on( "$routeChangeStart", function(event, next, current) {
				if (!auth.isAuthenticated() && next.$$route.originalPath !== '/register') {
					$location.path('/authenticate');
				}
			});
		}]);
}());