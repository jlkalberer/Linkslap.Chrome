(function() {
	var controller = function($scope, browser, settings) {
		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscriptions = values;
		});
		browser.$on('subscriptions.updated', function (values) {
			$scope.subscriptions = values;
		});

		$scope.openStream = function (subscription) {
			browser.openTabPage(settings.baseUrl + 's/' + subscription.stream.key)
		};
	};

	angular.module('linkslap').controller("ListingCtrl", [ '$scope', 'Browser', 'Settings', controller ]);
}());