angular
	.module("linkslap")
	.provider('Browser',function () {
		var output = null;

		if (chrome) {
			var $windows = chrome.windows,
				$tabs = chrome.tabs,
				currentWindow = null;

			background = chrome.extension.getBackgroundPage();

			output = {
				openTab: background.browser.openTab,
				openTabPage: background.browser.openTabPage,
				subscriptions: background.link.subscriptions
			};
		}

		// At some point this may be filled with things that aren't constants..
		this.$get = function () {
			return output;
		};
	});
