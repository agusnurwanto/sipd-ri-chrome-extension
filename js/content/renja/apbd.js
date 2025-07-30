function get_apbd_per_jadwal(){
	return new Promise(function(resolve, reject){
		show_loading();
		pesan_loading('Get daftar jadwal SIPD tahun = '+_token.tahun);
		get_tahapan_apbd()
		.then(function(){
			relayAjax({
				url: config.sipd_url+'api/jadwal/anggaran_jadwal/list',
				type: 'POST',
				data: {
					id_daerah: _token.daerah_id,
					tahun: _token.tahun
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key2());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
				success: function(all_jadwal){
					window.all_jadwal_apbd = {};
					var body = '';
					all_jadwal.data.map(function(b, i){
						all_jadwal_apbd[b.id_jadwal] = b;
						var date = new Date(b.waktu_mulai);
						var waktu_mulai =
						  	date.getDate() + "-" +
						  	(date.getMonth() + 1) + "-" +
						  	date.getFullYear() + " " +
						  	date.toLocaleTimeString('en-GB');

						var date = new Date(b.waktu_selesai);
						var waktu_selesai =
						  	date.getDate() + "-" +
						  	(date.getMonth() + 1) + "-" +
						  	date.getFullYear() + " " +
						  	date.toLocaleTimeString('en-GB');

						body += ''
						+'<tr>'								
							+'<td class="text-center"><input type="checkbox" value="'+b.id_jadwal+'"></td>'
							+'<td class="text-center">'+b.id_jadwal+'</td>'					
							+'<td>'+all_tahap_apbd[b.id_tahap].nama_tahap+'</td>'					
							+'<td>'+b.nama_sub_tahap+'</td>'
							+'<td class="text-center">'+waktu_mulai+' - '+waktu_selesai+'</td>'
						+'</tr>';
					})
					jQuery('#table-extension tbody').html(body);
					run_script('show_modal_sm', {order: [[1, "desc"]]});
					hide_loading();
				}
			});
		})
	})
}

function get_tahapan_apbd(){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/master/tahapan/list_budget/'+_token.tahun,
			type: 'GET',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(all_tahap){
				window.all_tahap_apbd = {};
				all_tahap.data.map(function(b, i){
					all_tahap_apbd[b.id_tahap] = b;
				});
				resolve();
			}
		});
	});
}

function singkron_apbd_per_jadwal_modal(){
	var data_selected = [];
	jQuery('#table-extension tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_selected.push(all_jadwal_apbd[id]);
		}
	});
	if(data_selected.length >= 1){
		console.log('data_selected', data_selected);
		if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
			singkron_apbd_per_jadwal(data_selected);
		}		
	}else{
		alert('Pilih data dulu!');
	}
}

function singkron_apbd_per_jadwal(){
	alert('Masih dalam pengembangan');
}