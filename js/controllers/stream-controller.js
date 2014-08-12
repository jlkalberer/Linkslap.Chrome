(function() {
	var controller = function($scope, $routeParams, rest, browser, settings) {
		var streamKey = $routeParams.streamKey;
		$scope.streamName = $routeParams.streamName;

		$scope.openLink = function (link) {
			link.useCurrentWindow = true;
			link = rest.stripRestangular(link);
			browser.openTab(link);
		};

		$scope.openStream = function () {
			browser.openTabPage(settings.baseUrl + 's/' + streamKey)
		};


		rest.one("api/stream", streamKey).getList('links').then(function (values) {
			for (var i = 0; i < values.length; i += 1) {
				values[i].createdDate = moment(values[i].createdDate, settings.dateFormat).format("M/D/YYYY h:mm a")
			}

			$scope.links = values;
		});
	};

	angular.module('linkslap').controller("StreamCtrl", [ '$scope', '$routeParams', 'Restangular', 'Browser', 'Settings', controller ]);
}());