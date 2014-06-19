(function() {
	var controller = function($scope, $location) {
		$scope.disableButton = false;

		$scope.submitForm = function () {
			$scope.disableButton = true;
			
			/*
			var authorization = account.login({ userName : $scope.userName, password : $scope.password });

			authorization.then(function () {
				// Go to listing view - successfully authenticated
				$location.path("/");
			}, function (response) {
				$scope.disableButton = false;
				$scope.errorMessage = response.data.error_description;
			});
			*/
		};
	};

	angular.module('linkslap').controller("NewStreamCtrl", [ '$scope', '$location', controller ]);
}());