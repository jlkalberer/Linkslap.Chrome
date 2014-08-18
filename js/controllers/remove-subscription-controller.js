(function() {
	var controller = function($scope, $routeParams, $location, browser) {
		$scope.disableButton = false;
		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscription = _.find(values, {id: parseInt($routeParams.subscriptionId)});
		});
		
		$scope.removeSubscription = function () {
			browser.$trigger('subscriptions.unsubscribe', $scope.subscription).then(function() {
				$location.path('/');
			});
		};
	};

	angular.module('linkslap').controller("RemoveSubscriptionCtrl", [ '$scope', '$routeParams', '$location', 'Browser', 'Restangular', controller ]);
}());