angular.module('linkslap')
	.factory('Link',['$rootScope', '$q','Hub', 'Restangular', 'Browser', 'AccountService', function($rootScope, $q, Hub, rest, browser, account){
	    var Links = this;
	    var subscriptions;
	    var deferred = $q.defer();

	    $.connection.hub.reconnected(function() {
	    	Link.connectionId = linkHub.connection.id;	    	
	    });

	    var linkHub = new Hub('link', {
		        'openLink': function (link) {
		        	browser.openTab(link);
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

	    Links.subscribe = function (subscription) {
	        linkHub.subscribe(subscription.streamId); //Calling a server method
	        subscriptions.post({ id : subscription.streamId });
	    };
	    Links.unsubscribe = function (subscription) {
	        linkHub.unsubscribe(subscription.stream.key); //Calling a server method
	        subscription = _.where(Links.subscriptions, {id : subscription.id})[0];
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

	    Links.newStream = function (streamName) {

	    };

	    linkHub.promise.then(function() {
	    	Links.connectionId = linkHub.connection.id;	    	
	    	deferred.resolve();
	    });

	    Links.updateSubscriptions();	

	    browser.$on('subscriptions.get', function () {
	    	if (!Links.subscriptions) {
	    		return null;
	    	}

	    	return Links.subscriptions;
	    });

	    browser.$on('subscriptions.newstream', Links.newStream);
	    browser.$on('subscriptions.unsubscribe', Links.unsubscribe);

	    var userId = null;
	    $rootScope.$on('account.loggedin', function (event, result) {
	    	userId	 = result.id;
	    	streamHub.subscribe(userId);
	    	Links.updateSubscriptions();
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
    			linkHub.unsubscribe(sub.streamId);
    		});
	    });

	    return Links;
	}]);
