(function() {
	var controller = function($scope, $routeParams, $location, browser, rest) {
		$scope.disableButton = false;
		$scope.model = {
			email: null,
			message: null
		};

		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscription = _.where(values, {id: parseInt($routeParams.subscriptionId)})[0];
			$scope.model.streamKey = $scope.subscription.stream.key;
		});

		var account = '';
		browser.$trigger('account.getaccount').then(function(value) {
			account = value;

			$scope.model.message = account.userName + " would like to share " + $scope.subscription.stream.name + " with you on Linkslap."
		});

	
		$scope.submitForm = function () {
			$scope.disableButton = true;

			rest.all('api/stream/share').post($scope.model).then(function (result) {
				browser.toast('success', 'You have shared ' + $scope.subscription.stream.name + ' with ' + $scope.model.email + '.');

				$location.path('/');
			}, function (error) {
				$scope.disableButton = false;
				var output = error.data;
				$scope.errorMessage = [];

				for (var key in output.ModelState) {
					var item = output.ModelState[key];
					for (var i = 0; i < item.length; i += 1) {
						$scope.errorMessage.push(item[i]);
					}
				}
			});
		};
	};

	angular.module('linkslap').controller("ShareStreamCtrl", [ '$scope', '$routeParams', '$location', 'Browser', 'Restangular', controller ]);
}());