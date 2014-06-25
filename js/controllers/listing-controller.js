(function() {
	var controller = function($scope, browser, settings) {
		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscriptions = values;
		});
		browser.$on('subscriptions.updated', function (values) {
			$scope.subscriptions = values;
		});

		browser.$trigger('subscriptions.getlinknotifications').then(function (values) {
			$scope.subscriptionNotifications = values;
		});
		browser.$on('subscriptions.synclinks', function (values) {
			$scope.subscriptionNotifications = values;
		});
		$scope.openStream = function (subscription) {
			browser.openTabPage(settings.baseUrl + 's/' + subscription.stream.key)
		};

		$scope.openMissedLinks = function (subscriptionNotification) {
			browser.openTab(subscriptionNotification.submittedLinks);
			$scope.dismissMissedLinks(subscriptionNotification);
		};

		$scope.dismissMissedLinks = function (subscriptionNotification) {
			browser.$trigger('subscriptions.removelinknotification', subscriptionNotification.streamKey);
		};
	};

	angular.module('linkslap').controller("ListingCtrl", [ '$scope', 'Browser', 'Settings', controller ]);
}());