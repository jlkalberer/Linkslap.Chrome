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
		$scope.isAuthenticated = function() {
			$scope.account = account.getAccount();
			return account.isAuthenticated();
		};

		$scope.logOut = function() {
			account.logOut();
			$location.path('/authenticate');
		}

		$scope.link = getUrlVars();
		$scope.link.url = settings.baseUrl + 's/' + $scope.link.streamKey;
		$scope.link.createdDate = moment($scope.link.createdDate, settings.dateFormat).format("M/D/YYYY h:mm a");
	};

	angular.module('linkslap').controller("HeaderCtrl", [ '$scope', 'AccountService', 'Settings', controller ]);
}());