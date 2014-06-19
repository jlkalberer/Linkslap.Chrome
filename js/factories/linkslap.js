(function() {
	var app = angular.module("linkslap");

	app.factory('Linkslap',['Link', 'Browser', function (link, browser) {
			window.link = link;
			window.browser = browser;
		}]);
}());