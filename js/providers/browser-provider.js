(function() {
	var app = angular.module("linkslap");

	app.provider('Settings',function () {

		if (chrome && chrome.extension.getBackgroundPage) {
			var background = chrome.extension.getBackgroundPage();

			
		}

		// At some point this may be filled with things that aren't constants..
		this.$get = function () {
			return { };
		};
	});
}());