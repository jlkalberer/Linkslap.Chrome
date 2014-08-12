(function() {
	var controller = function($scope, $routeParams, $filter, $location, settings, browser, rest) {
		$scope.disableButton = false;
		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscription = _.where(values, {id: parseInt($routeParams.subscriptionId)})[0];
		});

		if ($routeParams.url) {
			$scope.model = {
				url: $routeParams.url,
				comment: $routeParams.comment
			};

			if (checkURL($scope.model.url)) {
				$scope.imageUrl = $scope.model.url;
			}

			$scope.cancelUrl = '#/find-gif/' + $routeParams.subscriptionId + '?query=' + $filter('escape')($routeParams.comment);
		} else {
			browser.$trigger('browser.pagedetails').then(function(value) {
				$scope.model = value;

				if (checkURL($scope.model.url)) {
					$scope.imageUrl = $scope.model.url;
				}
			});			
		}

		function checkURL(url) {
		    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
		}

		

		var userName = '';
		browser.$trigger('account.getaccount').then(function(value) {
			userName = value.userName;
		});

		$scope.preview = function ($event) {
			$event.preventDefault();

			var model = $scope.model;
			model.userName = userName;
			model.createdDate = moment().format(settings.dateFormat);
			model.streamName = $scope.subscription.stream.name;
			model.useCurrentWindow = true;
			model.isPreview = true;

			browser.openTab(model);
		};

		$scope.submitForm = function () {
			$scope.disableButton = true;

			var model = $scope.model;
			model.streamKey = $scope.subscription.stream.key;

			browser.$trigger('links.send', model).then(function (result) {
				browser.toast('success', 'You have slapped a link to ' + $scope.subscription.stream.name + '.');

				$location.path('/');
			}, function (error) {
				$scope.disableButton = false;
				var output = error.data;
				$scope.errorMessage = [];

				for (var key in output.ModelState) {
					var item = output.ModelState[key];
					for (var i = 0; i < item.length; i += 1) {
						$scope.errorMessage.push(item[i]);
					}
				}
			});
		};
	};

	angular.module('linkslap').controller("ShareLinkCtrl", [ '$scope', '$routeParams', '$filter', '$location', 'Settings', 'Browser', 'Restangular', controller ]);
}());