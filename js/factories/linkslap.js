(function() {
	var app = angular.module("linkslap");

	app.factory('Linkslap',['Link', 'Browser', '$localStorage', function (link, browser, storage) {
			window.link = link;
			window.browser = browser;
			window.storage = storage;
		}]);
}());