function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
  } catch (e) {
    console.log(e)
  }
};

function show_loading(){
	jQuery('#wrap-loading').show();
	jQuery('#persen-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

function hide_loading(){
	jQuery('#wrap-loading').hide();
	jQuery('#persen-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

function pesan_loading(pesan, loading=false){
	if(loading){
		pesan = 'LOADING...<br>'+pesan;
	}
	jQuery('#persen-loading').html(pesan);
	console.log(pesan);
}

function run_script(command, data=false){
	postMessage({
		command: command,
		data: data
	}, '*');
}

function capitalizeFirstLetter(string) {
  	return string.charAt(0).toUpperCase() + string.slice(1);
}

function relayAjax(options, retries=20, delay=5000, timeout=1800000){
	options.timeout = timeout;
	if(!options.cache){
		options.cache = false;
	}
	if(options.length){
		var start = options.url.split('start=');
		if(start.length >= 2){
			start = +(start[1].split('&')[0]);
		}else{
			options.url += '&start=0';
			start = 0;
			options.all_data = [];
			options.success2 = options.success;
		}
		var _length = options.url.split('length=');
		if(_length.length <= 1){
			options.url += '&length='+options.length;
		}
		pesan_loading('GET DATATABLE start='+start, true);
		options.success = function(items){
			items.data.map(function(b, i){
				options.all_data.push(b);
			});
			if(options.all_data.length >= items.recordsTotal){
				items.data = options.all_data;
				options.success2(items);
			}else{
				var newstart = options.all_data.length - 1;
				options.url = options.url.replace('&start='+start, '&start='+newstart);
				setTimeout(function(){
	                relayAjax(options);
	            }, 1000);
			}
		};
	}
    jQuery.ajax(options)
    .fail(function(jqXHR, exception){
    	// console.log('jqXHR, exception', jqXHR, exception);
    	if(
    		jqXHR.status != '0' 
    		&& jqXHR.status != '503'
    		&& jqXHR.status != '500'
    	){
    		if(jqXHR.responseJSON){
    			options.success(jqXHR.responseJSON);
    		}else{
    			options.success(jqXHR.responseText);
    		}
    	}else if (retries > 0) {
            console.log('Koneksi error. Coba lagi '+retries, options);
            var new_delay = Math.random() * (delay/1000);
            setTimeout(function(){ 
                relayAjax(options, --retries, delay, timeout);
            }, new_delay * 1000);
        } else {
            alert('Capek. Sudah dicoba berkali-kali error terus. Maaf, berhenti mencoba.');
        }
    });
}

function x_api_key(){
	var time = new Date();
	time = Math.ceil(time.getTime()/1000);
	var key = {
		"sidx":en(_token.user_id),
		"sidl":en(_token.level_id),
		"sidd":en(_token.daerah_id),
		"idd":en(_token.daerah_id)
	};
	var apiKey = {
		"id_daerah":_token.daerah_id,
		"tahun":_token.tahun,
		"is_app":1,
		"secret_key":en(JSON.stringify(key)),
		"security_key":_token.daerah_id+"|"+_token.tahun+"|"+btoa(time)
	};
	return en(JSON.stringify(apiKey));
}

function intervalSession(no){
	if(!_token.user_id){
		return;
	}else{
		if(!no){
			no = 0;
		}
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url + 'api/dashboard/dashboard/rekap',
			cache: true,
			type: 'post',
			data: {
				tahun: _token.tahun,
				masuk: 'saya'
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("x-api-key", apiKey);
			},
			success: function(ret){
				if(ret.status_code == 403){
					console.log('Session user habis!');
				}else{
					no++;
					console.log('Interval session per 60s ke '+no);
					_interval = setTimeout(function(){
						intervalSession(no);
					}, 60000);
				}
			}
		});
	}
}

function intervalSession_lama(no){
	if(!_token.user_id){
		return;
	}else{
		if(!no){
			no = 0;
		}
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url + 'api/master/user/getuserbytoken',
			cache: true,
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("authorization", "Bearer "+_token.token+'|'+_token.daerah_id+'|'+_token.user_id);
			    xhr.setRequestHeader("x-api-key", apiKey);
			    xhr.setRequestHeader("accept", 'application/json, text/plain, */*');
			},
			xhr: function() {
		        var xhr = jQuery.ajaxSettings.xhr();
		        var setRequestHeader = xhr.setRequestHeader;
		        xhr.setRequestHeader = function(name, value) {
		            if (name == 'X-Requested-With') return;
		            setRequestHeader.call(this, name, value);
		        }
		        return xhr;
		    },
			success: function(ret){
				if(ret.status_code == 403){
					console.log('Session user habis!');
				}else{
					no++;
					console.log('Interval session per 60s ke '+no);
					_interval = setTimeout(function(){
						intervalSession(no);
					}, 60000);
				}
			}
		});
	}
}

function de(data){
	return atob(atob(data));
}

function en(data){
	return btoa(btoa(data));
}

function getToken(){
	_token = false;
	for(var i in localStorage){ 
		if(
			i.indexOf('auth') != -1
			|| i == 'sipd-konfigurasi'
		){
		    var item = localStorage.getItem(i);
	    	if(!_token){
	    		_token = {};
	    	}
	    	item = JSON.parse(item);
	    	for(var i in item){
	        	_token[i] = item[i];
	    	}
		}
	}
	console.log('_token', _token);
}