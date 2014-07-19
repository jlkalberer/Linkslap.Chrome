(function() {
	var controller = function($scope, $routeParams) {
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

			if (xhr && xhr.abort) {
				xhr.abort();
				xhr = null;
			}

			xhr = $.get('http://gifme.io/search/q?query=' + $scope.search + "&page=" + $scope.currentPage).then(function (result) {
				$scope.$apply(function () {
				    var allItems =  $(result).find('#results-area a').map(function (index, el) {
				        return {
				            thumb : $(el).data('static'),
				            image : $(el).data('image')
				        };
				    });

				    $scope.pageCount = _.range(0, $(result).find('.page-button').length);

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
				
				xhr = null;
			});
		};

		$scope.$watch('search', function () { $scope.searchGif(); });
	};

	angular.module('linkslap').controller("FindGifCtrl", [ '$scope', '$routeParams', controller ]);
}());