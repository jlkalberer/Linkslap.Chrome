(function() {
	var controller = function($scope, $location, rest) {
		$scope.disableButton = false;

		$scope.submitForm = function () {
			$scope.disableButton = true;
			
			rest.all('api/stream').post({name: $scope.streamName})
				.then(function () {
					$location.path('/');
				}, function () {
					$scope.disableButton = false;
				});
		};
	};

	angular.module('linkslap').controller("NewStreamCtrl", [ '$scope', '$location', 'Restangular', controller ]);
}());