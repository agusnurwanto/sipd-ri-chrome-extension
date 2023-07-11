// console.log('run content_script.js');

function injectScript(file, node, _type) {
    var th = document.getElementsByTagName(node)[0];
    if(_type == 'js'){
	    var s = document.createElement('script');
	    s.setAttribute('type', 'text/javascript');
	    s.setAttribute('src', file);
	}else if(_type == 'css'){
	    var s = document.createElement('link');
	    s.setAttribute('rel', 'stylesheet');
	    s.setAttribute('href', file);
	}
    th.insertBefore(s, th.firstChild);
}
injectScript( chrome.runtime.getURL('/content_message.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/config.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/js/bootstrap.bundle.min.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/js/content/content_inject.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/js/jquery.dataTables.min.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/js/crypto-js.min.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/js/dataTables.bootstrap5.min.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/js/content/functions.js'), 'head', 'js');
injectScript( chrome.runtime.getURL('/css/dataTables.bootstrap5.min.css'), 'head', 'css');
window.data_temp_onmessage = {};

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	if(request.continue){
		if(typeof data_temp_onmessage[request.continue] == 'undefined'){
			data_temp_onmessage[request.continue] = [];
		}
		data_temp_onmessage[request.continue].push(request.data.data);
		if(request.no >= request.length){
			request.data.data = data_temp_onmessage[request.continue];
		}else{
			return;
		}
	}
	console.log('sender, request', sender, request);
	if(request.type == 'response-fecth-url'){
		var res = request.data;
		var _alert = true;
		var cek_hide_loading = true;
		if(res.action == 'get_rpjpd'){
			_alert = false;
			open_modal_rpjpd(res.data);
		}else if(res.action == 'singkron_rka'){
			if(!continue_singkron_rka[res.kode_sbl].alert){
				_alert = false;
				cek_hide_loading = false;
			}
			if(!continue_singkron_rka[res.kode_sbl].no_resolve){
				_alert = false;
				cek_hide_loading = false;
				continue_singkron_rka[res.kode_sbl].resolve(continue_singkron_rka[res.kode_sbl].next);
			}
		}else if(res.action == 'get_rpd'){
			cek_hide_loading = false;
			_alert = false;
			if(typeof continue_get_rpd != 'undefined'){
				continue_get_rpd(res.data);
			}else{
				open_modal_rpd(res.data);
			}
		}else if(res.action == 'update_nonactive_sub_bl'){
			_alert = false;
			cek_hide_loading = false;
			promise_nonactive[res.id_unit]();
		}else if(res.action == 'singkron_kategori_ssh'){
			_alert = false;
			cek_hide_loading = false;
			continue_kategori();
		}else if(res.action == 'cek_lisensi_ext'){
			_alert = false;
			cek_hide_loading = false;
			if(res.run == 'afterCekLisensi'){
				afterCekLisensi(res);
			}
		}else if(res.action == 'get_usulan_ssh_sipd'){
			_alert = false;
			cek_hide_loading = false;
			singkron_ssh_dari_lokal(res);
		}else if(res.action == 'get_renja'){
			_alert = false;
			cek_hide_loading = false;
			if(res.run == "open_modal_renja"){
				open_modal_renja(res);
			}else if(res.run == "proses_modal_renja"){
				open_modal_renja(res, true);
			}else if(res.run == "proses_hapus_modal_renja"){
				proses_hapus_modal_renja(res, true);
			};
		}
		if(cek_hide_loading){
			hide_loading();
		}
		if(_alert){
			alert(res.message);
		}
	}
	return sendResponse("THANKS from content_script!");
});