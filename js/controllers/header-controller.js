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

	var controller = function($scope, browser, settings) {
		// TODO - Allow upvoting by grabbing account.  Need communication to background app.
		// $scope.account = account.getAccount();
		$scope.link = $.deparam(window.location.href.slice(window.location.href.indexOf('?') + 1));

		$scope.share = function () {
			$scope.link.closeTab = true;
			browser.$trigger('links.send', $scope.link);
		};

		$scope.link.url = settings.baseUrl + 's/' + $scope.link.streamKey;
		var newDate = moment($scope.link.createdDate, settings.dateFormat).format("M/D/YYYY h:mm a");
		if (newDate !== "Invalid date") {
			$scope.link.createdDate = newDate;
		}
	};

	angular.module('linkslap').controller("HeaderCtrl", [ '$scope', 'Browser', 'Settings', controller ]);
}());