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
			},
			$trigger,
			setBadge;

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
				// an array of links were sent to be opened.
				if (_.isArray(link)) {
					if (!currentWindow) {
						var newLink = link.shift();
						$windows.create({"url": newLink.url }, function (newWindow) {
							currentWindow = newWindow;
							resizeWindow();

							setupTab(newLink, currentWindow.tabs[0]);
							_(link).each(openTab);
						});

						return;
					}
					
					_(link).each(openTab);
					return;
				}

				if (link.useCurrentWindow) {
					$windows.getLastFocused({}, function (window) {
						$tabs.create({"windowId" : window.id, "url" : link.url }, function (tab) {
							resizeWindow();

							setupTab(link, tab);
						});
					});
				} else if (currentWindow === null) {
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

			$on("browser.pagedetails", function () {
				var defer = $q.defer();

				$tabs.getSelected(null, function(tab) {
					defer.resolve({
						comment: tab.title,
						url: tab.url
					});
				});

				return defer.promise;
			});

			$on("browser.opentab", openTab);

			var messageHandler;

			chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
				if (sender.id !== chrome.runtime.id) {
					return;
				}

				_.map(messageEvents, function (event) {
					if (msg.eventName !== event.eventName) {
						return;
					}

					var output = event.callback(msg.data);

					sendResponse(output);
				});
			});

			chrome.runtime.onConnect.addListener(function(port) {
				// only allow from this extension
				if (port.sender.id !== chrome.runtime.id) {
					return;
				}

				// Not sure if I should filter by port name...
				if (port.name !== 'linkslap') {
					return;
				}

				ports.push(port);

				port.onMessage.addListener(function(msg, port) {
					// only allow from this extension
					if (port.sender.id !== chrome.runtime.id) {
						return;
					}
					
					var responses = [], promises = [];
					_.map(messageEvents, function (event) {
						if (msg.eventName !== event.eventName) {
							return;
						}

						var output = event.callback(msg.data);

						var defer = $q.defer();
						promises.push(defer.promise);

						if (!output || !output.then) {
							responses.push({type:'success', data: output});
							defer.resolve();
							return;
						}

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

			setBadge = function (val) {
				chrome.browserAction.setBadgeText({text: val});
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
		this.$get = ['$q', function (q) {
			$q = q;

			return { 
				openTab: openTab,
				openTabPage: openTabPage,
				toast: function (type, message) {
					$trigger("browser.sendtoast", {type: type, message: message});
				},
				$on: $on,
				$trigger: $trigger,
				setBadge: setBadge
			};
		}];
	});
