angular
	.module("linkslap")
	.provider('Browser', function () {
		var output = null;

		if (chrome) {
			var $windows = chrome.windows,
				$tabs = chrome.tabs,
				currentWindow = null,
				messageEvents = [],
				port = null,
				listener;

			var background = chrome.extension.getBackgroundPage();

			var disconnect = function () {
				port = chrome.runtime.connect({name: "linkslap"});
				port.onMessage.addListener(listener);
				port.onDisconnect.addListener(disconnect);
			};
			
			this.$get = ['$q', function ($q) {

				listener = function(msg) {
					var responses = [], promises = [];
					_.each(messageEvents, function (event) {
						if (msg.eventName !== event.eventName) {
							return;
						}

						var output;

						output = event.callback(msg.data);

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
				};

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

				output = {
					openTab: background.browser.openTab,
					openTabPage: background.browser.openTabPage,
					$on: function (eventName, callback) {
						messageEvents.push({eventName: eventName, callback: callback});
					},
					$trigger: function (eventName, data) {
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
					}
				};

				output.$on("subscriptions.updated", function (values) {
					var v = 0;
				});

				return output;
			}];

			disconnect();
		}
	});
