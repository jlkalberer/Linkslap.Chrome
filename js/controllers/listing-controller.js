(function() {
	var controller = function($scope, browser, settings) {
		$scope.subscriptions = [];
		browser.$on('subscriptions.updated', function (values) {
			$scope.$apply(function () {
				$scope.subscriptions = values.$object;
			});
		});

		browser.$trigger('subscriptions.get');

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