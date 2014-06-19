angular
	.module("linkslap")
	.provider('Browser',function () {
		var openTab, openTabPage;

		if (chrome) {
			var $windows = chrome.windows,
				$tabs = chrome.tabs,
				currentWindow = null;

			var background = chrome.extension.getBackgroundPage();

			$windows.onRemoved.addListener(function(windowId) {
				if (!currentWindow) {
					return;
				}
				
				if (currentWindow.id === windowId) {
					currentWindow = null;
				}
			});

			var resizeWindow = function () {
				if (!currentWindow) {
					return;
				}
				
				$windows.update(currentWindow.id, { "focused" : true, "state" : "maximized" });
			};

			var setupTab = function (link, tab) {
				var tabId = tab.id;

				var script = "var linkModel='" + $.param(link) + "'";
				$tabs.executeScript(tabId, { "code" : script, "runAt" : "document_start" }, function() {
					$tabs.executeScript(tabId, { "file": "/js/vendor/jquery-2.1.1.min.js", "runAt" : "document_start"}, function() {
						$tabs.executeScript(tabId, { "file": "/js/header.js", "runAt" : "document_start" });
					});
				});
			};

			openTab = function (link) {
				if (currentWindow === null) {
					$windows.create({"url": link.url }, function (newWindow) {
						currentWindow = newWindow;
						resizeWindow();

						setupTab(link, currentWindow.tabs[0]);
					});
				} else {
					$tabs.create({"windowId" : currentWindow.id, "url" : link.url }, function (tab) {
						resizeWindow();

						setupTab(link, tab);
					});
				}
			}

			openTabPage = function(url) {
				$windows.getLastFocused({}, function (window) {
					$tabs.create({"windowId" : window.id, "url" : url });
				});
			}
		}

		// At some point this may be filled with things that aren't constants..
		this.$get = function () {
			return { 
				openTab: openTab,
				openTabPage: openTabPage
			};
		};
	});
