(function() {
	var controller = function($scope, $routeParams, $location, browser) {
		$scope.disableButton = false;
		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscription = _.where(values, {id: parseInt($routeParams.subscriptionId)})[0];
		});
		
		$scope.removeSubscription = function () {
			browser.$trigger('subscriptions.unsubscribe', $scope.subscription).then(function() {
				$location.path('/');
			});
		};
	};

	angular.module('linkslap').controller("SubscriptionSettingsCtrl", [ '$scope', '$routeParams', '$location', 'Browser', 'Restangular', controller ]);
}());