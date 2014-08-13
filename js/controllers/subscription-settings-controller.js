(function() {
	var controller = function($scope, $routeParams, $location, browser) {
		$scope.disableButton = false;
		browser.$trigger('settings.get').then(function (values) {
			$scope.model = values;
		});
	};

	angular.module('linkslap').controller("SubscriptionSettingsCtrl", [ '$scope', '$routeParams', '$location', 'Browser', 'Restangular', controller ]);
}());