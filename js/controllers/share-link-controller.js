(function() {
	var controller = function($scope, $routeParams, $location, settings, browser, rest) {
		$scope.disableButton = false;
		browser.$trigger('subscriptions.get').then(function (values) {
			$scope.subscription = _.where(values, {id: parseInt($routeParams.subscriptionId)})[0];
		});
		browser.$trigger('browser.pagedetails').then(function(value) {
			$scope.model = value;
		});
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
			
			browser.openTab(model);
		};

		$scope.submitForm = function () {
			$scope.disableButton = true;

			var model = $scope.model;
			model.streamKey = $scope.subscription.stream.key;

			rest.all('api/link').post(model).then(function (result) {
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

	angular.module('linkslap').controller("ShareLinkCtrl", [ '$scope', '$routeParams', '$location', 'Settings', 'Browser', 'Restangular', controller ]);
}());