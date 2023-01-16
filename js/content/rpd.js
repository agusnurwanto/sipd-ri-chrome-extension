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
			var keyword = b.id_isu+'-'+b.id_unik+'-'+b.id_unik_indikator;
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

function getJadwalAktifRpd(){
	return new Promise(function(resolve, reduce){
		relayAjax({
			url: config.sipd_url+'api/jadwal/rpjm_jadwal/cekAktif',
			cache: true,
			type: 'post',
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
				isRpd: 1
			},
			success: function(ret){
				relayAjax({
					url: config.sipd_url+'api/master/tahapan/view/'+ret.data[0].id_tahap,
					cache: true,
					beforeSend: function (xhr) {
					    xhr.setRequestHeader("x-api-key", x_api_key());
						xhr.setRequestHeader("x-access-token", _token.token);
					},
					success: function(ret2){
						ret.data[0].detail_tahap = ret2.data[0];
						resolve(ret.data[0]);
					}
				});
			}
		});
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
		getJadwalAktifRpd()
		.then(function(jadwal){
			get_tujuan_rpd({tahun: _token.tahun})
			.then(function(tujuan_ri){
				var last = data_selected.length-1;
				data_selected.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			if(current_data.id_unik_indikator != ''){
		        				return resolve_reduce(nextData);
		        			}
		        			var tujuan_wp = replace_string(current_data.tujuan_teks);
		        			var check_exist = false;
		        			tujuan_ri.data.map(function(b, i){
		        				if(tujuan_wp == replace_string(b.tujuan_teks)){
		        					check_exist = b;
		        				}
		        			});
		        			// jika tujuan kosong
		        			if(!check_exist){
		        				relayAjax({
		        					url: config.sipd_url+'api/rpjm/rpd_tujuan/add',
									cache: true,
									processData: false, 
									contentType: false,
		        					type: 'post',
									beforeSend: function (xhr) {
									    xhr.setRequestHeader("x-api-key", x_api_key());
				    					xhr.setRequestHeader("x-access-token", _token.token);
									},
		        					data: formData({
		        						urut_tujuan: current_data.urut_tujuan,
		        						id_daerah: _token.daerah_id,
										tahun_awal: jadwal.tahun_awal,
										tahun_akhir: jadwal.tahun_akhir,
										id_tahap: jadwal.id_tahap,
										nama_tahap: jadwal.detail_tahap.nama_tahap,
										tujuan_teks: current_data.tujuan_teks,
										indikator_teks: '',
										satuan: '',
										target_awal: '',
										target_1: '',
										target_2: '',
										target_3: '',
										target_4: '',
										target_5: '',
										target_akhir: '',
										rpjpd_id_visi: 0,
										rpjpd_id_misi: 0,
										rpjpd_id_sasaran: 0,
										rpjpd_id_kebijakan: 0,
										rpjpd_id_strategi: 0,
										id_user_log: _token.user_id,
										id_daerah_log: _token.daerah_id,
										id_misi: 0,
										id_unik_indikator: ''
		        					}),
		        					success: function(ret){
		        						resolve_reduce(nextData);
		        					}
		        				});
		        			// jika nomor urut tidak sama diupdate
		        			}else if(
		        				current_data.no_urut != ''
		        				&& check_exist.urut_tujuan != current_data.no_urut
		        			){
		        				relayAjax({
		        					url: config.sipd_url+'api/rpjm/rpd_tujuan/updateByTujuanTeks',
									cache: true,
									processData: false, 
									contentType: false,
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
		        					data: formData({
		        						urut_tujuan: current_data.no_urut,
		        						id_daerah: check_exist.id_daerah,
										tahun_awal: check_exist.tahun_awal,
										tahun_akhir: check_exist.tahun_akhir,
										id_tahap: check_exist.id_tahap,
										nama_tahap: check_exist.nama_tahap,
										tujuan_teks: check_exist.tujuan_teks,
										indikator_teks: check_exist.indikator_teks,
										satuan: check_exist.satuan,
										target_awal: check_exist.target_awal,
										target_1: check_exist.target_1,
										target_2: check_exist.target_2,
										target_3: check_exist.target_3,
										target_4: check_exist.target_4,
										target_5: check_exist.target_5,
										target_akhir: check_exist.target_akhir,
										rpjpd_id_visi: check_exist.rpjpd_id_visi,
										rpjpd_id_misi: check_exist.rpjpd_id_misi,
										rpjpd_id_sasaran: check_exist.rpjpd_id_sasaran,
										rpjpd_id_kebijakan: check_exist.rpjpd_id_kebijakan,
										rpjpd_id_strategi: check_exist.rpjpd_id_strategi,
										id_user_log: _token.user_id,
										id_daerah_log: _token.daerah_id,
										id_misi: check_exist.id_misi,
										id_misi_old: check_exist.id_misi,
										id_tujuan_old: check_exist.id_tujuan_old,
										tujuan_teks_old: check_exist.tujuan_teks,
										id_unik: check_exist.id_unik,
										is_locked: check_exist.is_locked,
										is_locked_indikator: check_exist.is_locked_indikator
		        					}),
		        					success: function(ret){
		        						resolve_reduce(nextData);
		        					}
		        				});
		        			}else{
		        				resolve_reduce(nextData);
		        			}
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
		        .then(function(){
					alert('Proses simpan data RPD masih dalam pengembangan!');
		        });
			});
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