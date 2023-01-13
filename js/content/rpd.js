function get_rpd_lokal(){
	show_loading();
	pesan_loading('Get data RPD dari WP-SIPD');
	var data = {
	    message:{
	        type: "get-url",
	        content: {
			    url: config.url_server_lokal,
			    type: 'post',
			    data: { 
					action: 'get_rpd',
					run: 'open_modal_rpd',
					table: 'data_rpd_tujuan_lokal',
					type: 1,
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

function open_modal_rpd(rpd){
	console.log('rpd', rpd);
	window.rpd_all = {};
	get_tujuan_rpd({tahun: _token.tahun})
	.then(function(tujuan_sipd){
		var body = '';
		rpd.map(function(b, i){
			var keyword = b.id_isu+'-'+b.id_tujuan;
			rpd_all[keyword] = b;
			var cek_tujuan = '';
			var cek_exist = '';
			var no_urut = '';
			if(b.id_unik_indikator == null){
				cek_tujuan = '#65ffb8c7';
				no_urut = '['+b.no_urut+'] ';
				tujuan_sipd.data.map(function(ts, ii){
					if(replace_string(ts.tujuan_teks) == replace_string(b.tujuan_teks)){
						cek_exist = '<b>Existing</b>'
					}
				});
			}
			for(var bb in b){
				if(b[bb] == null){
					b[bb] = '';
				}
			}
			body += ''
			+'<tr style="background:'+cek_tujuan+'">'
				+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
				+'<td class="text-center">'+cek_exist+'</td>'
				+'<td>'+b.isu_teks+'</td>'
				+'<td>'+no_urut+b.tujuan_teks+'</td>'
				+'<td>'+b.indikator_teks+'</td>'
				+'<td class="text-center">'+b.target_awal+'</td>'
				+'<td class="text-center">'+b.target_1+'</td>'
				+'<td class="text-center">'+b.target_2+'</td>'
				+'<td class="text-center">'+b.target_3+'</td>'
				+'<td class="text-center">'+b.target_4+'</td>'
				+'<td class="text-center">'+b.target_5+'</td>'
				+'<td class="text-center">'+b.target_akhir+'</td>'
				+'<td>'+b.catatan_teks_tujuan+'</td>'
			+'</tr>';
		});
		jQuery('#table-extension tbody').html(body);
		run_script('show_modal');
	});
}

function singkronisasi_rpd_dari_lokal(){
	var data_selected = [];
	jQuery('#table-extension tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_selected.push(rpd_all[id]);
		}
	});
	if(data_selected.length >= 1){
		console.log('data_selected', data_selected);
		get_tujuan_rpd({tahun: _token.tahun})
		.then(function(tujuan){
			console.log('tujuan sipd', tujuan);
			alert('Proses simpan data RPD masih dalam pengembangan!');
		});
	}else{
		alert('Pilih data dulu!');
	}
}

function get_tujuan_rpd(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpd_tujuan/list',
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

function get_sasaran_rpd(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpd_sasaran/list',
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

function get_program_rpd(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpd_program/list',
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