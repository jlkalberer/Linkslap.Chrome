(function() {
	var controller = function($scope, auth) {
		$scope.finished = function () {
			auth.onboarded(true);
		};
	};

	angular.module('linkslap').controller("OnboardCtrl", [ '$scope', 'AccountService', controller ]);
}());