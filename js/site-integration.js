$(function() {
	function SendMessage(eventName, values, callback) {
		chrome.runtime.sendMessage("enedgjpcpdndphojklmjbcgcmdngigna", {eventName: eventName, data: values}, callback);
	}

	$("body").append("<div class='linkslap-is-installed'></div>");
	$(".btn-extension").hide();
	
	$("#join-stream").show()
		.on("click", function() {
			var feed = $(this).find(".join-feed-hidden-field");
			
			if (!feed.length) {
				return;
			}
			
			if (!chrome.runtime) {
				location.reload();
				return;
			}

			SendMessage("subscriptions.subscribe", feed.val(), function () {
				$("#join-stream").hide();
			});
		});
	
	$("#chrome-install").prop("disabled", true);

	SendMessage("subscriptions.get", null, function (subscriptions) {
		var joinButton = $("#join-stream");
		var val = $("#join-stream input").val();
		$.each(subscriptions, function (index, sub) {
			if (sub.stream.key !== val) {
				return;
			}

			joinButton.hide();
		})
	})
});