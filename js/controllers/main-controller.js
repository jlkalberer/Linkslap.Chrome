(function() {
	var controller = function($scope, account, $location) {
		$scope.isAuthenticated = function() {
			return account.isAuthenticated();
		};

		$scope.logOut = function() {
			account.logOut();
			$location.path('/authenticate');
		}
	};

	angular.module('linkslap').controller("MainCtrl", [ '$scope', 'AccountService', '$location', controller ]);
}());