(function() {
	var controller = function($scope, account, $location, browser) {
		$scope.disableButton = false;

		$scope.submitForm = function () {
			$scope.disableButton = true;
			
			var authorization = browser.login({ userName : $scope.userName, password : $scope.password });

			authorization.then(function () {
				// Go to listing view - successfully authenticated
				$location.path("/");
			}, function (response) {
				$scope.disableButton = false;
				$scope.errorMessage = response.data.error_description;
			});

		};
	};

	angular.module('linkslap').controller("AuthenticateCtrl", [ '$scope', 'AccountService', '$location', 'Browser', controller ]);
}());