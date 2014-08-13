(function() {
	var controller = function($scope, $routeParams, browser, settings, $location) {
		var streamKey = $routeParams.streamKey;

		var setupNotifications = function (values) {
			var subscription = _.find(values, {streamKey: streamKey });
			if (!subscription) {
				$location.path('/');
				return;
			}
			
			$scope.streamName = subscription.streamName;
			$scope.links = subscription.submittedLinks;
		};

		browser.$trigger('subscriptions.getlinknotifications').then(setupNotifications);
		browser.$on('subscriptions.synclinks', setupNotifications);

		$scope.openLink = function (link) {
			link.useCurrentWindow = true;
			browser.openTab(link);
			$scope.removeLink(link);
		};

		$scope.removeLink = function (link) {
			browser.$trigger('subscriptions.removelinknotification', link);
		};

		$scope.openStream = function () {
			browser.openTabPage(settings.baseUrl + 's/' + streamKey)
		};


	};

	angular.module('linkslap').controller("MissedListingCtrl", [ '$scope', '$routeParams', 'Browser', 'Settings', '$location', controller ]);
}());