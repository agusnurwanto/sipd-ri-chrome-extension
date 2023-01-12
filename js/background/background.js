console.log('Salam semangat!');

const main_js = {
	url: 'https://sipd-ri.kemendagri.go.id/main.f4b904b6c616e74d.js',
	content: ''
};
loadUnBlock(main_js.url);

function listener(details) {
	loadUnBlock(details.url);
	if(details.url.indexOf('/main.') != -1){
		return {redirectUrl: "data:text/html,"+main_js.content+";"};
	}else{
		return {redirectUrl: "data:text/html,;"};
	}
}

// chrome.webRequest.onBeforeRequest.addListener(
//   listener,
//   {
//     urls: [
//     	main_js.url
//     ],
//     types: ["script"]
//   },
//   ["blocking"]
// );

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	console.log('request', request);
	var type = request.message.type;
	if(type == 'get-url'){
		relayAjax({
		    url: request.message.content.url,
		    type: request.message.content.type,
		    data: request.message.content.data,
		    dataType: 'json',
		    success:function(ret){
		    	if(request.message.content.return){
		    		// jika continue tidak kosong maka data akan dikirim secara terpisah agar terhindar dari limit makasimal
		    		if(
		    			request.message.content.continue
		    			&& ret.data.length >= 1
		    		){
		    			var ret_temp = ret;
		    			var _length = ret.data.length;
		    			ret.data.map(function(b, i){
		    				ret_temp.data = b;
		    				var options = {
					     		type: 'response-fecth-url',
					     		data: ret_temp,
					     		tab: sender.tab,
					     		continue: request.message.content.continue,
					     		length: _length,
					     		no: i+1
					     	}
					     	if(request.message.content.resolve){
					     		options.resolve = resolve;
					     	}
					     	if(i+1 < _length){
					     		sendMessageTabActive(options, '', true);
					     	}else{
					     		sendMessageTabActive(options);
					     	}
		    			});
		    		}else{
				     	var options = {
				     		type: 'response-fecth-url',
				     		data: ret,
				     		tab: sender.tab
				     	}
				     	if(request.message.content.resolve){
				     		options.resolve = resolve;
				     	}
				     	sendMessageTabActive(options);
					}
			    }
		        // console.log(ret, request.message.content);
		        console.log(ret);
		    },
		    error:function(){
		        console.log("Error AJAX");
		    }      
		});
	}
	return sendResponse("THANKS from background!");
});