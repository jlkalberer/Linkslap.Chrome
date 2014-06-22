angular.module('linkslap')
	.factory('Link',['$rootScope', '$q','Hub', 'Restangular', 'Browser', function($rootScope, $q, Hub, rest, browser){
	    var Links = this;
	    var deferred = $q.defer();

	    var hub = new Hub('link', {
		        'openLink': function (link) {
		        	browser.openTab(link);
		        }
		    }, 
	        //Server method stubs for ease of access
	        ['subscribe', 'unsubscribe']
	    );

	    Links.subscribe = function (subscription) {
	        hub.subscribe(subscription.streamId); //Calling a server method
	        Links.subscriptions.post({ id : subscription.streamId });
	    };
	    Links.unsubscribe = function (subscription) {
	        hub.unsubscribe(subscription.streamId); //Calling a server method
	        Links.subscriptions.remove({ id : subscription.streamId });
	    }

	    Links.updateSubscriptions = function () {
	    	if (Links.subscriptions) {
	    		_.each(Links.subscriptions.$object, function (sub) {
	    			hub.unsubscribe(sub.streamId);
	    		});
	    	}

		    Links.subscriptions = rest.all('api/subscription').getList();

		    Links.subscriptions.then(function (values) {
		    	browser.$trigger('subscriptions.updated', values);
		    });

		    $q.all([Links.subscriptions, deferred.promise]).then(function() {
		    	var items = Links.subscriptions.$object;
		    	for (var i = 0; i < items.length; i += 1) {
	    			hub.subscribe(items[i].Stream.Key);
	    		}
		    });

		    return Links.subscriptions;
	    };

	    hub.promise.then(function() {
	    	deferred.resolve();
	    });

	    Links.updateSubscriptions();	

	    browser.$on('subscriptions.get', function () {
	    	browser.$trigger('subscriptions.updated', Links.subscriptions);
	    });

	    return Links;
	}]);
