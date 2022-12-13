if(typeof _token == 'undefined'){
	_token = false;
	for(var i in localStorage){ 
	    var item = localStorage.getItem(i);
	    if(item){
	        item = JSON.parse(item);
	        item = JSON.parse(item.authReducer);
	        _token = 'Bearer '+item.token;
	    }
	}
	console.log('_token', _token);
}

// untuk menjaga session
intervalSession();

var loading = ''
	+'<div id="wrap-loading">'
        +'<div class="lds-hourglass"></div>'
        +'<div id="persen-loading"></div>'
    +'</div>';
if(jQuery('#wrap-loading').length == 0){
	jQuery('body').prepend(loading);
}
var current_url = window.location.href;