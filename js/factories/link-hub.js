angular.module('linkslap')
	.factory('Link',['$rootScope', '$q', '$localStorage', 'Hub', 'Restangular', 'Browser', 'AccountService', function($rootScope, $q, storage, Hub, rest, browser, account){
	    var Links = this;
	    var subscriptions;
	    var deferred = $q.defer();

	    $.connection.hub.reconnected(function() {
	    	Link.connectionId = linkHub.connection.id;	    	
	    });

	    var linkHub = new Hub('link', {
		        'openLink': function (link) {
		        	var acct = account.getAccount();
		        	if (link.id && link.createdDate) {

		        		if (acct) {
			        		storage[acct.id].lastUpdated = link.createdDate;
		        		}
		        	}

		        	// Don't show it if from the same user
		        	if (link.userName === acct.userName) {
		        		return;
		        	}

		        	// TODO - add to notifications if the browser is idle
		        	var settings = storage[acct.id].settings;
		        	var subscriptionSetting = _.find(settings.subscriptionSettings, {streamKey: link.streamKey });

		        	if (settings.disablePopups || !subscriptionSetting.popups) {
		        		// add to queue
		        	} else if (settings.ignoreAll || subscriptionSetting.ignore) {
		        		// do nothing
		        	} else {
			        	browser.openTab(link);
		        	}
		        }
		    }, 
	        //Server method stubs for ease of access
	        ['subscribe', 'unsubscribe']
	    );

	    Links.subscriptions = [];
	    var streamHub = new Hub('subscription', {
	    		'addSubscription': function (subscription) {
	    			Links.subscriptions = _.without(Links.subscriptions, _.findWhere(Links.subscriptions, {id: subscription.id}));
	    			subscription = rest.restangularizeElement(null, subscription, 'api/subscription');
	    			Links.subscriptions.push(subscription);
		    		browser.$trigger('subscriptions.updated', Links.subscriptions);
	    		},
	    		'removeSubscription': function (streamKey) {
	    			Links.subscriptions = _.difference(Links.subscriptions, _.filter(Links.subscriptions, function (item) {
	    				return item.stream.key === streamKey;
	    			}));

		    		browser.$trigger('subscriptions.updated', Links.subscriptions);
	    		}
	    	}, 
	        //Server method stubs for ease of access
	        ['subscribe', 'unsubscribe']
	    );

	    var user = account.getAccount();

	    if (user) {
	    	streamHub.promise.then(function() {
		    	streamHub.subscribe(user.id);
	    	});
	    }

	    Links.subscribe = function (streamKey) {
	        linkHub.subscribe(streamKey); //Calling a server method
	        subscriptionRest.post({ streamKey : streamKey });
	    };
	    Links.unsubscribe = function (subscription) {
	        linkHub.unsubscribe(subscription.stream.key); //Calling a server method
	        subscription = _.findWhere(Links.subscriptions, {id : subscription.id});

	        if (!subscription) {
	        	return;
	        }

	        subscription.remove({ streamKey : subscription.stream.key });
	    }

	    Links.updateSubscriptions = function () {
	    	subscriptionRest = rest.all('api/subscription');
		    subscriptions = subscriptionRest.getList();

		    subscriptions.then(function (values) {
		    	Links.subscriptions = values;
		    	browser.$trigger('subscriptions.updated', values);
		    });

		    $q.all([subscriptions, deferred.promise]).then(function() {
		    	var items = Links.subscriptions;
		    	for (var i = 0; i < items.length; i += 1) {
	    			linkHub.subscribe(items[i].stream.key);
	    		}
		    });

		    return subscriptions;
	    };

	    linkHub.promise.then(function() {
	    	Links.connectionId = linkHub.connection.id;	    	
	    	deferred.resolve();
	    });

	    var setCount = function (storedNotifications) {
	    	var count = 0;
    		_(storedNotifications).each(function (subscriptionNotification) {
    			count += subscriptionNotification.submittedLinks.length;
    		});

			if (count === 0) {
				count = '';
			}
			browser.setBadge(count + '');
	    };

	    var onLogin = function (acct) {
		    if (!acct) {
		    	return;
		    }

		    Links.updateSubscriptions();
		    var model = {'lastUpdated': storage[acct.id].lastUpdated};
		    rest.all('api/subscription/sync-links')
		    	.getList(model)
		    	.then(function (response) {
		    		var storedNotifications = storage[acct.id].linkNotifications || [];
		    		if (!response || response.length == 0) {
						setCount(storedNotifications);
		    			return;
		    		}

		    		_(response).each(function (subscriptionNotification) {
		    			var existing = _(storedNotifications).findWhere({streamKey: subscriptionNotification.streamKey})

		    			if (!existing) {
		    				storedNotifications.push(subscriptionNotification);
		    				return;
		    			}

		    			_(subscriptionNotification.submittedLinks).each(function (link) {
		    				var existingLink = _(existing.submittedLinks).findWhere({id: link.id});

		    				if (!existingLink) {
		    					existing.submittedLinks.push(link);
		    				}
		    			});
		    		});

		    		if (response[0]) {
		    			storage[acct.id].lastUpdated = response[0].lastUpdated || storage[acct.id].lastUpdated;
		    		}

					setCount(storedNotifications);

					storage[acct.id].linkNotifications = storedNotifications;

		    		browser.$trigger('subscriptions.synclinks', storedNotifications);
		    	});
	    };

	    onLogin(account.getAccount());

	    browser.$on('links.send', function (model) {
	    	if (model.closeTab) {
		    	browser.closeTab();
	    	}

			return rest.all('api/link').post(model);
	    });

	    browser.$on('subscriptions.get', function () {
	    	if (!Links.subscriptions) {
	    		return null;
	    	}

	    	if (Links.subscriptions.length === 0) {
	    		Links.updateSubscriptions();
	    	}

	    	return Links.subscriptions;
	    });
	    browser.$on('subscriptions.getlinknotifications', function () {
	    	var acct = account.getAccount();

	    	if (!acct) {
	    		return;
	    	}
	    	
	    	return storage[acct.id].linkNotifications || [];
	    });

	    browser.$on('subscriptions.removelinksnotification', function (streamKey) {
	    	var acct = account.getAccount();
	    	var storedNotifications = storage[acct.id].linkNotifications;
	    	storage[acct.id].linkNotifications = storedNotifications = _.without(storedNotifications, _.find(storedNotifications, {streamKey: streamKey}));
		    
		    browser.$trigger('subscriptions.synclinks', storedNotifications);

		    setCount(storedNotifications);

		    return storedNotifications;
	    });

	    browser.$on('subscriptions.removelinknotification', function (link) {
	    	var acct = account.getAccount();
	    	var storedNotifications = storage[acct.id].linkNotifications;

	    	var subscription = _.find(storedNotifications, {streamKey: link.streamKey});

	    	subscription.submittedLinks = _.without(subscription.submittedLinks, _.find(subscription.submittedLinks, {id : link.id}));

	    	if (!subscription.submittedLinks.length) {
	    		storedNotifications = _.without(storedNotifications, subscription);
	    	}

	    	storage[acct.id].linkNotifications = storedNotifications;
		    
		    browser.$trigger('subscriptions.synclinks', storedNotifications);

		    setCount(storedNotifications);

		    return storedNotifications;
	    });

	    browser.$on('subscriptions.newstream', Links.newStream);
	    browser.$on('subscriptions.subscribe', Links.subscribe);
	    browser.$on('subscriptions.unsubscribe', Links.unsubscribe);

	    browser.$on('settings.get', function () {
	    	var acct = account.getAccount();
    		if (!acct) {
    			return;
    		}

        	var settings = storage[acct.id].settings || {
										        			disablePopups: false,
										        			ignoreAll: false,
										        			subscriptionSettings: []
									        			};
        	var subs = Links.subscriptions;

        	var toAdd = _.filter(Links.subscriptions, function (subscripton) {
        		return !_.some(settings.subscriptionSettings, {subscriptionId: subscripton.id});
        	});

	    	var toRemove = _.filter(settings.subscriptionSettings, function (setting) {
        		return !_.some(Links.subscriptions, {id: setting.subscriptionId});
        	});

			settings.subscriptionSettings = _.xor(settings.subscriptionSettings, toRemove);
			
			_.forEach(toAdd, function (subscription) {
				settings.subscriptionSettings.push({
					subscriptionId : subscription.id,
					streamName : subscription.stream.name,
					popups : true,
					ignore: false
				});
			});

			storage[acct.id].settings = settings;

			return settings;
	    });

		browser.$on('settings.save', function (updated) {
			var acct = account.getAccount();
    		if (!acct) {
    			return;
    		}

    		storage[acct.id].settings = updated;
		});

	    var userId = null;
	    $rootScope.$on('account.loggedin', function (event, result) {
	    	userId	 = result.id;
	    	streamHub.subscribe(userId);
	    	Links.updateSubscriptions();
	    	onLogin(result);
	    });


	    $rootScope.$on('account.loggedout', function () {
	    	if (userId) {
		    	streamHub.unsubscribe(userId);
		    	userId = null;
	    	}

	    	if (!Links.subscriptions) {
	    		return;
	    	}

    		_.each(Links.subscriptions, function (sub) {
    			linkHub.unsubscribe(sub.stream.key);
    		});
	    });

	    return Links;
	}]);
