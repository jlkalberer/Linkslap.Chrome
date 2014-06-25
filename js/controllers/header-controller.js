(function() {
	function getUrlVars() {
	    var vars = [], hash;
	    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	    for(var i = 0; i < hashes.length; i++)
	    {
	        hash = hashes[i].split('=');
	        vars.push(hash[0]);
	        vars[hash[0]] = decodeURIComponent(hash[1].replace(/\+/g, " "));
	    }
	    return vars;
	}

	var controller = function($scope, account, settings) {
		// TODO - Allow upvoting by grabbing account.  Need communication to background app.
		// $scope.account = account.getAccount();

		$scope.link = getUrlVars();
		$scope.link.url = settings.baseUrl + 's/' + $scope.link.streamKey;
		$scope.link.createdDate = moment($scope.link.createdDate, settings.dateFormat).format("M/D/YYYY h:mm a");
	};

	angular.module('linkslap').controller("HeaderCtrl", [ '$scope', 'AccountService', 'Settings', controller ]);
}());