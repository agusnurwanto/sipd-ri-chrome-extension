function get_arsip_ssh(opsi){
	//console.log(opsi, request.message.content);
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/list',
			type: 'post',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				kelompok: 1,
				tipe: 'SSH',
				is_locked: 3,
			},
			beforeSend: function (xhr) {
			    //xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(ret){
				//localStorage.setItem(auth_key, JSON.stringify(ret));
				resolve(ret);
			}
		})
	});
}

function get_arsip_sbu(opsi){
	//console.log(opsi, request.message.content);
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/list',
			type: 'post',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				kelompok: 4,
				tipe: 'SBU',
				is_locked: 3,
			},
			beforeSend: function (xhr) {
			    //xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(ret){
				resolve(ret);
			}
		})
	});
}

function singkron_ssh_ke_lokal(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		jQuery('#wrap-loading').show();
		jQuery('#persen-loading').attr('persen', 0);
		jQuery('#persen-loading').html('0%');
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/listAll',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				kelompok: 1,
				tipe: 'SSH',
				//search[value]:'',
				//length: 1000,
				start: 0,				
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			// success: function(data){
			success: function(ret){
				console.log("SUCCESS : ", ret);
				resolve(ret);
			}
		});
	}
}

function hapus_arsip_ssh(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/deleteArsip',
			type: 'post',
			data: {
				tahun: opsi.tahun,
				id_daerah: _token.daerah_id,				
				id_standar_harga: _token.id_standar_harga,
				id_user_log: _token.user_id,
				id_daerah_log: _token.daerah_id,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("X-API-KEY", apiKey);
			},
			success: function(ret){
				resolve();
				if(ret.status_code == 403){
					console.log('Session user habis!');
				}else{
					console.log('success simpan visi!');
				}
			}
		})
	});
}