(function() {
	var controller = function($scope, $routeParams, rest, settings) {
		var streamKey = $routeParams.streamKey;
		$scope.streamName = $routeParams.streamName;

		rest.one("api/stream", streamKey).getList('links').then(function (values) {
			for (var i = 0; i < values.length; i += 1) {
				values[i].createdDate = moment(values[i].createdDate, settings.dateFormat).format("M/D/YYYY h:mm a")
			}

			$scope.links = values;
		});
	};

	angular.module('linkslap').controller("StreamCtrl", [ '$scope', '$routeParams', 'Restangular', 'Settings', controller ]);
}());