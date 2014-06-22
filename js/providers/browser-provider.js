angular
	.module("linkslap")
	.provider('Browser',function () {
		var openTab, 
			$q,
			openTabPage, 
			ports = [],
			messageEvents = [],
			$on = function (eventName, callback) {
				messageEvents.push({eventName: eventName, callback: callback});
			};

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
			};

			openTabPage = function(url) {
				$windows.getLastFocused({}, function (window) {
					$tabs.create({"windowId" : window.id, "url" : url });
				});
			};

			chrome.runtime.onConnect.addListener(function(port) {
				// Not sure if I should filter by port name...
				if (port.name !== 'linkslap') {
					return;
				}

				ports.push(port);

				port.onMessage.addListener(function(msg) {
					var responses = [], promises = [];
					_.map(messageEvents, function (event) {
						if (msg.eventName !== event.eventName) {
							return;
						}

						var output = event.callback(msg.data);

						if (!output || !output.then) {
							return;
						}

						var defer = $q.defer();
						promises.push(defer.promise);

						output.then(function(response) {
							responses.push({type:'success', data: response});
							defer.resolve();
						}, function (error) {
							responses.push({type:'error', data: error});
							defer.resolve();
						});
					});

					if (!promises.length) {
						return;
					}
					
					$q.all(promises).then(function () {
						var output;
						if (responses.length === 1) {
							output = {eventId: msg.eventId, data: responses[0].data, type: responses[0].type};
						} else {
							output = {eventId: msg.eventId, data: responses};
						}

						port.postMessage(output);
					});
				});

				port.onDisconnect.addListener(function (port) {
					ports = _.without(ports, port);
				});
			});

			var guid = (function() {
			  function s4() {
			    return Math.floor((1 + Math.random()) * 0x10000)
			               .toString(16)
			               .substring(1);
			  }
			  return function() {
			    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			           s4() + '-' + s4() + s4() + s4();
			  };
			})();

			$trigger = function (eventName, data) {
				var output = _.map(ports, function (port) {
					var defer = $q.defer(),
							eventId = guid();

					function triggerListener(msg) {
						if (msg.eventId !== eventId) {
							return;
						}

						if (msg.type !== 'error') {
							defer.resolve(msg.data);
						} else {
							defer.reject(msg.data);
						}

						port.onMessage.removeListener(triggerListener);
					}

					port.onMessage.addListener(triggerListener);
					port.postMessage({eventName: eventName, data: data, eventId: eventId});

					return defer.promise;
				});

				if (output.length === 1) {
					return output[0];
				}

				return output;
			};

			/*var port = chrome.runtime.connect({name: "linkslap"});
			port.postMessage({joke: "Knock knock"});
			port.onMessage.addListener(function(msg) {
			  if (msg.question == "Who's there?")
			    port.postMessage({answer: "Madame"});
			  else if (msg.question == "Madame who?")
			    port.postMessage({answer: "Madame... Bovary"});
			});*/
		}

		// At some point this may be filled with things that aren't constants..
		this.$get = ['$rootScope', '$q', function (root, q) {
			$q = q;

			return { 
				openTab: openTab,
				openTabPage: openTabPage,
				$on: $on,
				$trigger: $trigger
			};
		}];
	});
