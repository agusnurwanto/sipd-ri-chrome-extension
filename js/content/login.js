function get_prov_login(){
	return new Promise(function(resolve, reduce){
		if(typeof prov_login_global == 'undefined'){
			var formDataCustom = new FormData();
			formDataCustom.append('search[value]', '');
			formDataCustom.append('tipe', 'prov');
			relayAjax({
				url: config.sipd_url+'api/master/provinsi/findlistpusat',
				type: 'post',
				beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
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
				data: formDataCustom,
		        processData: false,
		        contentType: false,
				success: function(ret){
					prov_login_global = ret.data;
					resolve(prov_login_global);
				}
			});
		}else{
			resolve(prov_login_global);
		}
	});
}

function get_kab_login(id_prov){
	return new Promise(function(resolve, reduce){
		if(typeof kab_login_global == 'undefined'){
			kab_login_global = {};
		}
		if(typeof kab_login_global[id_prov] == 'undefined'){
			relayAjax({
				url: config.sipd_url+'api/master/kabkot/findlist',
				type: 'post',
				beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				data: {
					'search[value]': '',
					id_daerah: id_prov
				},
				success: function(ret){
					kab_login_global[id_prov] = ret.data;
					resolve(kab_login_global[id_prov]);
				}
			});
		}else{
			resolve(kab_login_global[id_prov]);
		}
	});
	
}

function lihat_id_daerah(){
	var prov = jQuery('#prov-autocomplete').val();
	console.log('get_prov_login', prov);
	if(prov == ''){
		return;
	}
	get_prov_login()
	.then(function(prov_all){
		prov_all.map(function(b, i){
			if(b.nama_daerah == prov){
				jQuery('#id_prov').html('id_prov = '+b.id_daerah+' | kode = '+b.kode_ddn+' | '+b.nama_daerah);
				jQuery('#id_prov').attr('id_prov', b.id_daerah);
			}
		});
	});
	var id_prov = jQuery('#id_prov').attr('id_prov');
	var kab = jQuery('#kabkot-autocomplete').val();
	console.log('get_kab_login', kab, id_prov);
	if(kab == '' || typeof id_prov == 'undefined' || id_prov == ''){
		return;
	}
	get_kab_login(id_prov)
	.then(function(kab_all){
		kab_all.map(function(b, i){
			if(b.nama_daerah == kab){
				jQuery('#id_kab').html('id_kab = '+b.id_daerah+' | kode = '+b.kode_ddn+' | '+b.nama_daerah);
			}
		});
	});
}