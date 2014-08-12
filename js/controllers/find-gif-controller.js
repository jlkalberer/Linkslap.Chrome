(function() {
	var controller = function($scope, $routeParams, rest, $analytics) {
		var xhr = null;
		$scope.subscriptionId = $routeParams.subscriptionId;
		$scope.search = $routeParams.query || '';
		$scope.pageCount = [];
		$scope.currentPage = 1;
		$scope.limit = 20;
		$scope.results = [];
		$scope.searching = false;
		$scope.totalCount = 0;

		$scope.searchGif = function () {
			$scope.results = [];
			$scope.searching = true;

			if (!$scope.search) {
				$scope.pageCount = [];
				return;
			}

			$analytics.eventTrack('Gif Search', { category: $scope.subscriptionId, label: $scope.search })

			/*
			rest.oneUrl('search', 'http://api.giphy.com/v1/gifs/search')
				.get({ api_key: 'dc6zaTOxFJmzC', q: $scope.search, offset: ($scope.currentPage - 1) * $scope.limit, limit: $scope.limit })
				.then(function (result) {
					var pagination = result.pagination;
					$scope.totalCount = pagination.total_count;
					$scope.pageCount = pagination.total_count / $scope.limit;
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

				    if (group.length) {
				    	$scope.results.push(group);
				    }

					$scope.searching = false;
				});
			*/

			rest.oneUrl('search', 'http://api.gifme.io/v1/search')
				.get({ key: 'MNfCaCC9tRAr3yzf', query: $scope.search, page: ($scope.currentPage - 1), limit: $scope.limit, sfw: !$scope.nsfw })
				.then(function (result) {
					var pagination = result.meta;
					$scope.totalCount = pagination.total;
					$scope.pageCount =  Math.ceil(pagination.total / $scope.limit);
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

				    if (group.length) {
				    	$scope.results.push(group);
				    }

					$scope.searching = false;
				});
			
			
		};

		$scope.$watch('search', function () { $scope.currentPage = 1; $scope.searchGif(); });
	};

	angular.module('linkslap').controller("FindGifCtrl", [ '$scope', '$routeParams', 'Restangular', '$analytics', controller ]);
}());