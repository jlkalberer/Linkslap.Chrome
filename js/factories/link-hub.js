angular.module('linkslap')
	.factory('Link',['$rootScope', '$q','Hub', 'Restangular', 'Browser', function($rootScope, $q, Hub, rest, browser){
	    var Links = this;

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
		    Links.subscriptions = rest.all('api/subscription').getList();
	    };

	    Links.updateSubscriptions();

	    var deferred = $q.defer();

	    hub.promise.then(function() {
	    	deferred.resolve();
	    });

	    $q.all([Links.subscriptions, deferred.promise]).then(function() {
	    	var items = Links.subscriptions.$object;
	    	for (var i = 0; i < items.length; i += 1) {
    			hub.subscribe(items[i].Stream.Key);
    		}
	    });

	    return Links;
	}]);
