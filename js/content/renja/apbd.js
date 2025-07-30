function get_apbd_per_jadwal(){
	return new Promise(function(resolve, reject){
		show_loading();
		pesan_loading('Get daftar jadwal SIPD tahun = '+_token.tahun);
		get_tahapan_apbd()
		.then(function(){
			relayAjax({
				url: config.sipd_url+'api/jadwal/anggaran_jadwal/list_all_tahap',
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
			url: config.sipd_url+'api/master/tahapan/list_all_tanpa_kondisi',
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

function singkron_apbd_per_jadwal(data_selected){
	show_loading();
	var last = data_selected.length-1;
	data_selected.reduce(function(sequence, nextData){
        return sequence.then(function(current_data){
    		return new Promise(function(resolve_reduce, reject_reduce){
				pesan_loading('Get data APBD dari jadwal '+current_data.nama_sub_tahap);
				relayAjax({
					url: config.sipd_url+'api/renja/rekap/rekap_ver5',
					type: 'POST',
					data: {
						id_daerah: _token.daerah_id,
						tahun: _token.tahun,
						id_jadwal: current_data.id_jadwal
					},
					beforeSend: function (xhr) {			    
						xhr.setRequestHeader("X-API-KEY", x_api_key2());
						xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
					},
					success: function(ret){
						// console.log('ret.data', ret.data);
						var all_data_formated = [];
						var data_sementara = [];
						ret.data.map(function(b, i){
							data_sementara.push(b);
							if(i % 500 == 0){
								all_data_formated.push(data_sementara);
								data_sementara = [];
							}
						});
						if(data_sementara.length >= 1){
							all_data_formated.push(data_sementara);
						}
						send_apbd_per_jadwal_lokal(current_data, all_data_formated, function(){
							return resolve_reduce(nextData);
						});
					}
				});
    		})
            .catch(function(e){
                console.log(e);
                return Promise.resolve(nextData);
            });
        })
        .catch(function(e){
            console.log(e);
            return Promise.resolve(nextData);
        });
    }, Promise.resolve(data_selected[last]))
    .then(function(data_last){
    	hide_loading();
		alert('Masih dalam pengembangan');
	});
}

function send_apbd_per_jadwal_lokal(jadwal, all_data, callback){
	var last = all_data.length-1;
	var hal = 0;
	all_data.reduce(function(sequence, nextData){
        return sequence.then(function(current_data){
    		return new Promise(function(resolve_reduce, reject_reduce){
    			hal++;
				pesan_loading('Kirim APBD halaman '+hal+' dari jadwal '+jadwal.nama_sub_tahap);
    			var opsi = {
					action: 'singkron_apbd_per_jadwal',
					api_key: config.api_key,
					tahun_anggaran: _token.tahun,
					data: current_data,
					id_jadwal: jadwal.id_jadwal
				};
				var data = {
					message:{
						type: "get-url",
						content: {
							url: config.url_server_lokal,
							type: 'post',
							data: opsi,
							return: true
						}
					}
				};
				chrome.runtime.sendMessage(data, function(response) {
					console.log('responeMessage', response);
				});
				if(typeof window.global_all_apbd == 'undefined'){
					window.global_all_apbd = {};
				}
				window.global_all_apbd = {
					resolve_reduce: resolve_reduce,
					nextData: nextData
				}
				// return resolve_reduce(nextData);
    		})
            .catch(function(e){
                console.log(e);
                return Promise.resolve(nextData);
            });
        })
        .catch(function(e){
            console.log(e);
            return Promise.resolve(nextData);
        });
    }, Promise.resolve(all_data[last]))
    .then(function(data_last){
		callback();
	});
}