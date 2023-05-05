function get_prov_login(){
	return new Promise(function(resolve, reduce){
		if(typeof prov_login_global == 'undefined'){
			relayAjax({
				url: config.sipd_url+'api/master/provinsi/findlistpusat',
				type: 'post',
				beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				data: {
					'search[value]': '',
					tipe: 'prov'
				},
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