function get_rpjpd_lokal(){
	show_loading();
	pesan_loading('Get data RPJPD dari WP-SIPD');
	var data = {
	    message:{
	        type: "get-url",
	        content: {
			    url: config.url_server_lokal,
			    type: 'post',
			    data: { 
					action: 'get_rpjpd',
					run: 'open_modal_rpjpd',
					table: 'all',
					api_key: config.api_key
				},
    			return: true
			}
	    }
	};
	chrome.runtime.sendMessage(data, function(response) {
	    console.log('responeMessage', response);
	});
}

function open_modal_rpjpd(rpjpd){
	console.log('RPJPD', rpjpd);
	window.rpjpd_all = {};
	var body = '';
	rpjpd.map(function(b, i){
		var keyword = b.id_visi+'-'+b.id_misi+'-'+b.id_sasaran+'-'+b.id_kebijakan+'-'+b.id_isu;
		rpjpd_all[keyword] = b;
		body += ''
		+'<tr>'
			+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
			+'<td>'+b.visi_teks+'</td>'
			+'<td>'+b.misi_teks+'</td>'
			+'<td>'+b.saspok_teks+'</td>'
			+'<td>'+b.kebijakan_teks+'</td>'
			+'<td>'+b.isu_teks+'</td>'
		+'</tr>';
	});
	jQuery('#table-extension tbody').html(body);
	run_script('show_modal');
}

function singkronisasi_rpjpd_dari_lokal(){
	var data_selected = [];
	jQuery('#table-extension tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_selected.push(rpjpd_all[id]);
		}
	});
	if(data_selected.length >= 1){
		console.log('data_selected', data_selected);
		get_visi({tahun: _token.tahun})
		.then(function(visi){
			console.log('visi sipd', visi);
			alert('Proses simpan data RPJPD masih dalam pengembangan!');
		});
	}else{
		alert('Pilih data dulu!');
	}
}

function get_visi(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpjpd_visi/list',
			type: 'post',
			data: {
				id_daerah: _token.daerah_id,
				tahun: opsi.tahun,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("X-API-KEY", apiKey);
			},
			success: function(ret){
				resolve(ret);
			}
		})
	});
}

function get_misi(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpjpd_misi/list',
			type: 'post',
			data: {
				id_daerah: _token.daerah_id,
				tahun: opsi.tahun,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("X-API-KEY", apiKey);
			},
			success: function(ret){
				resolve(ret);
			}
		})
	});
}

function get_sasaran(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpjpd_sasaran/list',
			type: 'post',
			data: {
				id_daerah: _token.daerah_id,
				tahun: opsi.tahun,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("X-API-KEY", apiKey);
			},
			success: function(ret){
				resolve(ret);
			}
		})
	});
}

function get_kebijakan(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpjpd_kebijakan/list',
			type: 'post',
			data: {
				id_daerah: _token.daerah_id,
				tahun: opsi.tahun,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("X-API-KEY", apiKey);
			},
			success: function(ret){
				resolve(ret);
			}
		})
	});
}

function get_strategi(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpjpd_strategi/list',
			type: 'post',
			data: {
				id_daerah: _token.daerah_id,
				tahun: opsi.tahun,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("X-API-KEY", apiKey);
			},
			success: function(ret){
				resolve(ret);
			}
		})
	});
}

function tambah_visi(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpjpd_visi/add',
			type: 'post',
			data: {
				id_daerah: _token.daerah_id,
				tahun_awal: opsi.tahun_awal,
				tahun_akhir: opsi.tahun_akhir,
				visi_teks: opsi.visi_teks,
				id_user_log: _token.user_id,
				id_daerah_log: _token.daerah_id,
				created_user: _token.user_id
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