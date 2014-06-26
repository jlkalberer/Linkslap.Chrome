(function() {
	var app = angular.module("linkslap");

	app.provider('Settings',function () {
		var self = this;
		// At some point this may be filled with things that aren't constants..
		this.$get = function () {
			return self;
		};
		
		this.baseUrl = 'http://linkslap.me/'
		//this.baseUrl = 'http://localhost:37459/';
		this.dateFormat = "YYYY-MM-DDTHH:mm:ss.SSSZ";

	});
}());