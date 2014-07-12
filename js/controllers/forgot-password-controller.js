(function() {
	var controller = function($scope, account, $location) {
		$scope.showSuccess = false;
		$scope.disableButton = false;

		$scope.submitForm = function () {
			$scope.showSuccess = true;
			$scope.disableButton = true;
			
			return;

			var authorization = account.login({ userName : $scope.userName, password : $scope.password });

			authorization.then(function () {
				// Go to listing view - successfully authenticated
				$location.path("/");
			}, function (response) {
				$scope.disableButton = false;
				$scope.errorMessage = response.data.error_description;
			});

		};
	};

	angular.module('linkslap').controller("ForgotPasswordCtrl", [ '$scope', 'AccountService', '$location', controller ]);
}());