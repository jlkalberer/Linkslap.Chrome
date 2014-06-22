(function() {
	var app = angular.module("linkslap");

	app.factory('$localStorage',['Browser', function (browser) {
			return browser.storage;
		}]);
}());