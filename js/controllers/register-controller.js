(function() {
	var controller = function($scope, account, $location) {
		$scope.disableButton = false;
		$scope.model = {};

		$scope.submitForm = function () {
			$scope.disableButton = true;
			
			var registration = account.register($scope.model);

			registration.then(function () {
				$location.path('/authenticate');
			}, function (response) {
				$scope.disableButton = false;
				var output = response.data;
				if (output.error_description) {
					$scope.errorMessage = [response.data.error_description];
				} else if (output.ModelState) {
					// Get all the error messages
					$scope.errorMessage = [];
					for (var key in output.ModelState) {
						var item = output.ModelState[key];
						for (var i = 0; i < item.length; i += 1) {
							$scope.errorMessage.push(item[i]);
						}
					}
				}

			});
		};
	};

	angular.module('linkslap').controller("RegisterCtrl", [ '$scope', 'AccountService', '$location', controller ]);
}());