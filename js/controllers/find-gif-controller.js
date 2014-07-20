(function() {
	var controller = function($scope, $routeParams, rest, $analytics) {
		var xhr = null;
		$scope.subscriptionId = $routeParams.subscriptionId;
		$scope.search = '';
		$scope.pageCount = [];
		$scope.currentPage = 0;
		$scope.results = [];
		$scope.searching = false;

		$scope.searchGif = function (page) {
			$scope.currentPage = page || 0;
			$scope.results = [];
			$scope.searching = true;

			if (!$scope.search) {
				$scope.pageCount = [];
				return;
			}

			$analytics.eventTrack('gif-search', { category: $scope.subscriptionId, label: $scope.search })

			rest.oneUrl('search', 'http://api.gifme.io/v1/search')
				.get({ key: 'rX7kbMzkGu7WJwvG', query: $scope.search, page: $scope.currentPage, limit: 20, sfw: !$scope.nsfw })
				.then(function (result) {
					$scope.pageCount = _.range(0, result.meta.total_pages);
					var allItems = result.data;

					$scope.results = [];
				    var group = [];

				    for (var i = 0; i < allItems.length; i += 1) {
				    	group.push(allItems[i]);
				    	if ((i + 1) % 2 === 0) {
				    		$scope.results.push(group);
				    		group = [];
				    	}
				    }

					$scope.searching = false;
				});
		};

		$scope.$watch('search', function () { $scope.searchGif(); });
	};

	angular.module('linkslap').controller("FindGifCtrl", [ '$scope', '$routeParams', 'Restangular', '$analytics', controller ]);
}());