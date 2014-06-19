(function() {
	var controller = function($scope, browser, settings) {
		$scope.subscriptions = browser.subscriptions.$object;

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