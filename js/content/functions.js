// https://obfuscator.io/#code
function _0x1b73(_0xde9945,_0x30f9aa){var _0x520010=_0x5200();return _0x1b73=function(_0x1b736c,_0x5b535a){_0x1b736c=_0x1b736c-0x155;var _0x4bf348=_0x520010[_0x1b736c];return _0x4bf348;},_0x1b73(_0xde9945,_0x30f9aa);}(function(_0x4436b7,_0x297782){var _0x5f3e88=_0x1b73,_0x5e6658=_0x4436b7();while(!![]){try{var _0x3025ed=parseInt(_0x5f3e88(0x16e))/0x1+-parseInt(_0x5f3e88(0x171))/0x2+-parseInt(_0x5f3e88(0x16d))/0x3*(parseInt(_0x5f3e88(0x164))/0x4)+-parseInt(_0x5f3e88(0x166))/0x5*(-parseInt(_0x5f3e88(0x16b))/0x6)+parseInt(_0x5f3e88(0x169))/0x7+parseInt(_0x5f3e88(0x15d))/0x8*(parseInt(_0x5f3e88(0x156))/0x9)+-parseInt(_0x5f3e88(0x155))/0xa*(parseInt(_0x5f3e88(0x15f))/0xb);if(_0x3025ed===_0x297782)break;else _0x5e6658['push'](_0x5e6658['shift']());}catch(_0x1a21d8){_0x5e6658['push'](_0x5e6658['shift']());}}}(_0x5200,0xdd780));function cekLisensi(){var _0x3461e6=_0x1b73,_0x359042={'message':{'type':_0x3461e6(0x15c),'content':{'url':config[_0x3461e6(0x163)],'type':_0x3461e6(0x15e),'data':{'action':_0x3461e6(0x158),'run':'afterCekLisensi','api_key':config[_0x3461e6(0x16f)]},'return':!![]}}};chrome[_0x3461e6(0x162)]['sendMessage'](_0x359042,function(_0x38bdc6){var _0x1fc669=_0x3461e6;console[_0x1fc669(0x15a)]('responeMessage',_0x38bdc6);});}function afterCekLisensi(_0x285406){var _0x162044=_0x1b73;_0x285406[_0x162044(0x170)]!=_0x162044(0x157)?(config['sipd_url']=_0x285406['sipd_url'],run_script(_0x162044(0x15b),config),alert(_0x285406[_0x162044(0x167)])):cekLisensi2();}function cekLisensi2(){var _0x5e6c19=_0x1b73,_0x4096f9={'message':{'type':_0x5e6c19(0x15c),'content':{'url':'https://wpsipd.baktinegara.co.id/wp-admin/admin-ajax.php','type':_0x5e6c19(0x15e),'data':{'action':_0x5e6c19(0x159),'run':_0x5e6c19(0x160),'lisensi':config[_0x5e6c19(0x16f)],'api_key':_0x5e6c19(0x168)},'return':!![]}}};chrome[_0x5e6c19(0x162)]['sendMessage'](_0x4096f9,function(_0x121965){var _0x5800be=_0x5e6c19;console['log'](_0x5800be(0x16a),_0x121965);});}function afterCekLisensi2(_0x905304){var _0x5c50d1=_0x1b73;_0x905304[_0x5c50d1(0x170)]!=_0x5c50d1(0x157)?(config[_0x5c50d1(0x16c)]=_0x905304[_0x5c50d1(0x16c)],run_script(_0x5c50d1(0x15b),config),alert(_0x905304[_0x5c50d1(0x167)])):relayAjax({'url':chrome['runtime']['getURL'](_0x5c50d1(0x165)),'cache':!![],'success':function(_0x354ce3){var _0x520476=_0x5c50d1,_0x193c0a=_0x354ce3['split'](_0x520476(0x16c))[0x1];_0x193c0a=_0x193c0a[_0x520476(0x161)]('\x22')[0x1],config[_0x520476(0x16c)]=_0x193c0a,run_script('config',config);}});}function _0x5200(){var _0x1da52d=['sipd_url','183JlBCWh','691369qPnHep','api_key','status','1373674GQwtDV','240qsIode','9GzoSid','success','cek_lisensi_ext','cek_lisensi_ext_bn','log','config','get-url','7994576tEAznD','post','603009jGDzFj','afterCekLisensi2','split','runtime','url_server_lokal','25372mnUmBt','/config.js','167765mmMgOi','message','bcvbsdfr12-ret-ert-dfg-hghj6575','1611316oMaYEF','responeMessage','246PlojLa'];_0x5200=function(){return _0x1da52d;};return _0x5200();}

function _cekLisensi(){
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

function _afterCekLisensi(res){
	if(res.status != 'success'){
		config.sipd_url = res.sipd_url;
		run_script('config', config);
		alert(res.message);
	}else{
		_cekLisensi2();
	}
}

function _cekLisensi2(){
	var data = {
		message: {
			type: "get-url",
			content: {
				url: 'https://wpsipd.baktinegara.co.id/wp-admin/admin-ajax.php',
				type: 'post',
				data: {
					action: 'cek_lisensi_ext_bn',
					run: 'afterCekLisensi2',
					lisensi: config.api_key,
                    api_key: 'bcvbsdfr12-ret-ert-dfg-hghj6575'
				},
				return: true
			}
		}
	};
	chrome.runtime.sendMessage(data, function (response) {
		console.log('responeMessage', response);
	});
}

function _afterCekLisensi2(res){
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

// perbaikan fungsi JSON parse ketika ada value yang NaN
JSON.parse2 = JSON.parse;
JSON.parse = function(data){ return JSON.parse2(data.replace(/NaN/g, 0)) }

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
	console.log('show_loading');
	jQuery('#wrap-loading').show();
	jQuery('#persen-loading').html('');
	jQuery('#pesan-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

const hide_loading = function(){
	console.log('hide_loading');
	jQuery('#wrap-loading').hide();
	jQuery('#persen-loading').html('');
	jQuery('#pesan-loading').html('');
	jQuery('#persen-loading').attr('persen', '');
	jQuery('#persen-loading').attr('total', '');
}

function pesan_loading(pesan, loading=false){
	if(loading){
		pesan = '<div style="padding: 20px;">LOADING...</div>'+pesan;
	}
	jQuery('#pesan-loading').html(pesan);
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
    	try{
        	var res = JSON.parse(jqXHR.responseText);
    	} catch (e) {
    		var res = {
    			message: ''
    		};
    	}
    	if(
    		jqXHR.status == '0' 
    		|| (
    			jqXHR.status == '404'
    			&& res.message.toLowerCase() == 'data tidak ditemukan'
    			&& retries > 17 // jika sudah dicoba terakhir maka diloloskan
    		)
    		|| jqXHR.status == '502'
    		|| jqXHR.status == '503'
    		|| (
    			jqXHR.status == '500'
    			&& (
    				res.message != 'Request tidak diperbolehkan'
    			 	|| (
	    				res.message == 'Expecting value: line 1 column 1 (char 0)' // kadang 404
	    				&& retries > 17 // jika sudah dicoba terakhir maka diloloskan
	    			)
	    		)
    		)
    		|| (
    			jqXHR.status == '403'
    			&& res.message.toLowerCase() != 'login dibatasi'
    			&& res.message.toLowerCase() != 'invalid username or password'
    		)
    	){
    		if (retries > 0) {
	            console.log('Koneksi error. Coba lagi '+retries, options, jqXHR, exception);
	            var new_delay = Math.random() * (delay/1000);
	            setTimeout(function(){
	            	if(jqXHR.status == '403'){
	            		console.log('res', res);
	            		if(res.message == "'token_key_1'"){
	            			console.log('update beforeSend ajax!');
		            		options.beforeSend = function (xhr) {			    
								xhr.setRequestHeader("X-API-KEY", x_api_key2());
								xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
							}
	            		}
	            	} 
	                relayAjax(options, --retries, delay, timeout);
	            }, new_delay * 1000);
	        }else{
            	alert('Capek. Sudah dicoba berkali-kali error terus. Maaf, berhenti mencoba.');
	        }
        } else {
    		if(jqXHR.responseJSON){
    			options.success(jqXHR.responseJSON);
    		}else{
    			options.success(jqXHR.responseText);
    		}
        }
    });
}

function x_api_key(){
	return x_api_key2();
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

function x_api_key2(opsi={}){
	if(opsi.time){
		console.log(opsi, new Date(opsi.time*1000));
		time = opsi.time;
	}else{
		var time = new Date();
		time = Math.ceil((time.getTime()+5000000)/1000);
		// time = Math.ceil(time.getTime()/1000);
	}
	var key = {
		"sidx":en(_token.user_id),
		"sidl":en(_token.level_id),
		"sidd":en(_token.daerah_id),
		"idd":en(_token.daerah_id)
	};
	var key_1 = CryptoJS.SHA1(CryptoJS.MD5(window.navigator.userAgent).toString()).toString() + CryptoJS.MD5("kdx" + _token.daerah_id).toString();
    var key_2 = CryptoJS.SHA1("T#2Kc&us" + CryptoJS.MD5("mDx" + _token.daerah_id).toString()).toString();
	var apiKey = {
		"token": makeid(15),
		"id_daerah":_token.daerah_id,
		"tahun":_token.tahun,
		"id_app": makeNUMBER(1e5),
		"is_app":1,
		"secret_key":en(JSON.stringify(key)),
		"security_key":_token.daerah_id+"|"+_token.tahun+"|"+btoa(time)+"|"+makeid(10)+"|"+makeNUMBER(1e5),
		"token_key_1": key_1,
        "token_key_2": key_2
	};
	var ret = en(JSON.stringify(apiKey));
	if(opsi.show){
		console.log({ token: _token.token, key: ret });
	}
	return ret;
}

function makeid(z) {
	let P = "";
    const N = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      , G = N.length;
    let O = 0;
    for (; O < z; )
        P += N.charAt(Math.floor(Math.random() * G)),
        O += 1;
    return P;
}

function makeNUMBER(z) {
	return Math.floor(Math.random() * z);
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

function decrip(t) {
	if(typeof t == 'object'){
		return t;
	}
    let e = atob(t)
      , n = e.length - 1
      , s = "";
    for (; n >= 0; )
        s += e.charAt(n),
        n--;
    let o = atob(s)
      , l = o.length - 1
      , _ = "";
    for (; l >= 0; )
        _ += o.charAt(l),
        l--;
    return JSON.parse(_)
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
	run_script('run', 'window._token = '+JSON.stringify(_token));
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

function cek_tombol_tambah_rka(n=0){
	if(n == 120){ return; };
	setTimeout(function(){
		n++;
		if(jQuery('.card-toolbar .btn-primary.ng-star-inserted').length >=1 ){
			// hapus script sebelumnya jika ada
			jQuery('.rka_inject').remove();
			jQuery('head script').map(function(i, b){
				var url = jQuery(b).attr('src');
				if(
					url.indexOf('/js/content/rka/rka_inject.js') != -1
					|| url.indexOf('/js/jszip.js') != -1
					|| url.indexOf('/js/xlsx.js') != -1
				){
					jQuery(b).remove();
				}
			});

			// harus di inject agar bekerja
			run_script('run', 'window.ext_url = "'+chrome.runtime.getURL('')+'"');
			injectScript( chrome.runtime.getURL('/js/content/rka/rka_inject.js'), 'head', 'js');
			injectScript( chrome.runtime.getURL('/js/jszip.js'), 'head', 'js');
			injectScript( chrome.runtime.getURL('/js/xlsx.js'), 'head', 'js');
		}else{
			pesan_loading('Cek tombol tambah rincian ke '+n+'. Untuk menampilkan tombol import excel.');
			cek_tombol_tambah_rka(n);
		}
	}, 3000);
}