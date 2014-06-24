angular.module('linkslap')
	.factory('Link',['$rootScope', '$q','Hub', 'Restangular', 'Browser', 'AccountService', function($rootScope, $q, Hub, rest, browser, account){
	    var Links = this;
	    var subscriptions;
	    var deferred = $q.defer();

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
	    			Links.subscriptions.push(subscription);
		    		browser.$trigger('subscriptions.updated', Links.subscriptions);
	    		},
	    		'removeSubscription': function (subscriptionId) {

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
	        linkHub.unsubscribe(subscription.streamId); //Calling a server method
	        subscriptions.remove({ id : subscription.streamId });
	    }

	    Links.updateSubscriptions = function () {
		    subscriptions = rest.all('api/subscription').getList();

		    subscriptions.then(function (values) {
		    	Links.subscriptions = values;
		    	browser.$trigger('subscriptions.updated', values);
		    });

		    $q.all([subscriptions, deferred.promise]).then(function() {
		    	var items = subscriptions;
		    	for (var i = 0; i < items.length; i += 1) {
	    			linkHub.subscribe(items[i].Stream.Key);
	    		}
		    });

		    return subscriptions;
	    };

	    linkHub.promise.then(function() {
	    	deferred.resolve();
	    });

	    Links.updateSubscriptions();	

	    browser.$on('subscriptions.get', function () {
	    	if (!Links.subscriptions) {
	    		return null;
	    	}

	    	return Links.subscriptions;
	    });

	    var userId = null;
	    $rootScope.$on('account.loggedin', function (result) {
	    	userId	 = result.id;
	    	streamHub.subscribe(userId);
	    	Links.updateSubscriptions();
	    });


	    $rootScope.$on('account.loggedout', function (result) {
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
