(function() {
	var controller = function($scope, $location, rest, browser) {
		$scope.showSuccess = false;
		$scope.disableButton = false;

		$scope.submitForm = function () {
			$scope.disableButton = true;
			
			rest.one("api/account")
				.customPOST({ email : $scope.email }, 'resetpassword')
				.then(function (result) {
					$scope.errorMessage = [];
					$scope.showSuccess = true;
					// Go to listing view - successfully authenticated
					// browser.toast('success', 'You have requested a password reset.  You will receive an email with instructions shortly.');
					// $location.path("/");
				}, function (error) {
					$scope.disableButton = false;
					var output = error.data;
					$scope.errorMessage = [];

					if (output.Message) {
						$scope.errorMessage.push(output.Message);
					}

					for (var key in output.ModelState) {
						var item = output.ModelState[key];
						for (var i = 0; i < item.length; i += 1) {
							$scope.errorMessage.push(item[i]);
						}
					}
				});
		};
	};

	angular.module('linkslap').controller("ForgotPasswordCtrl", [ '$scope', '$location', 'Restangular', 'Browser', controller ]);
}());