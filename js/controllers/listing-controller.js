(function() {
	var controller = function($scope, browser, settings) {
		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscriptions = values;
		});
		browser.$on('subscriptions.updated', function (values) {
			$scope.subscriptions = values;
		});

		$scope.sharePage = function (subscription) {

		};
		$scope.sharePageWithComment = function (subscription) {

		};
		$scope.openStream = function (subscription) {
			browser.openTabPage(settings.baseUrl + 's/' + subscription.Stream.Key)
		};
		$scope.editStream = function (subscription) {

		};
	};

	angular.module('linkslap').controller("ListingCtrl", [ '$scope', 'Browser', 'Settings', controller ]);
}());