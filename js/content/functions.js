function cekLisensi(){
	var data = {
		message: {
			type: "get-url",
			content: {
				url: config.url_server_lokal,
				type: 'post',
				data: {
					action: 'cek_lisensi_ext',
					run: 'afterCekLisensi',
                    api_key: config.api_key
				},
				return: true
			}
		}
	};
	chrome.runtime.sendMessage(data, function (response) {
		console.log('responeMessage', response);
	});
}

function afterCekLisensi(res){
	if(res.status != 'success'){
		config.sipd_url = res.sipd_url;
		run_script('config', config);
		alert(res.message);
	}else{
		relayAjax({
			url: chrome.runtime.getURL('/config.js'),
			cache: true,
			success: function(ret){
				var sipd_url = ret.split('sipd_url')[1];
				sipd_url = sipd_url.split('"')[1];
				config.sipd_url = sipd_url;
				run_script('config', config);
			}
		});
	}
}

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

const show_loading = function(){
	jQuery('#wrap-loading').show();
	jQuery('#persen-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

const hide_loading = function(){
	jQuery('#wrap-loading').hide();
	jQuery('#persen-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

function pesan_loading(pesan, loading=false){
	if(loading){
		pesan = '<div style="padding: 20px;">LOADING...</div>'+pesan;
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
    		&& jqXHR.status != '502'
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
		// dimatikan dulu karena tidak terpakai. seharusnya pakai refresh token
		return;
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
			|| i == 'sipd-konfigurasi' || i == 'sipd-konfigurasi-unit-set'
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

function parseJwt(J) {
    var Ue = J.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    var He = decodeURIComponent(atob(Ue).split("").map(function(ne) {
        return "%" + ("00" + ne.charCodeAt(0).toString(16)).slice(-2)
    }).join(""));
    return JSON.parse(He)
}

// https://www.jonathan-petitcolas.com/2014/11/27/creating-json-web-token-in-javascript.html
function enJwt(data) {
	var secret = "My very confidential secret!";
	var header = {
	  "alg": "HS256",
	  "typ": "JWT"
	};
	var stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
	var encodedHeader = base64url(stringifiedHeader);
	var stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
	var encodedData = base64url(stringifiedData);
	var token = encodedHeader + "." + encodedData;
	var signature = CryptoJS.HmacSHA256(token, secret);
	signature = base64url(signature);
	var signedToken = token + "." + signature;
    return signedToken;
}

function base64url(source) {
  encodedSource = CryptoJS.enc.Base64.stringify(source);
  encodedSource = encodedSource.replace(/=+$/, '');
  encodedSource = encodedSource.replace(/\+/g, '-');
  encodedSource = encodedSource.replace(/\//g, '_');
  return encodedSource;
}

function removeNewlines(str) {
	//remove line breaks from str
	str = str.replace(/\s{2,}/g, ' ');
	str = str.replace(/\t/g, ' ');
	str = str.toString().trim().replace(/\n/g," ");
	return str;
}

function replace_string(text_awal, no_lowercase=false, no_replace=false, recursive=false){
	if(no_lowercase){
		var text = jQuery('<textarea />').html(text_awal.trim()).text();
	}else{
		var text = jQuery('<textarea />').html(text_awal.toLowerCase().trim()).text();	
	}
	if(!no_replace){
		text = text.replace(/⁰/g, '0');
		text = text.replace(/⁹/g, '9');
		text = text.replace(/⁸/g, '8');
		text = text.replace(/⁷/g, '7');
		text = text.replace(/⁶/g, '6');
		text = text.replace(/⁵/g, '5');
		text = text.replace(/⁴/g, '4');
		text = text.replace(/³/g, '3');
		text = text.replace(/²/g, '2');
		text = text.replace(/¹/g, '1');
		text = text.replace(/'/g, '`');
		text = text.replace(/&/g, 'dan');
		text = text.replace(/Â/g, '');
		text = text.replace(/â/g, '’');
		text = text.replace(/€/g, '');
		text = text.replace(/™/g, '');
		text = text.replace(/˜/g, '');
		text = text.replace(/\n/g, ' ');
	}
	if(recursive && text_awal.length != text.length){
		return replace_string(text, no_lowercase, no_replace, recursive);
	}else{
		return text.trim();
	}
}

function formData(data){
	var formDataCustom = new FormData();
	for(var i in data){
		formDataCustom.append(i, data[i]);
	}
	return formDataCustom;
}

function relayAjaxApiKey(options){
	options.beforeSend = function (xhr) {
	    xhr.setRequestHeader("x-api-key", x_api_key());
		xhr.setRequestHeader("x-access-token", _token.token);
	};
	options.xhr = function() {
        var xhr = jQuery.ajaxSettings.xhr();
        var setRequestHeader = xhr.setRequestHeader;
        xhr.setRequestHeader = function(name, value) {
            if (name == 'X-Requested-With') return;
            setRequestHeader.call(this, name, value);
        }
        return xhr;
    };
    if(options.type.toLowerCase() == 'post'){
		options.cache = true;
		options.processData = false; 
		options.contentType = false;
	}
    relayAjax(options);
}

function objToArray(obj){
	var arr = [];
	for(var i in obj){
		arr.push(obj[i]);
	}
	return arr;
}

function getUrlVars(param=null)
{
	if(param !== null)
	{
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars[param];
	} 
	else 
	{
		return null;
	}
}

function token_sub_keg(sub_giat) {
	let key1 = Math.floor(1e6 * Math.random());
	let key2 = Math.floor(1e6 * Math.random())
	let token1 = Number(key1) + Number(_token.user_id) + Number(sub_giat.id_sub_giat) + Number(_token.tahun)
	let token2 = Number(sub_giat.id_sub_giat) + Number(sub_giat.id_sub_giat) + Number(sub_giat.id_sub_skpd)
	let token3 = Number(sub_giat.id_sub_giat) + Number(sub_giat.id_sub_skpd) + Number(sub_giat.id_sub_skpd)
	let token4 = String(makeid(15) + "." + String(token1) + "." + String(key1) + "." + String(token2) + "." + String(key2) + "." + String(token3) + "." + String(key1 + key2));

	console.log('token_sub_keg', _token.user_id, sub_giat.id_sub_giat, _token.tahun, sub_giat.id_sub_skpd);
	return token4;
}

function makeid(t) {
    let e = "";
    const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      , s = n.length;
    let o = 0;
    for (; o < t; )
        e += n.charAt(Math.floor(Math.random() * s)),
        o += 1;
    return e;
}