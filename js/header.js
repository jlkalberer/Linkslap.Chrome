jQuery(function() {
	var $ = jQuery;

	var iframe = $("<iframe frameBorder='0'></script>");
	iframe.attr("width", "100%");
	iframe.css({
		"width":"100%",
		"z-index":"999999",
		"position":"absolute",
		"top":"0",
		"left":"0"
	});
	iframe.attr("src", chrome.extension.getURL("/header.html?" + linkModel));
	var body = $("body").append(iframe);

	iframe.load(function() {
	    setTimeout(function() {
	    	var height = iframe.height();
	    	iframe.css({ '-webkit-transform' : 'translate(0,' + -height + 'px)'});
	    	$('html').css('-webkit-transform', 'translate(0,' + height + 'px)');
	    }, 50);
	});
});