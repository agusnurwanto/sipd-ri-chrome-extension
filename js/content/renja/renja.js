function list_skpd_sub_bl(){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/list_skpd',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
				limit: 10000
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(units){
				var data_all = { data: [] };
				var last = units.data.length-1;
				units.data.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
							list_belanja_by_tahun_daerah_unit(current_data.id_skpd)
							.then(function(sub_keg_exist){
								current_data.id_daerah = _token.daerah_id;
								current_data.id_level = _token.level_id;
								current_data.id_user = _token.user_id;
								current_data.nilairincian = 0;
								current_data.rinci_giat = 0;
								current_data.nilaipagu = 0;
								sub_keg_exist.data.map(function(b, i){
									current_data.nilaipagu += b.pagu;
									current_data.nilairincian += b.rincian;
									current_data.rinci_giat += b.rinci_giat;
								});
								data_all.data.push(current_data);
								return resolve_reduce(nextData);
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
		        }, Promise.resolve(units.data[last]))
		        .then(function(data_last){
					return resolve(data_all);
		        });
			}
		});
	})
}

function open_modal_skpd(){
	window.rka_all = {};
	var body = '';
	show_loading();
	list_skpd_sub_bl()
	.then(function(units){
		console.log('data', units.data);
		window.units_skpd = units.data;				
		// jika admin
		if(idunitskpd == 0){
			var last = units.data.length-1;
			units.data.reduce(function(sequence, nextData){
	            return sequence.then(function(b){
	        		return new Promise(function(resolve_reduce, reject_reduce){
						get_setup_unit(b)
						.then(function(unit){
							var keyword = b.id_skpd+'-'+b.id_unit;
							rka_all[keyword] = b;
							body += ''
								+'<tr>'								
									+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
									+'<td>'+b.kode_skpd+' - '+b.nama_skpd+'</td>'
									+'<td>'
										+'<ul>'
											+'<li>kunci_tambah_giat: '+unit['data'][0].kunci_tambah_giat+'</li>'
											+'<li>kunci_skpd: '+unit['data'][0].kunci_skpd+'</li>'
											+'<li>kunci_input_biaya: '+unit['data'][0].kunci_input_biaya+'</li>'
											+'<li>kunci_input_penda: '+unit['data'][0].kunci_input_penda+'</li>'
										+'</ul>'
									+'</td>'								
								+'</tr>';
							resolve_reduce(nextData);
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
	        }, Promise.resolve(units.data[last]))
	        .then(function(data_last){
				jQuery('#table-extension tbody').html(body);
				run_script('show_modal_sm', {order: [[1, "asc"]]});
				hide_loading();
	        });
		}else{
			var cek_skpd = false;
			units.data.map(function(b, i){
				if(b.id_skpd == idunitskpd){
					cek_skpd = b;
				}
			});
			if(cek_skpd){
				singkron_rka_ke_lokal_all(cek_skpd, function(){
    				alert('Berhasil singkron data!');
					hide_loading();
    			});
			}else{
				alert('Data SKPD tidak ditemukan!');
				hide_loading();
			}
		}
	});
}

function get_renja_lokal(no_popup=false){
	return new Promise(function(resolve, reject){
		window.global_resolve_get_renja_lokal = resolve;
		show_loading();
		pesan_loading('Get data RENJA dari WP-SIPD');
		var _run = 'open_modal_renja';
		if(no_popup){
			_run = 'proses_modal_renja';
		}
		var data = {
		    message:{
		        type: "get-url",
		        content: {
				    url: config.url_server_lokal,
				    type: 'post',
				    data: { 
						action: 'get_renja',
						run: _run,
						id_skpd: idunitskpd,
						tahun_anggaran: _token.tahun,
						api_key: config.api_key
					},
	    			return: true
				}
		    }
		};
		chrome.runtime.sendMessage(data, function(response) {
		    console.log('responeMessage', response);
		});
	});
}

function open_modal_renja(res, run_proses = false){
	if(res.status == 'error'){
		hide_loading();
		return alert(res.message);
	}
	// load sumber dana di awal agar tidak memberatkan proses yg lain
	get_sumber_dana_master()
	.then(function(data_dana){
		window.global_all_sumber_dana_obj = {};
		data_dana.map(function (dana, i) {
			global_all_sumber_dana_obj[dana.kode_dana] = dana;
		});
	});

	if(!run_proses){
		pesan_loading(res.message+' run open_modal_renja!');
		window.rka_all = {};
	    get_detil_skpd({
	    	idskpd: idunitskpd,
	    	tahun: _token.tahun,
	    	iddaerah: _token.daerah_id
	    })
		.then(function(data_skpd){
			list_belanja_by_tahun_daerah_unit(idunitskpd)
			.then(function(sub_keg_exist){
				var rka_sipd = {};
				sub_keg_exist.data.map(function(b, i){
					rka_sipd[b.nama_sub_giat] = b;
				});

				var body = '';
				res.data.map(function(b, i){
					var keyword = b.kode_sbl;
					rka_all[keyword] = b;

					var nama_sub = b.nama_sub_giat.split(' ');
					nama_sub.shift();
					nama_sub = nama_sub.join(' ');
					var existing = "";
					if(rka_sipd[nama_sub]){
						existing = " <b>Existing</b>";
					}
					body += ''
						+'<tr>'								
							+'<td class="text-center"><input type="checkbox" value="'+keyword+'">'+existing+'</td>'
							+'<td>'+b.kode_sub_skpd+' - '+b.nama_sub_skpd+'</td>'
							+'<td>'+b.nama_program+'</td>'
							+'<td>'+b.nama_giat+'</td>'
							+'<td>'+b.nama_sub_giat+'</td>'
							+'<td>'+formatMoney(b.pagu)+'</td>'								
						+'</tr>';
				});
				jQuery('#table-extension-renja-lokal tbody').html(body);
				run_script('show_modal', {
					id: 'modal-extension-renja-lokal'
				});
				hide_loading();
				global_resolve_get_renja_lokal();
			});
		});
	}else{
		proses_modal_renja(res.data)
		.then(function(){
			global_resolve_get_renja_lokal();
		});
	}
}

function proses_modal_renja(data_selected_asli = false) {
	return new Promise(function(resolve, reject){
		if(!data_selected_asli){
			var data_selected = [];
			jQuery('#table-extension-renja-lokal tbody tr input[type="checkbox"]').map(function(i, b){
				var cek = jQuery(b).is(':checked');
				if(cek){
					var id = jQuery(b).val();
					data_selected.push(rka_all[id]);
				}
			});
		}else{
			var data_selected = data_selected_asli;
		}
		if(data_selected.length >= 1){
			console.log('data_selected', data_selected);
			if(
				data_selected_asli
				|| confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')
			){
				show_loading();
	            get_detil_skpd({
	            	idskpd: idunitskpd,
	            	tahun: _token.tahun,
	            	iddaerah: _token.daerah_id
	            })
	        	.then(function(data_skpd){
					// data bidang urusan dipakai untuk sub kegiatan penunjang urusan
					find_bidang_urusan({
		    			id_sub_skpd: data_skpd.data[0].id_skpd,
		    			nama_sub_skpd: data_skpd.data[0].nama_skpd,
						search: ''
					})
		        	.then(function(data_bidur){
		        		find_sub_giat({
		        			id_sub_skpd: data_skpd.data[0].id_skpd,
		        			nama_sub_skpd: data_skpd.data[0].nama_skpd,
							search: ''
		        		})
		        		.then(function(master_sub_keg_sipd){
							var master_sub_keg = {};
							master_sub_keg_sipd.map(function(b, i){
								master_sub_keg[removeNewlines(b.nama_sub_giat)] = b;
							});
							list_belanja_by_tahun_daerah_unit(idunitskpd)
							.then(function(sub_keg_exist){
								var rka_sipd = {};
								sub_keg_exist.data.map(function(b, i){
									rka_sipd[removeNewlines(b.nama_sub_giat)] = b;
								});

								var last = data_selected.length-1;
								data_selected.reduce(function(sequence, nextData){
									return sequence.then(function(current_data){
										return new Promise(function(resolve_reduce, reject_reduce){
											var nama_sub = current_data.nama_sub_giat.split(' ');
											nama_sub.shift();
											nama_sub = removeNewlines(nama_sub.join(' '));
											var existing = false;
											if(rka_sipd[nama_sub]){
												existing = rka_sipd[nama_sub];
											}
											if(!master_sub_keg[nama_sub]){
												pesan_loading('Sub kegiatan tidak ditemukan di master SIPD. "'+nama_sub+'"');
												return resolve_reduce(nextData);
											}

											var options_sub = {
												id_unit: data_skpd.data[0].id_unit,
												id_skpd: data_skpd.data[0].id_unit,
												id_sub_skpd: data_skpd.data[0].id_skpd,
												id_urusan: master_sub_keg[nama_sub].id_urusan,
												id_bidang_urusan: master_sub_keg[nama_sub].id_bidang_urusan,
												id_program: master_sub_keg[nama_sub].id_program,
												id_giat: master_sub_keg[nama_sub].id_giat,
												id_sub_giat: master_sub_keg[nama_sub].id_sub_giat,
												pagu: current_data.pagu,
												pagu_n_depan: current_data.pagu_n_depan,
												nama_sub_giat: current_data.nama_sub_giat,
												id_lokasi: _token.daerah_id,
												waktu_awal: current_data.waktu_awal,
												waktu_akhir: current_data.waktu_akhir,
												nama_daerah: _token.daerah_nama,
												nama_unit: _token.skpd,
												nama_skpd: _token.skpd,
												nama_sub_skpd: data_skpd.data[0].nama_skpd,
												nama_bidang_urusan: '',
												kode_sub_giat: master_sub_keg[nama_sub].kode_sub_giat,
												id_daerah_log: _token.daerah_id,
												id_user_log: _token.user_id,
												id_daerah: _token.daerah_id,
												tahun: _token.tahun,
												created_user: _token.user_id
											};
											if(!_token.skpd){
												options_sub.nama_unit = data_skpd.data[0].nama_skpd;
												options_sub.nama_skpd = data_skpd.data[0].nama_skpd;
											}
											if(master_sub_keg[nama_sub].kode_sub_giat.indexOf('X.XX.') != -1){
												var cek_bidang_urusan = false;
												data_bidur.data.map(function(bb, ii){
													if(current_data.nama_bidang_urusan.indexOf(bb.nama_bidang_urusan) != -1){
														cek_bidang_urusan = bb;
														options_sub.id_bidang_urusan = bb.id_bidang_urusan;
														options_sub.id_urusan = bb.id_urusan;
														options_sub.nama_bidang_urusan = bb.nama_bidang_urusan;
													}
												});
												if(!cek_bidang_urusan){
													pesan_loading('ID bidang urusan tidak ditemukan', current_data);
													options_sub.id_bidang_urusan = data_bidur.data[0].id_bidang_urusan;
													options_sub.id_urusan = data_bidur.data[0].id_urusan;
													options_sub.nama_bidang_urusan = data_bidur.data[0].nama_bidang_urusan;
												}
											}
											if(data_skpd.data[0].is_skpd == 1){
												options_sub.nama_sub_skpd = data_skpd.data[0].nama_skpd;
											}

											var options_label = {
												tahun: options_sub.tahun,
												id_daerah: options_sub.id_daerah,
												id_daerah_log: options_sub.id_daerah_log,
												id_user_log: options_sub.id_user_log
											};
											var options_lokasi = {
												tahun: options_sub.tahun,
												id_daerah: options_sub.id_daerah,
												id_kab_kota: options_sub.id_daerah,
												id_daerah_log: options_sub.id_daerah_log,
												id_user_log: options_sub.id_user_log
											};
											var targetoutput = 0
											if(current_data.indikator.length >= 1){
												targetoutput = current_data.indikator[0].targetoutput;
											}
											var options_output = {
												id_daerah_log: options_sub.id_daerah_log,
												id_user_log: options_sub.id_user_log,
												tahun: options_sub.tahun,
												id_daerah: options_sub.id_daerah,
												id_unit: options_sub.id_unit,
												tolak_ukur: master_sub_keg[nama_sub].indikator,
												target: targetoutput,
												satuan: master_sub_keg[nama_sub].satuan,
												id_skpd: options_sub.id_skpd,
												id_sub_skpd: options_sub.id_sub_skpd,
												id_program: options_sub.id_program,
												id_giat: options_sub.id_giat,
												id_sub_giat: options_sub.id_sub_giat,
												nama_daerah: options_sub.nama_daerah,
												nama_unit: options_sub.nama_unit,
												nama_skpd: options_sub.nama_skpd,
												nama_sub_skpd: options_sub.nama_sub_skpd,
											};
											// simpan sub keg baru
											if(!existing){
												simpan_sub_bl(options_sub)
												.then(function(id_sub_bl){
													options_label.id_sub_bl = id_sub_bl;
													simpan_label_bl(options_label)
													.then(function(){
														options_lokasi.id_sub_bl = id_sub_bl;
														simpan_detil_lokasi_bl(options_lokasi)
														.then(function(){
															options_output.id_sub_bl = id_sub_bl;
															simpan_output_bl(options_output)
															.then(function(){
																var options_dana = {
																	id_sub_bl: id_sub_bl,
																	id_daerah_log: options_sub.id_daerah_log,
																	id_user_log: options_sub.id_user_log,
																	tahun: options_sub.tahun,
																	id_daerah: options_sub.id_daerah
																};
																simpan_dana_sub_bl(options_dana, current_data)
																.then(function(){
																	return resolve_reduce(nextData);
																});
															});
														});
													});
												});
											// update data
											}else{
												options_sub.id_sub_bl = existing.id_sub_bl;
												update_sub_bl(options_sub)
												.then(function(){
													options_label.id_sub_bl = existing.id_sub_bl;
													update_label_bl(options_label)
													.then(function(){
														options_lokasi.id_sub_bl = existing.id_sub_bl;
														update_detil_lokasi_bl(options_lokasi)
														.then(function(){
															options_output.id_sub_bl = existing.id_sub_bl;
															update_output_bl(options_output)
															.then(function(){
																var options_dana = {
																	id_sub_bl: existing.id_sub_bl,
																	id_daerah_log: options_sub.id_daerah_log,
																	id_user_log: options_sub.id_user_log,
																	tahun: options_sub.tahun,
																	id_daerah: options_sub.id_daerah,
																};
																update_dana_sub_bl(options_dana, current_data)
																.then(function(){
																	return resolve_reduce(nextData);
																});
															});
														});
													});
												});
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
								.then(function(data_last){
									if(!data_selected_asli){
										hide_loading();
										run_script('hide_modal', {
											id: 'modal-extension-renja-lokal'
										});
										alert('Data berhasil diproses! Refresh halaman ini untuk melihat hasilnya.');
									}
									return resolve();
								})
								.catch(function(e){
									console.log(e);
								});	
							});
		        		})
					});
		        });
			}
		}else{
			if(!data_selected_asli){
				alert('Pilih data dulu!');
			}
			return resolve();
		}
	});
}

// simpan 1
function simpan_sub_bl(opsi) {
	pesan_loading("Simpan Sub Kegiatan '"+opsi.nama_sub_giat+"' OPD "+opsi.nama_sub_skpd);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/add',
			type: 'POST',
			data: {
				id_unit: opsi.id_unit,
				id_skpd: opsi.id_skpd,
				id_sub_skpd: opsi.id_sub_skpd,
				id_pptk: 0,
				id_urusan_pusat: 0,
				id_bidang_urusan_pusat: 0,
				id_urusan: opsi.id_urusan,
				id_bidang_urusan: opsi.id_bidang_urusan,
				id_program: opsi.id_program,
				id_giat: opsi.id_giat,
				id_bl: 0,
				id_sub_giat: opsi.id_sub_giat,
				no_sub_giat: '',
				pagu: opsi.pagu,
				pagu_n_depan: opsi.pagu_n_depan,
				id_dana: 0,
				id_lokasi: opsi.id_lokasi,
				waktu_awal: opsi.waktu_awal,
				waktu_akhir: opsi.waktu_akhir,
				pagu_indikatif: 0,
				output_teks: '',
				pagu_n2_lalu: 0,
				pagu_n_lalu: 0,
				pagu_n_depan: 0,
				pagu_n2_depan: 0,
				rkpd_murni: 0,
				rkpd_pak: 0,
				nama_daerah: opsi.nama_daerah,
				nama_unit: opsi.nama_unit,
				nama_skpd: opsi.nama_skpd,
				nama_sub_skpd: opsi.nama_sub_skpd,
				nama_urusan: '',
				nama_bidang_urusan: opsi.nama_bidang_urusan,
				nama_program: '',
				nama_giat: '',
				nama_sub_giat: '',
				nama_dana: '',
				nama_lokasi: '',
				nama_jadwal_murni: '',
				kua_murni: 0,
				kua_pak: 0,
				kode_daerah: '',
				kode_unit: '',
				kode_skpd: '',
				kode_sub_skpd: '',
				kode_urusan_pusat: '',
				kode_urusan: '',
				kode_bidang_urusan_pusat: '',
				kode_bidang_urusan: '',
				kode_program: '',
				kode_giat: '',
				kode_sub_giat: opsi.kode_sub_giat,
				kode_dana: '',
				id_daerah_log: opsi.id_daerah_log,
				id_user_log: opsi.id_user_log,
				id_daerah: opsi.id_daerah,
				tahun: opsi.tahun,
				created_user: opsi.created_user
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res.id_sub_bl);
			}
		});
	});
}

// simpan 2
function simpan_label_bl(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Simpan label sub keg! id_sub_bl='+opsi.id_sub_bl);
		relayAjax({
			url: config.sipd_url+'api/renja/label_bl/add',
			type: 'POST',
			data: {
				id_bl: 0,
				tahun: opsi.tahun,
				id_daerah: opsi.id_daerah,
				id_unit: 0,
				id_label_pusat: 0,
				id_label_prov: 0,
				id_label_kokab: 0,
				id_sub_bl: opsi.id_sub_bl,
				id_skpd: 0,
				id_sub_skpd: 0,
				id_program: 0,
				id_giat: 0,
				id_sub_giat: 0,
				nama_daerah: '',
				nama_unit: '',
				nama_label_pusat: '',
				nama_label_prov: '',
				nama_label_kokab: '',
				nama_skpd: '',
				nama_sub_skpd: '',
				nama_program: '',
				nama_giat: '',
				nama_sub_giat: '',
				id_daerah_log: opsi.id_daerah_log,
				id_user_log: opsi.id_user_log
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res);
			}
		});
	});
}

// simpan 3
function simpan_detil_lokasi_bl(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Simpan lokasi sub keg! id_sub_bl='+opsi.id_sub_bl);
		relayAjax({
			url: config.sipd_url+'api/renja/detil_lokasi_bl/add',
			type: 'POST',
			data: {
				tahun: opsi.tahun,
				id_daerah: opsi.id_daerah,
				id_unit: 0,
				id_bl: 0,
				id_sub_bl: opsi.id_sub_bl,
				id_kab_kota: opsi.id_kab_kota,
				id_camat: 0,
				id_lurah: 0,
				id_skpd: 0,
				id_sub_skpd: 0,
				id_program: 0,
				id_giat: 0,
				id_sub_giat: 0,
				nama_daerah: '',
				nama_unit: '',
				nama_kab_kota: '',
				nama_camat: '',
				nama_lurah: '',
				id_daerah_log: opsi.id_daerah_log,
				id_user_log: opsi.id_user_log
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res);
			}
		});
	});
}

// simpan 4
function simpan_output_bl(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Simpan indikator sub keg! indikator='+opsi.tolak_ukur);
		relayAjax({
			url: config.sipd_url+'api/renja/output_bl/add',
			type: 'POST',
			data: {
				id_daerah_log: opsi.id_daerah_log,
				id_user_log: opsi.id_user_log,
				id_bl: 0,
				tahun: opsi.tahun,
				id_daerah: opsi.id_daerah,
				id_unit: opsi.id_unit,
				tolak_ukur: opsi.tolak_ukur,
				target: opsi.target,
				satuan: opsi.satuan,
				target_teks: '',
				tolok_ukur_sub: '',
				target_sub: 0,
				satuan_sub: '',
				target_sub_teks: '',
				id_sub_bl: opsi.id_sub_bl,
				id_skpd: opsi.id_skpd,
				id_sub_skpd: opsi.id_sub_skpd,
				id_program: opsi.id_program,
				id_giat: opsi.id_giat,
				id_sub_giat: opsi.id_sub_giat,
				nama_daerah: opsi.nama_daerah,
				nama_unit: opsi.nama_unit,
				nama_skpd: opsi.nama_skpd,
				nama_sub_skpd: opsi.nama_sub_skpd,
				nama_program: '',
				nama_giat: '',
				nama_sub_giat: '',
				kode_daerah: '',
				kode_unit: '',
				kode_skpd: '',
				kode_sub_skpd: '',
				kode_program: '',
				kode_giat: '',
				kode_sub_giat: ''
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res);
			}
		});
	});
}

// simpan 5
function simpan_dana_sub_bl(opsi, current_data) {
	return new Promise(function(resolve, reject){
		var promise_all = current_data.sumber_dana.map(function(b, i){
			return new Promise(function(resolve2, reject2){
				if(b.kodedana == null){
					return resolve2();
				}
				if(!global_all_sumber_dana_obj[b.kodedana]){
					pesan_loading('Sumber dana tidak ditemukan di SIPD! kode='+b.kodedana);
					return resolve2();
				}
				pesan_loading('Simpan Sumber dana! kode='+b.kodedana);
				opsi.id_dana = global_all_sumber_dana_obj[b.kodedana].id_dana;
				opsi.nama_dana = global_all_sumber_dana_obj[b.kodedana].nama_dana;
				opsi.kode_dana = global_all_sumber_dana_obj[b.kodedana].kode_dana;
				opsi.pagu_dana = b.pagudana;
				relayAjax({
					url: config.sipd_url+'api/renja/dana_sub_bl/add',
					type: 'POST',
					data: {
						tahun: opsi.tahun,
						id_daerah: opsi.id_daerah,
						id_unit: 0,
						id_bl: 0,
						id_sub_bl: opsi.id_sub_bl,
						id_dana: opsi.id_dana,
						nama_dana: opsi.nama_dana,
						kode_dana: opsi.kode_dana,
						id_skpd: 0,
						id_sub_skpd: 0,
						id_program: 0,
						id_giat: 0,
						id_sub_giat: 0,
						pagu_dana: opsi.pagu_dana,
						id_daerah_log: opsi.id_daerah_log,
						id_user_log: opsi.id_user_log
					},
					beforeSend: function (xhr) {			    
						xhr.setRequestHeader("X-API-KEY", x_api_key());
						xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
					},
					success: function(res){
						return resolve2(res);
					}
				});
			})
		});
		Promise.all(promise_all)
		.then(function(){
			resolve();
		});
	});
}

// update 1
function update_sub_bl(opsi) {
	pesan_loading("Update Sub Kegiatan '"+opsi.nama_sub_giat+"' OPD "+opsi.nama_sub_skpd);
	return new Promise(function(resolve, reject){
		sub_bl_view(opsi.id_sub_bl)
		.then(function(data_exist){
			var promise_all = data_exist.data.map(function(data, i){
				return new Promise(function(resolve2, reject2){
					opsi.id_bidang_urusan_pusat = data.id_bidang_urusan_pusat;
					opsi.id_unik = data.id_unik;
					opsi.updated_user = _token.user_id;
					relayAjax({
						url: config.sipd_url+'api/renja/sub_bl/update',
						type: 'POST',
						data: {
							id_unit: opsi.id_unit,
							id_skpd: opsi.id_skpd,
							id_sub_skpd: opsi.id_sub_skpd,
							id_pptk: 0,
							id_urusan_pusat: 0,
							id_bidang_urusan_pusat: opsi.id_bidang_urusan_pusat,
							id_urusan: opsi.id_urusan,
							id_bidang_urusan: opsi.id_bidang_urusan,
							id_program: opsi.id_program,
							id_giat: opsi.id_giat,
							id_bl: 0,
							id_sub_giat: opsi.id_sub_giat,
							no_sub_giat: '',
							pagu: opsi.pagu,
							pagu_n_depan: opsi.pagu_n_depan,
							id_dana: 0,
							id_lokasi: opsi.id_lokasi,
							waktu_awal: opsi.waktu_awal,
							waktu_akhir: opsi.waktu_akhir,
							pagu_indikatif: 0,
							output_teks: '',
							pagu_n2_lalu: 0,
							pagu_n_lalu: 0,
							pagu_n_depan: 0,
							pagu_n2_depan: 0,
							rkpd_murni: 0,
							rkpd_pak: 0,
							nama_daerah: opsi.nama_daerah,
							nama_unit: opsi.nama_unit,
							nama_skpd: opsi.nama_skpd,
							nama_sub_skpd: opsi.nama_sub_skpd,
							nama_urusan: '',
							nama_bidang_urusan: opsi.nama_bidang_urusan,
							nama_program: '',
							nama_giat: '',
							nama_sub_giat: '',
							nama_dana: '',
							nama_lokasi: '',
							nama_jadwal_murni: '',
							kua_murni: 0,
							kua_pak: 0,
							kode_daerah: '',
							kode_unit: '',
							kode_skpd: '',
							kode_sub_skpd: '',
							kode_urusan_pusat: '',
							kode_urusan: '',
							kode_bidang_urusan_pusat: '',
							kode_bidang_urusan: '',
							kode_program: '',
							kode_giat: '',
							kode_sub_giat: opsi.kode_sub_giat,
							kode_dana: '',
							id_daerah_log: opsi.id_daerah_log,
							id_user_log: opsi.id_user_log,
							id_sub_bl: opsi.id_sub_bl,
							id_unik: opsi.id_unik,
							id_daerah: opsi.id_daerah,
							tahun: opsi.tahun,
							updated_user: opsi.updated_user
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", x_api_key());
							xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
						},
						success: function(res){
							return resolve2(res);
						}
					});
				});
			});
			Promise.all(promise_all)
			.then(function(){
				return resolve();
			});
		});
	});
}

// update 2
function update_label_bl(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Update label sub kegiatan! id_sub_bl='+opsi.id_sub_bl);
		label_bl(opsi.id_sub_bl)
		.then(function(data_exist){
			var promise_all = data_exist.data.map(function(data, i){
				return new Promise(function(resolve2, reject2){
					relayAjax({
						url: config.sipd_url+'api/renja/label_bl/update',
						type: 'POST',
						data: {
							id_label_bl: data.id_label_bl,
							id_bl: 0,
							tahun: opsi.tahun,
							id_daerah: opsi.id_daerah,
							id_unit: 0,
							id_label_pusat: 0,
							id_label_prov: 0,
							id_label_kokab: 0,
							id_sub_bl: opsi.id_sub_bl,
							id_skpd: 0,
							id_sub_skpd: 0,
							id_program: 0,
							id_giat: 0,
							id_sub_giat: 0,
							nama_daerah: '',
							nama_unit: '',
							nama_label_pusat: '',
							nama_label_prov: '',
							nama_label_kokab: '',
							nama_skpd: '',
							nama_sub_skpd: '',
							nama_program: '',
							nama_giat: '',
							nama_sub_giat: '',
							id_daerah_log: opsi.id_daerah_log,
							id_user_log: opsi.id_user_log
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", x_api_key());
							xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
						},
						success: function(res){
							return resolve2(res);
						}
					});
				});
			});
			Promise.all(promise_all)
			.then(function(){
				return resolve();
			});
		});
	});
}

// update 3
function update_detil_lokasi_bl(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Update lokasi sub kegiatan! id_sub_bl='+opsi.id_sub_bl);
		detil_lokasi_bl(opsi.id_sub_bl)
		.then(function(data_exist){
			var promise_all = data_exist.data.map(function(data, i){
				return new Promise(function(resolve2, reject2){
					relayAjax({
						url: config.sipd_url+'api/renja/detil_lokasi_bl/update',
						type: 'POST',
						data: {
							id_detil_lokasi: data.id_detil_lokasi,
							tahun: opsi.tahun,
							id_daerah: opsi.id_daerah,
							id_unit: 0,
							id_bl: 0,
							id_sub_bl: opsi.id_sub_bl,
							id_kab_kota: opsi.id_kab_kota,
							id_camat: 0,
							id_lurah: 0,
							id_skpd: 0,
							id_sub_skpd: 0,
							id_program: 0,
							id_giat: 0,
							id_sub_giat: 0,
							nama_daerah: '',
							nama_unit: '',
							nama_kab_kota: '',
							nama_camat: '',
							nama_lurah: '',
							id_daerah_log: opsi.id_daerah_log,
							id_user_log: opsi.id_user_log
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", x_api_key());
							xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
						},
						success: function(res){
							return resolve2(res);
						}
					});
				});
			});

			Promise.all(promise_all)
			.then(function(){
				return resolve();
			});
		});
	});
}

// update 4
function update_output_bl(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Update indikator sub kegiatan! id_sub_bl='+opsi.id_sub_bl);
		output_bl(opsi.id_sub_bl)
		.then(function(data_exist){
			var promise_all = data_exist.data.map(function(data, i){
				return new Promise(function(resolve2, reject2){
					relayAjax({
						url: config.sipd_url+'api/renja/output_bl/update',
						type: 'POST',
						data: {
							id_output_bl: data.id_output_bl,
							id_daerah_log: opsi.id_daerah_log,
							id_user_log: opsi.id_user_log,
							id_bl: 0,
							tahun: opsi.tahun,
							id_daerah: opsi.id_daerah,
							id_unit: opsi.id_unit,
							tolak_ukur: opsi.tolak_ukur,
							target: opsi.target,
							satuan: opsi.satuan,
							target_teks: '',
							tolok_ukur_sub: '',
							target_sub: 0,
							satuan_sub: '',
							target_sub_teks: '',
							id_sub_bl: opsi.id_sub_bl,
							id_skpd: opsi.id_skpd,
							id_sub_skpd: opsi.id_sub_skpd,
							id_program: opsi.id_program,
							id_giat: opsi.id_giat,
							id_sub_giat: opsi.id_sub_giat,
							nama_daerah: opsi.nama_daerah,
							nama_unit: opsi.nama_unit,
							nama_skpd: opsi.nama_skpd,
							nama_sub_skpd: opsi.nama_sub_skpd,
							nama_program: '',
							nama_giat: '',
							nama_sub_giat: '',
							kode_daerah: '',
							kode_unit: '',
							kode_skpd: '',
							kode_sub_skpd: '',
							kode_program: '',
							kode_giat: '',
							kode_sub_giat: ''
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", x_api_key());
							xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
						},
						success: function(res){
							return resolve2(res);
						}
					});
				});
			});

			Promise.all(promise_all)
			.then(function(){
				return resolve();
			});
		});
	});
}

// update 5
function update_tag_bl(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Update tag sub kegiatan! id_sub_bl='+opsi.id_sub_bl);
		tag_bl(opsi.id_sub_bl)
		.then(function(data_exist){
			var promise_all = data_exist.data.map(function(data, i){
				return new Promise(function(resolve2, reject2){
					return resolve2(); // masih pengembangan
					relayAjax({
						url: config.sipd_url+'api/renja/tag_bl/update',
						type: 'POST',
						data: {
							// belum dicoba
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", x_api_key());
							xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
						},
						success: function(res){
							return resolve2(res);
						}
					});
				});
			});

			Promise.all(promise_all)
			.then(function(){
				return resolve();
			});
		});
	});
}

// update 5
function update_dana_sub_bl(opsi, current_data) {
	return new Promise(function(resolve, reject){
		pesan_loading('Update sumber dana sub kegiatan! id_sub_bl='+opsi.id_sub_bl);
		dana_sub_bl(opsi.id_sub_bl)
		.then(function(data_exist){
			var options_dana = {};
			current_data.sumber_dana.map(function(b, i){
				if(b.kodedana == null){
					return;
				}
				if(!global_all_sumber_dana_obj[b.kodedana]){
					pesan_loading('Sumber dana tidak ditemukan di SIPD! kode='+b.kodedana);
					return;
				}
				options_dana[i] = opsi;
				options_dana[i].id_dana = global_all_sumber_dana_obj[b.kodedana].id_dana;
				options_dana[i].nama_dana = global_all_sumber_dana_obj[b.kodedana].nama_dana,
				options_dana[i].kode_dana = global_all_sumber_dana_obj[b.kodedana].kode_dana,
				options_dana[i].pagu_dana = b.pagudana;
			});
			var promise_all = data_exist.data.map(function(data, i){
				return new Promise(function(resolve2, reject2){
					if(!options_dana[i]){
						pesan_loading('Sumber dana tidak ditemukan di WP-SIPD! kode='+data.kode_dana);
						return resolve2();
					}
					relayAjax({
						url: config.sipd_url+'api/renja/dana_sub_bl/update',
						type: 'POST',
						data: {
							id_dana_sub_bl: data.id_dana_sub_bl,
							tahun: options_dana[i].tahun,
							id_daerah: options_dana[i].id_daerah,
							id_unit: 0,
							id_bl: 0,
							id_sub_bl: options_dana[i].id_sub_bl,
							id_dana: options_dana[i].id_dana,
							nama_dana: options_dana[i].nama_dana,
							kode_dana: options_dana[i].kode_dana,
							id_skpd: 0,
							id_sub_skpd: 0,
							id_program: 0,
							id_giat: 0,
							id_sub_giat: 0,
							pagu_dana: options_dana[i].pagu_dana,
							id_daerah_log: options_dana[i].id_daerah_log,
							id_user_log: options_dana[i].id_user_log
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", x_api_key());
							xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
						},
						success: function(res){
							return resolve2(res);
						}
					});
				});
			});

			Promise.all(promise_all)
			.then(function(){
				return resolve();
			});
		});
	});
}

function find_sub_giat(opsi){
	pesan_loading("Get master sub kegiatan SIPD id unit "+opsi.id_sub_skpd+" "+opsi.nama_sub_skpd);
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/master/sub_giat/find_sub_giat_by_tahun_daerah_unit',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
				id_unit: opsi.id_sub_skpd,
				search: opsi.nama_sub_giat
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res.data);
			}
		});
	});
}

function find_bidang_urusan(opsi){
    return new Promise(function(resolve, reject){
		if(typeof get_bidang_urusan_global == 'undefined'){
			window.get_bidang_urusan_global = {};
		}
		var key = opsi.id_sub_skpd+'-'+_token.tahun;
		if(!get_bidang_urusan_global[key]){
			pesan_loading("Get master bidang urusan SIPD id unit "+opsi.id_sub_skpd+" "+opsi.nama_sub_skpd);
			relayAjax({	      	
				url: config.sipd_url+'api/master/bidang_urusan/find_by_id_skpd',
				type: 'POST',
				data: {
					id_skpd: opsi.id_sub_skpd,
					tahun: _token.tahun,
					id_daerah: _token.daerah_id,
					// search[value]: opsi.nama_bidang_urusan
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
		      	success: function(data){
		      		get_bidang_urusan_global[key] = data;
		      		return resolve(data);
		      	}
		    });
		}else{
      		return resolve(get_bidang_urusan_global[key]);
		}
    });
}

function singkron_skpd_modal(){
	var data_selected = [];
	jQuery('#table-extension tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_selected.push(rka_all[id]);
		}
	});
	if(data_selected.length >= 1){
		console.log('data_selected', data_selected);
		if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
			singkron_all_unit(data_selected);
		}		
	}else{
		alert('Pilih data dulu!');
	}
}

function open_modal_subgiat(idunit){	
	var body = '';
	// id_unit = opsi_unit.id_skpd ? opsi_unit.id_skpd : _token.unit;
	id_unit = idunit ? idunit : _token.unit;
	show_loading();
	list_belanja_by_tahun_daerah_unit(id_unit)
	.then(function(subkeg){
		console.log('list bl', subkeg.data);
		window.sub_keg_skpd = subkeg.data;
		subkeg.data.map(function(b, i){
			if(
				b.sub_giat_locked == 0
				&& b.kode_sub_skpd
			){
				var keyword = b.kode_sbl;	
				// kode_sbl_all[keyword] = b;						
				body += ''
					+'<tr>'								
						+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
						+'<td>'+b.nama_sub_giat+'</td>'
						+'<td>-</td>'								
					+'</tr>';
			}
		});
		jQuery('#table-extension tbody').html(body);
		run_script('show_modal_sm');
		hide_loading();
	});
}

function singkron_subgiat_modal(){
	var data_sub_keg_selected = [];
	jQuery('#table-extension tbody tr input[type="checkbox"]').map(function(i, b){	
		if(jQuery(b).is(':checked') == true){
			var kode_sbl =  jQuery(b).val();
			sub_keg_skpd.map(function(bb, ii){
				if(bb.kode_sbl == kode_sbl){
					data_sub_keg_selected.push(bb);
				}
			});
		}			
	});
	if(data_sub_keg_selected.length == 0){
		alert('Pilih sub kegiatan dulu!');
	}else if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		console.log('data_sub_keg_selected', data_sub_keg_selected);
		var id_unit = _token.unit;
		var cat_wp = '';
		var last = data_sub_keg_selected.length-1;
		data_sub_keg_selected.reduce(function(sequence, nextData){
			return sequence.then(function(current_data){
				console.log('current_data data_sub_keg_selected', current_data);
				return new Promise(function(resolve_reduce, reject_reduce){
					if(
						current_data.sub_giat_locked == 0 
						&& current_data.kode_sub_skpd
					){
						cat_wp = current_data.kode_sub_skpd+' '+current_data.nama_sub_skpd;
						var nama_skpd = current_data.nama_skpd.split(' ');
						nama_skpd.shift();
						nama_skpd = nama_skpd.join(' ');
						singkron_rka_ke_lokal({
							id_daerah: current_data.id_daerah,
							tahun: current_data.tahun,
							id_unit: current_data.id_unit,
							id_skpd: current_data.id_skpd,
							id_sub_skpd: current_data.id_sub_skpd,
							id_giat: current_data.id_giat,
							id_program: current_data.id_program,
							id_sub_giat: current_data.id_sub_giat,
							id_urusan: current_data.id_urusan,
							id_bidang_urusan: current_data.id_bidang_urusan,
							action: current_data.action,
							kode_bl: current_data.kode_bl,
							kode_sbl: current_data.kode_sbl,
							idbl: current_data.id_bl,
							idsubbl: current_data.id_sub_bl,
							kode_skpd: current_data.kode_skpd,
							nama_skpd: nama_skpd,
							kode_sub_skpd: current_data.kode_sub_skpd,
							nama_sub_skpd: current_data.nama_sub_skpd,
							pagumurni: current_data.pagumurni,
							pagu: current_data.pagu,
							no_return: true
						}, function(){
							console.log('next reduce', nextData);
							resolve_reduce(nextData);
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
		}, Promise.resolve(data_sub_keg_selected[last]))
		.then(function(data_last){
			var opsi = { 
				action: 'get_cat_url',
				type: 'ri',
				api_key: config.api_key,
				category : cat_wp
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
		})
		.catch(function(e){
			console.log(e);
		});
	}
}

function singkron_all_unit(units) {
	jQuery('#persen-loading').attr('persen', 0);
	jQuery('#persen-loading').html('0%');
	var last = units.length-1;
	jQuery('#persen-loading').attr('total', units.length);
	units.reduce(function(sequence, nextData){
        return sequence.then(function(current_data){
    		return new Promise(function(resolve_reduce, reject_reduce){				
				var c_persen = +jQuery('#persen-loading').attr('persen');
				c_persen++;
				jQuery('#persen-loading').attr('persen', c_persen);
				jQuery('#persen-loading').html(((c_persen/units.length)*100).toFixed(2)+'%'+'<br>'+current_data.nama_skpd);
				console.log('singkron_all_unit', current_data);
    			relayAjax({
					url: config.sipd_url+'api/master/skpd/view/'+current_data.id_skpd+'/'+current_data.tahun+'/'+current_data.id_daerah,			
                    type: 'GET',	      				
                    processData: false,
                    contentType : 'application/json',
                    beforeSend: function (xhr) {			    
                        xhr.setRequestHeader("X-API-KEY", x_api_key());
                        xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
                    },
					success: function(html){
                        console.log('html singkron_all_unit', html);
						// var kode_get = html.split('lru8="')[1].split('"')[0];
						// current_data.kode_get = kode_get;
            			singkron_rka_ke_lokal_all(current_data, function(){
            				console.log('next reduce singkron_all_unit', nextData);
							resolve_reduce(nextData);
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
    }, Promise.resolve(units[last]))
    .then(function(data_last){
    	var opsi = { 
			action: 'get_cat_url',
			type: 'ri',
			api_key: config.api_key,
			category : 'Semua Perangkat Daerah Tahun Anggaran '+_token.tahun
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
    })
    .catch(function(e){
        console.log(e);
    });
}

function singkron_rka_ke_lokal_all(opsi_unit, callback) {
	if((opsi_unit && opsi_unit.id_skpd) || confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		console.log('singkron_rka_ke_lokal_all opsi_unit', opsi_unit);
		id_unit = opsi_unit.id_skpd;
		if(opsi_unit && opsi_unit.id_skpd){
			// script singkron pagu SKPD
			get_skpd(_token.tahun, _token.daerah_id, id_unit).then(function(skpd){
				get_pagu_validasi(_token.tahun, _token.daerah_id, id_unit).then(function(paguvalidasi){
					var opsi = { 
						action: 'set_unit_pagu',
						type: 'ri',
						api_key: config.api_key,
						tahun_anggaran: _token.tahun,
						data : {
							batasanpagu : paguvalidasi.data,
							id_daerah : _token.daerah_id,
							id_level : opsi_unit.id_level,
							id_skpd : opsi_unit.id_skpd,
							id_unit : opsi_unit.id_unit,
							id_user : opsi_unit.id_user,
							is_anggaran : opsi_unit.is_anggaran,
							is_deleted : opsi_unit.is_deleted,
							is_komponen : opsi_unit.is_komponen,
							is_locked : skpd.data[0].is_locked,
							is_skpd : skpd.data[0].is_skpd,
							kode_skpd : opsi_unit.kode_skpd,
							kunci_bl : opsi_unit.kunci_bl,
							kunci_bl_rinci : opsi_unit.kunci_bl_rinci,
							kuncibl : opsi_unit.kuncibl,
							kunciblrinci : opsi_unit.kunciblrinci,
							nilaipagu : opsi_unit.nilaipagu,
							nilaipagumurni : opsi_unit.nilaipagumurni,
							// nilairincian : opsi_unit.nilairincian,
							nilairincian : opsi_unit.rinci_giat,
							pagu_giat : opsi_unit.pagu_giat,
							realisasi : opsi_unit.realisasi,
							rinci_giat : opsi_unit.rinci_giat,
							set_pagu_giat : opsi_unit.set_pagu_giat,
							set_pagu_skpd : opsi_unit.set_pagu_skpd,
							tahun : opsi_unit.tahun,
							total_giat : opsi_unit.total_giat,					
							totalgiat : opsi_unit.totalgiat
						}
					};
					var data = {
						message:{
							type: "get-url",
							content: {
								url: config.url_server_lokal,
								type: 'post',
								data: opsi,
								return: false
							}
						}
					};
					chrome.runtime.sendMessage(data, function(response) {
						console.log('responeMessage', response);
					});
					if(jQuery('#only_pagu').is(':checked')){
						return callback();
					}
				})
			})
		}
		if(jQuery('#only_pagu').is(':checked')){
			return console.log('Hanya singkron pagu SKPD!');
		}

		if(typeof promise_nonactive == 'undefined'){
			window.promise_nonactive = {};
		}

		// get data belanja
		list_belanja_by_tahun_daerah_unit(id_unit)
		.then(function(subkeg){
			console.log('list_belanja_by_tahun_daerah_unit', subkeg.data);
			// ubah status sub_keg_bl jadi tidak aktif semua agar jika ada sub keg yang dihapus, sipd lokal bisa ikut terupdate
			new Promise(function(resolve_reduce_nonactive, reject_reduce_nonactive){
				promise_nonactive[id_unit] = resolve_reduce_nonactive;
				var subkeg_aktif = [];
				subkeg.data.map(function(b, i){
					console.log('map',b);
					if(
						b.sub_giat_locked == 0
						&& b.kode_sub_skpd
					){
						subkeg_aktif.push({kode_sbl: b.kode_sbl});
					}
				});
				var data = {
				    message:{
				        type: "get-url",
				        content: {
						    url: config.url_server_lokal,
						    type: 'post',
						    data: {
						    	action: 'update_nonactive_sub_bl',
								type: 'ri',
								api_key: config.api_key,
								tahun_anggaran: _token.tahun,
								id_unit: id_unit,
								subkeg_aktif: subkeg_aktif
						    },
			    			return: true
						}
				    }
				};
				chrome.runtime.sendMessage(data, function(response) {
				    console.log('responeMessage', response);
				})
			}).then(function(){
				if(opsi_unit && opsi_unit.id_skpd){
					var cat_wp = '';
					var last = subkeg.data.length-1;
					console.log('subkeg', subkeg.data);
					subkeg.data.reduce(function(sequence, nextData){
						return sequence.then(function(current_data){
							return new Promise(function(resolve_reduce, reject_reduce){
								console.log('current_data subkeg', current_data);
								if(
									current_data.sub_giat_locked == 0 
									&& current_data.kode_sub_skpd
								){
									cat_wp = current_data.kode_sub_skpd+' '+current_data.nama_sub_skpd;
									// var nama_skpd = current_data.nama_skpd.split(' ');
                                    var nama_skpd = current_data.nama_skpd;
									// nama_skpd.shift();
									// nama_skpd = nama_skpd.join(' ');
									singkron_rka_ke_lokal({
										id_daerah: current_data.id_daerah,
										tahun: current_data.tahun,
										id_unit: current_data.id_unit,
										id_skpd: current_data.id_skpd,
										id_sub_skpd: current_data.id_sub_skpd,
										id_giat: current_data.id_giat,
										id_program: current_data.id_program,
										id_sub_giat: current_data.id_sub_giat,
										id_urusan: current_data.id_urusan,
										id_bidang_urusan: current_data.id_bidang_urusan,
										// action: current_data.action,
										kode_bl: current_data.kode_bl,
										kode_sbl: current_data.kode_sbl,
										idbl: current_data.id_bl,
										idsubbl: current_data.id_sub_bl,
										kode_skpd: current_data.kode_skpd,
										nama_skpd: current_data.nama_skpd,
										kode_sub_skpd: current_data.kode_sub_skpd,
										nama_sub_skpd: current_data.nama_sub_skpd,
										pagumurni: current_data.pagumurni,
										pagu: current_data.pagu,
										no_return: true
									}, function(){
										console.log('next reduce', nextData);
										resolve_reduce(nextData);
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
					}, Promise.resolve(subkeg.data[last]))
					.then(function(data_last){
						if(callback){
							return callback();
						}else{
							var opsi = { 
								action: 'get_cat_url',
								api_key: config.api_key,
								category : cat_wp
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
						}
					})
					.catch(function(e){
						console.log(e);
					});
				}else{
					console.log('jika tidak ada  muncul data sub giat', subkeg.data);
					open_modal_subgiat(id_unit);
					// window.sub_keg_skpd = subkeg.data;
					// var body = '';
					// subkeg.data.map(function(b, i){
					// 	if(
					// 		b.sub_giat_locked == 0
					// 		&& b.kode_sub_skpd
					// 	){
					// 		var keyword = b.kode_sbl;	
					// 		rka_all[keyword] = b;						
					// 		body += ''
					// 			+'<tr>'								
					// 				+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
					// 				+'<td>'+b.nama_sub_giat+'</td>'
					// 				+'<td>-</td>'								
					// 			+'</tr>';
					// 	}
					// });					
					// jQuery('#table-extension tbody').html(body);
					// run_script('show_modal_sm');
					// hide_loading();
				}
			});	
		});
	}
}

function singkron_rka_ke_lokal(opsi, callback) {
	if((opsi && opsi.kode_bl) || confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();		
		// var id_unit = idune;
        console.log('singkron_rka_ke_lokal', opsi);
		var id_unit = opsi.id_skpd ? opsi.id_skpd : _token.unit;
		if(opsi && opsi.id_unit){
			id_unit = opsi.id_unit;
		}
		var kode_sbl = false;
		var kode_bl = false;
		var idbl = false;
		var idsubbl = false;
		var kode_skpd = false;
		var nama_skpd = false;
		var kode_sub_skpd = false;
		var pagu = 0;
		if(!opsi || !opsi.kode_bl){
			kode_sbl = kodesbl;
			var _kode_bl = kode_sbl.split('.');
			_kode_bl.pop();
			kode_bl = _kode_bl.join('.');
			idbl = kode_bl;
			idsubbl = kode_sbl;
		}else{
			kode_bl = opsi.kode_bl;
			kode_sbl = opsi.kode_sbl;
			idbl = opsi.idbl;
			idsubbl = opsi.idsubbl;
			kode_skpd = opsi.kode_skpd;
			nama_skpd = opsi.nama_skpd;
			kode_sub_skpd = opsi.kode_sub_skpd;
			pagu = opsi.pagu;
		}
		if((idbl && idsubbl) || kode_sbl){
			tahun = opsi.tahun;
			id_daerah = opsi.id_daerah;
			console.log('data opsi singkron_rka_ke_lokal', opsi);
			var res_sub_bl_view = {};
			var data_unit = {};
			var data_sbl = {};
			var detaillokasi = {};
			var capaian_bl_res = {};
			var dana_sub_bl_res = {};
			var output_bl_res = {};
			var tag_bl_res = {};
			new Promise(function(resolve, reject){
				sub_bl_view(idsubbl).then(function(res){
					res_sub_bl_view = res;
					console.log('sub_bl_view singkron_rka_ke_lokal', res_sub_bl_view);
					get_skpd(tahun, id_daerah, id_unit).then(function(res){
						data_unit = res;
						console.log('get_skpd singkron_rka_ke_lokal', data_unit);
						get_kode_from_rincian_page(opsi, kode_sbl).then(function(res){
							data_sbl = res;
							console.log('get_kode_from_rincian_page singkron_rka_ke_lokal', data_sbl);
							detil_lokasi_bl(idsubbl).then(function(res){
								detaillokasi = res;
								console.log('detaillokasi singkron_rka_ke_lokal', detaillokasi);
								capaian_bl(opsi.id_unit, opsi.id_skpd, opsi.id_sub_skpd, opsi.id_program, opsi.id_giat).then(function(res){
									capaian_bl_res = res;
									console.log('capaian_bl singkron_rka_ke_lokal', capaian_bl_res);
									dana_sub_bl(idsubbl).then(function(res){
										dana_sub_bl_res = res;
										console.log('dana_sub_bl singkron_rka_ke_lokal', dana_sub_bl_res);
										output_bl(idsubbl).then(function(res){
											output_bl_res = res;
											console.log('output_bl singkron_rka_ke_lokal', output_bl_res);
											tag_bl(idsubbl).then(function(res){
												tag_bl_res = res;
												console.log('tag_bl singkron_rka_ke_lokal', tag_bl_res);
												resolve();
											})
										})
									})
								})
							})
						})
					})
				})
			})
			.then(function(res){
				if(opsi && opsi.action){
					// kode_get = opsi.action.split("detilGiat('")[1].split("'")[0];
					kode_get = opsi.id_sub_bl;
					data_sbl = { 
						data: {
							pagu : opsi.pagu,
							pagumurni : opsi.pagumurni,
							kode_sub_skpd : opsi.kode_sub_skpd,
							nama_sub_skpd : opsi.nama_sub_skpd
						}
					}
				}else{
					kode_get = data_sbl.url;
				}
												
				// get detail indikator kegiatan
				relayAjax({						
					// url: endog+'?'+kode_get,		
					url: config.sipd_url+'api/renja/output_giat/load_data',						
					type: 'POST',	      				
					data: {            
						tahun: _token.tahun,
						id_daerah: _token.daerah_id,
						id_program: opsi.id_program,
						id_giat: opsi.id_giat,
						id_unit: opsi.id_unit,
						id_skpd: opsi.id_skpd,
						id_sub_skpd: opsi.id_sub_skpd,
					},
					beforeSend: function (xhr) {			    
						xhr.setRequestHeader("X-API-KEY", x_api_key());
						xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
					},						
					success: function(subkeg){
						console.log('output_giat singkron_rka_ke_lokal', subkeg.data);							
						var data_rka = { 
							action: 'singkron_rka',
							type: 'ri',
							tahun_anggaran: _token.tahun,
							api_key: config.api_key,
							rka : {},
							kode_skpd: kode_skpd,
							nama_skpd: nama_skpd,
							kode_sub_skpd: kode_sub_skpd,
							pagu: pagu,
							idbl: idbl,
							idsubbl: idsubbl,
							kode_bl: kode_bl,
							kode_sbl: kode_sbl,
							data_unit: {},
							dataBl: {},
							dataCapaian: {},
							dataDana: {},
							dataLb7: {},
							dataTag: {},
							dataEs3: {},
							dataHasil: {},
							dataOutput: {},
							dataLokout: {},
							dataOutputGiat: {},
						};
						if(!data_unit){
							data_rka.data_unit.kodeunit = data_sbl.data.kode_sub_skpd;
							data_rka.data_unit.namaunit = data_sbl.data.nama_sub_skpd;
						}else{
							for(var j in data_unit.data){
								data_rka.data_unit[j] = data_unit.data[j];
							}
						}
						console.log('data_unit', data_unit, data_rka.data_unit);
						subkeg.data.map(function(d, i){
							data_rka.dataOutputGiat[i] = {};
							data_rka.dataOutputGiat[i].id_giat = d.id_giat; //baru
							data_rka.dataOutputGiat[i].id_program = d.id_program; //baru
							data_rka.dataOutputGiat[i].id_skpd = d.id_skpd; //baru
							data_rka.dataOutputGiat[i].id_sub_skpd = d.id_sub_skpd; //baru
							data_rka.dataOutputGiat[i].id_unit = d.id_unit; //baru
							data_rka.dataOutputGiat[i].kode_renstra = d.kode_renstra; //baru
							data_rka.dataOutputGiat[i].kode_rpjm = d.kode_rpjm; //baru
							data_rka.dataOutputGiat[i].id_output_giat = d.id_output_giat; //baru
							data_rka.dataOutputGiat[i].outputteks = d.tolok_ukur;
							data_rka.dataOutputGiat[i].satuanoutput = d.satuan;
							data_rka.dataOutputGiat[i].targetoutput = d.target;
							data_rka.dataOutputGiat[i].targetoutputteks = d.target_teks;
						});
						detaillokasi.data.map(function(d, i){
							data_rka.dataLokout[i] = {};
							data_rka.dataLokout[i].idcamat = d.id_camat;
							data_rka.dataLokout[i].iddetillokasi = d.id_detil_lokasi;
							data_rka.dataLokout[i].idkabkota = d.id_kab_kota;
							data_rka.dataLokout[i].idlurah = d.id_lurah;									
							data_rka.dataLokout[i].id_sub_bl = d.id_sub_bl; //baru
							data_rka.dataLokout[i].tahun = d.tahun; //baru
							if(d.id_kab_kota != 0){
								get_view_daerah(d.id_kab_kota).then(function(daerah){	
									console.log('daerah singkron_rka_ke_lokal', daerah.data);																
									data_rka.dataLokout[i].daerahteks = daerah.data[0].nama_daerah;
									if(d.id_camat != 0){
										get_view_kecamatan(d.id_camat).then(function(kecamatan){
											console.log('kecamatan singkron_rka_ke_lokal', kecamatan);	
											data_rka.dataLokout[i].camatteks = kecamatan.data[0].camat_teks;
											if(d.id_lurah != 0){
												get_view_desa_kel(d.id_lurah).then(function(kelurahan){
													console.log('kelurahan singkron_rka_ke_lokal', kelurahan.data);	
													data_rka.dataLokout[i].lurahteks = kelurahan.data[0].lurah_teks;
												});
											}
										});
									}																
								});
							}else{
								get_view_daerah(_token.id_daerah).then(function(daerah){	
									console.log('daerah singkron_rka_ke_lokal', daerah.data);																
									data_rka.dataLokout[i].daerahteks = daerah.data[0].nama_daerah;
									if(d.id_camat != 0){
										get_view_kecamatan(d.id_camat).then(function(kecamatan){
											console.log('kecamatan singkron_rka_ke_lokal', kecamatan);	
											data_rka.dataLokout[i].camatteks = kecamatan.data[0].camat_teks;
											if(d.id_lurah != 0){
												get_view_desa_kel(d.id_lurah).then(function(kelurahan){
													console.log('kelurahan singkron_rka_ke_lokal', kelurahan.data);	
													data_rka.dataLokout[i].lurahteks = kelurahan.data[0].lurah_teks;
												});
											}
										});
									}																
								});
							}
						});

						capaian_bl_res.data.map(function(d, i){
							data_rka.dataCapaian[i] = {};
							data_rka.dataCapaian[i].satuancapaian = d.satuan;
							data_rka.dataCapaian[i].targetcapaianteks = d.target_teks;
							data_rka.dataCapaian[i].capaianteks = d.tolak_ukur;
							data_rka.dataCapaian[i].targetcapaian = d.target;
							data_rka.dataCapaian[i].id_capaian_bl = d.id_capaian_bl; //baru
							data_rka.dataCapaian[i].id_bl = d.id_bl; //baru
							data_rka.dataCapaian[i].id_unit = d.id_unit; //baru
							data_rka.dataCapaian[i].id_skpd = d.id_skpd; //baru
							data_rka.dataCapaian[i].id_sub_skpd = d.id_sub_skpd; //baru
							data_rka.dataCapaian[i].id_program = d.id_program; //baru
							data_rka.dataCapaian[i].id_giat = d.id_giat; //baru
							data_rka.dataCapaian[i].kode_rpjm = d.kode_rpjm; //baru
						});

						dana_sub_bl_res.data.map(function(d, i){
							data_rka.dataDana[i] = {};
							data_rka.dataDana[i].namadana = d.nama_dana;
							data_rka.dataDana[i].kodedana = d.kodedana;
							data_rka.dataDana[i].iddana = d.id_dana;
							data_rka.dataDana[i].iddanasubbl = d.id_dana_sub_bl;																					
							data_rka.dataDana[i].pagudana = d.pagu_dana;
							data_rka.dataDana[i].id_sub_bl = d.id_sub_bl; //baru	
						});

						//output sub giat
						output_bl_res.data.map(function(d, i){
							data_rka.dataOutput[i] = {};
							data_rka.dataOutput[i].outputteks = d.tolak_ukur;
							data_rka.dataOutput[i].targetoutput = d.target;
							data_rka.dataOutput[i].satuanoutput = d.satuan;
							data_rka.dataOutput[i].targetoutputteks = d.target_teks;
							data_rka.dataOutput[i].idoutputbl = d.id_output_bl;
							data_rka.dataOutput[i].tolok_ukur_sub = d.tolok_ukur_sub; //baru
							data_rka.dataOutput[i].target_sub = d.target_sub; //baru
							data_rka.dataOutput[i].target_sub_teks = d.target_sub_teks; //baru
							data_rka.dataOutput[i].satuan_sub = d.satuan_sub; //baru
							data_rka.dataOutput[i].id_sub_bl = d.id_sub_bl; //baru
							data_rka.dataOutput[i].id_unit = d.id_unit; //baru
							data_rka.dataOutput[i].id_skpd = d.id_skpd; //baru
							data_rka.dataOutput[i].id_sub_skpd = d.id_sub_skpd; //baru
							data_rka.dataOutput[i].id_program = d.id_program; //baru
							data_rka.dataOutput[i].id_giat = d.id_giat; //baru
							data_rka.dataOutput[i].id_sub_giat = d.id_sub_giat; //baru
						});
						if(tag_bl_res.data.length == 0){
							console.log('tag_bl belum diset pada sub kegiatan ini !');
						}else{
							tag_bl_res.data.map(function(d, i){
								data_rka.dataTag[i] = {};
								data_rka.dataTag[i].idlabelgiat = d.idlabelgiat;
								data_rka.dataTag[i].namalabel = d.nama_bl;
								data_rka.dataTag[i].idtagbl = d.id_tag_bl;
							});
						}

						// subkeg.dataBl.map(function(d, i){
						res_sub_bl_view.data.map(function(d, i){
							data_rka.dataBl[i] = {};															
							data_rka.dataBl[i].id_sub_bl = d.id_sub_bl;
							data_rka.dataBl[i].id_unik_sub_bl = d.id_unik;
							data_rka.dataBl[i].id_unit = d.id_unit; //baru
							data_rka.dataBl[i].id_skpd = d.id_skpd;
							data_rka.dataBl[i].id_sub_skpd = d.id_sub_skpd;
							data_rka.dataBl[i].id_pptk = d.id_pptk; //baru
							data_rka.dataBl[i].id_urusan_pusat = d.id_urusan_pusat; //baru
							data_rka.dataBl[i].id_bidang_urusan_pusat = d.id_bidang_urusan_pusat; //baru
							data_rka.dataBl[i].id_urusan = d.id_urusan;
							data_rka.dataBl[i].id_bidang_urusan = d.id_bidang_urusan;
							data_rka.dataBl[i].id_program = d.id_program;
							data_rka.dataBl[i].id_giat = d.id_giat;															
							data_rka.dataBl[i].id_bl = d.id_bl;
							data_rka.dataBl[i].id_sub_giat = d.id_sub_giat;
							data_rka.dataBl[i].no_program = d.no_program;
							data_rka.dataBl[i].no_giat = d.no_giat;
							data_rka.dataBl[i].no_sub_giat = d.no_sub_giat;
							data_rka.dataBl[i].pagu = d.pagu;
							// data_rka.dataBl[i].pagu = data_sbl.data.pagu;															
							data_rka.dataBl[i].id_dana = d.id_dana;
							data_rka.dataBl[i].id_lokasi = d.id_lokasi;
							data_rka.dataBl[i].waktu_awal = d.waktu_awal;
							data_rka.dataBl[i].waktu_akhir = d.waktu_akhir;
							data_rka.dataBl[i].pagu_indikatif = d.pagu_indikatif; //baru
							data_rka.dataBl[i].output_sub_giat = d.output_teks;															
							data_rka.dataBl[i].pagu_n2_lalu = d.pagu_n2_lalu; //baru
							data_rka.dataBl[i].pagu_n_lalu = d.pagu_n_lalu;
							data_rka.dataBl[i].pagu_n_depan = d.pagu_n_depan;
							data_rka.dataBl[i].pagu_n2_depan = d.pagu_n2_depan; //baru
							data_rka.dataBl[i].kunci_bl = d.kunci_bl; //baru
							data_rka.dataBl[i].kunci_bl_rinci = d.kunci_bl_rinci; //baru
							data_rka.dataBl[i].kunci_bl_akb = d.kunci_bl_akb; //baru
							data_rka.dataBl[i].rkpd_murni = d.rkpd_murni; //baru
							data_rka.dataBl[i].rkpd_pak = d.rkpd_pak; //baru
							// data_rka.dataBl[i].pagumurni = data_sbl.data.pagumurni;															
							data_rka.dataBl[i].pagumurni = d.rkpd_murni;
							data_rka.dataBl[i].nama_unit = d.nama_unit; //baru
							data_rka.dataBl[i].nama_skpd = d.nama_skpd; 
							data_rka.dataBl[i].nama_sub_skpd = d.nama_sub_skpd;
							data_rka.dataBl[i].nama_urusan = d.nama_urusan;
							data_rka.dataBl[i].nama_bidang_urusan = d.nama_bidang_urusan;
							data_rka.dataBl[i].nama_program = d.nama_program;
							data_rka.dataBl[i].nama_giat = d.nama_giat;
							data_rka.dataBl[i].nama_bl = d.nama_bl; //baru
							data_rka.dataBl[i].nama_sub_giat = d.nama_sub_giat;
							data_rka.dataBl[i].nama_pptk = d.nama_pptk; //baru
							data_rka.dataBl[i].nama_urusan_pusat = d.nama_urusan_pusat; //baru
							data_rka.dataBl[i].nama_bidang_urusan_pusat = d.nama_bidang_urusan_pusat; //baru
							data_rka.dataBl[i].nama_dana = d.nama_dana;
							data_rka.dataBl[i].nama_lokasi = d.nama_lokasi;
							data_rka.dataBl[i].kua_murni = d.kua_murni; //baru
							data_rka.dataBl[i].kua_pak = d.kua_pak; //baru
							data_rka.dataBl[i].kode_skpd = d.kode_skpd; 
							data_rka.dataBl[i].kode_urusan = d.kode_urusan;
							data_rka.dataBl[i].kode_urusan_pusat = d.kode_urusan_pusat; //baru
							data_rka.dataBl[i].kode_bidang_urusan = d.kode_bidang_urusan;
							data_rka.dataBl[i].kode_bidang_urusan_pusat = d.kode_bidang_urusan_pusat; //baru
							data_rka.dataBl[i].kode_program = d.kode_program;
							data_rka.dataBl[i].kode_giat = d.kode_giat;
							data_rka.dataBl[i].kode_sub_giat = d.kode_sub_giat;
							data_rka.dataBl[i].kode_dana = d.kode_dana; //baru
																						
							data_rka.dataBl[i].sasaran = d.sasaran;
							data_rka.dataBl[i].indikator = d.indikator;															
							data_rka.dataBl[i].satuan = d.satuan;
							data_rka.dataBl[i].id_rpjmd = d.id_rpjmd;		
							data_rka.dataBl[i].target_1 = d.target_1;
							data_rka.dataBl[i].target_2 = d.target_2;
							data_rka.dataBl[i].target_3 = d.target_3;
							data_rka.dataBl[i].target_4 = d.target_4;
							data_rka.dataBl[i].target_5 = d.target_5;
							// var idunitsbl = d.id_unit;
							// var idsubblbl = d.id_sub_bl;
							label_bl(d.id_sub_bl).then(function(labelbl){
								console.log('label_bl singkron_rka_ke_lokal', labelbl.data);	
								data_rka.dataBl[i].id_label_bl = labelbl.data[0].id_label_bl; //baru								
								data_rka.dataBl[i].id_label_kokab = labelbl.data[0].id_label_kokab;
								if(labelbl.data[0].id_label_kokab.length !=0){
									get_label_kokab(labelbl.data[0].id_label_kokab).then(function(label_kokab){										
										data_rka.dataBl[i].label_kokab = label_kokab.data[0].nama_label;
									});		
								}
								//data_rka.dataBl[i].label_kokab = labelbl.data[0].label_kokab;
								data_rka.dataBl[i].id_label_prov = labelbl.data[0].id_label_prov;
								if(labelbl.data[0].id_label_prov.length !=0){
									get_label_prov(labelbl.data[0].id_label_prov).then(function(label_prov){										
										data_rka.dataBl[i].label_prov = label_prov.data[0].nama_label;
									});		
								}
								// data_rka.dataBl[i].label_prov = labelbl.data[0].label_prov;
								data_rka.dataBl[i].id_label_pusat = labelbl.data[0].id_label_pusat;
								if(labelbl.data[0].id_label_pusat.length !=0){
									get_label_pusat(labelbl.data[0].id_label_pusat).then(function(label_pusat){										
										data_rka.dataBl[i].label_pusat = label_pusat.data[0].nama_label;
									});		
								}
								// data_rka.dataBl[i].label_pusat = labelbl.data[0].label_pusat;								
							});														
						});
						

						var kode_go_hal_rinci = {
							go_rinci: false,
							kode: idsubbl
						};
						if(opsi && opsi.action){
							if(idsubbl > 2){																
								kode_go_hal_rinci.go_rinci = true;
								// kode_go_hal_rinci.kode = 'main?'+aksi[1].split("'")[0];
								kode_go_hal_rinci.kode = idsubbl;
							}else{
								var data = {
									message:{
										type: "get-url",
										content: {
											url: config.url_server_lokal,
											type: 'post',
											data: data_rka,
											return: false
										}
									}
								};
								if(!opsi || !opsi.no_return){
									data.message.content.return = true;
								}
								chrome.runtime.sendMessage(data, function(response) {
									// console.log('responeMessage', response);
									// return resolve_reduce(nextData);
								});
								if(callback){
									callback();
								}
								console.log('Send RENJA tanpa rincian!');
								return true;
							}
						}

						// cek jika rincian 0 maka langsung return.
						// dimatikan karena rincian yang dinollkan pada apbd-p tidak ikut ketarik
						if(
							data_rka.dataBl[0].pagu == 0
							|| data_rka.dataBl[0].pagu == ''
							|| !data_rka.dataBl[0].pagu
						){
							data_rka.no_page = 1;
							data_rka.rka = 0;
							var data = {
								message:{
									type: "get-url",
									content: {
										url: config.url_server_lokal,
										type: 'post',
										data: data_rka,
										return: false
									}
								}
							};
							if(!opsi || !opsi.no_return){
								data.message.content.return = true;
							}
							chrome.runtime.sendMessage(data, function(response) {
								// console.log('responeMessage', response);
							});
							if(callback){
								callback();
							}
							console.log('Rincian kosong di SIPD!');
							return true;
						}

						go_halaman_detail_rincian(kode_go_hal_rinci)
						.then(function(kode_get_rinci_all){
							relayAjax({
								url: config.sipd_url+'api/renja/rinci_sub_bl/list_by_id_skpd',
								type: 'POST',
								data: {
									tahun: _token.tahun,
									id_daerah: _token.daerah_id,
									id_skpd: opsi.id_skpd,
									id_sub_skpd: opsi.id_sub_skpd,
								},
								beforeSend: function (xhr) {			    
									xhr.setRequestHeader("X-API-KEY", x_api_key());
									xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);
								},
								success: function(data){
									console.log('go_halaman_detail_rincian', data);
									var _leng = config.jml_rincian;
									var _data_all = [];
									var _data = [];
									data.data.map(function(rka, i){										
										var _rka = {};
											
										_rka.action = rka.action;
										_rka.created_user = rka.created_user;
										_rka.createddate = rka.createddate;
										_rka.createdtime = rka.createdtime;
										_rka.harga_satuan = rka.harga_satuan;
										_rka.harga_satuan_murni = rka.harga_satuan_murni;
										_rka.id_daerah = rka.id_daerah;
										_rka.id_rinci_sub_bl = rka.id_rinci_sub_bl;										
										_rka.id_standar_nfs = rka.id_standar_nfs;
										_rka.id_standar_harga = rka.id_standar_harga; //baru
										_rka.id_dana = rka.id_dana; //baru
										_rka.id_blt = rka.id_blt; //baru
										_rka.id_usulan = rka.id_usulan; //baru
										_rka.id_jenis_usul = rka.id_dana; //baru
										_rka.is_locked = rka.is_locked;
										_rka.jenis_bl = rka.jenis_bl;
										
										_rka.id_akun = rka.id_akun;
										_rka.kode_akun = rka.kode_akun;
										_rka.koefisien = rka.koefisien;
										_rka.koefisien_murni = rka.koefisien_murni;
										_rka.lokus_akun_teks = rka.lokus_akun_teks;
										_rka.nama_akun = rka.nama_akun;
										_rka.nama_standar_harga = rka.nama_standar_harga;
										// if(rka.nama_standar_harga && rka.nama_standar_harga.nama_komponen){
										get_rinci_sub_bl(opsi.id_skpd, rka.id_sub_bl).then(function(rinci_sub_bl){										
											_rka.nama_komponen = rinci_sub_bl.nama_standar_harga;
											_rka.spek_komponen = rinci_sub_bl.spek;
											_rka.id_subs_sub_bl = rinci_sub_bl.id_subs_sub_bl; //baru
											_rka.id_ket_sub_bl = rinci_sub_bl.id_ket_sub_bl; //baru
											_rka.idketerangan = rinci_sub_bl.id_ket_sub_bl;
											_rka.idsubtitle = rinci_sub_bl.id_subs_sub_bl;
											if(rinci_sub_bl.id_ket_sub_bl !=0){
												get_ket_sub_bl(rinci_sub_bl.id_ket_sub_bl).then(function(ket_sub_bl){
													_rka.ket_bl_teks = ket_sub_bl.ket_bl_teks;
												});	
											}
											if(rinci_sub_bl.id_subs_sub_bl !=0){
												get_subs_sub_bl(rinci_sub_bl.id_subs_sub_bl).then(function(subs_sub_bl){
													_rka.subs_bl_teks = subs_sub_bl.subs_bl_teks;
												});	
											}
										});	
										if(rka.nama_standar_harga){
											_rka.nama_komponen = rka.nama_standar_harga;
											// _rka.spek_komponen = rka.spek_komponen;
										}else{
											_rka.nama_komponen = '';
											// _rka.spek_komponen = '';
										}
										
										if(rka.satuan){
											_rka.satuan = rka.satuan;
										}else{
											if(_rka.koefisien){
												_rka.satuan = rka.koefisien.split(' ');
												_rka.satuan.shift();
												_rka.satuan = _rka.satuan.join(' ');
											}
										}
										_rka.sat1 = rka.sat_1;
										_rka.sat2 = rka.sat_2;
										_rka.sat3 = rka.sat_3;
										_rka.sat4 = rka.sat_4;
										_rka.spek = rka.spek;
										_rka.volum1 = rka.vol_1;
										_rka.volum2 = rka.vol_2;
										_rka.volum3 = rka.vol_3;
										_rka.volum4 = rka.vol_4;
										_rka.volume = rka.volume;
										_rka.volume_murni = rka.volume_murni;
										// _rka.subs_bl_teks = substeks_all[rka.subs_bl_teks.substeks];
										// _rka.total_harga = rka.rincian;
										_rka.total_harga = rka.total_harga;
										_rka.rincian = rka.total_harga;
										// _rka.rincian = rka.rincian;
										// _rka.rincian_murni = rka.rincian_murni;
										_rka.rincian_murni = rka.rkpd_murni; //baru
										_rka.pajak = rka.pajak;
										_rka.pajak_murni = rka.pajak_murni;
										_rka.totalpajak = rka.totalpajak;
										_rka.updated_user = rka.updated_user;
										_rka.updateddate = rka.updateddate;
										_rka.updatedtime = rka.updatedtime;
										_rka.user1 = rka.user1;
										_rka.user2 = rka.user2;
										_rka.id_prop_penerima = 0;
										_rka.id_camat_penerima = 0;
										_rka.id_kokab_penerima = 0;
										_rka.id_lurah_penerima = 0;
										_rka.id_penerima = 0;
										_rka.idkomponen = 0;
										
										_rka.set_sisa_kontrak = rka.set_sisa_kontrak; //baru
										_data.push(_rka);
										if((i+1)%_leng == 0){
											_data_all.push(_data);
											_data = [];
										}
									});
									if(_data.length > 0){
										_data_all.push(_data);
									}
									console.log('_data_all', _data_all);

									var no_excel = 0;
									var no_page = 0;
									var total_page = _data_all.length;
									var last = _data_all.length-1;

									_data_all.reduce(function(sequence, nextData){
										return sequence.then(function(current_data){
											return new Promise(function(resolve_reduce, reject_reduce){
												console.log('current_data', current_data);
												var sendData = current_data.map(function(rka, i){
													data_rka.rka[i] = rka;
													if(
														(
															rka.id_rinci_sub_bl == null 
															|| rka.id_rinci_sub_bl == '' 
														) || (
															rka.action == '' && !config.sipd_private
														)
													){
														return Promise.resolve();
													}
													// }else{
													// 	try{
													// 		var kode_get_rka = rka.action.split("ubahKomponen('")[1].split("'")[0];
													// 	}catch(e){
													// 		var kode_get_rka = false;
													// 	}
													// 	return getDetailRin(id_unit, kode_sbl, rka.id_rinci_sub_bl, 0, kode_get_rka).then(function(detail_rin){
													// 		if(detail_rin){
													// 			data_rka.rka[i].id_prop_penerima = detail_rin.id_prop_penerima;
													// 			data_rka.rka[i].id_camat_penerima = detail_rin.id_camat_penerima;
													// 			data_rka.rka[i].id_kokab_penerima = detail_rin.id_kokab_penerima;
													// 			data_rka.rka[i].id_lurah_penerima = detail_rin.id_lurah_penerima;
													// 			data_rka.rka[i].id_penerima = detail_rin.id_penerima;
													// 			data_rka.rka[i].idkomponen = detail_rin.idkomponen;
													// 			data_rka.rka[i].idketerangan = detail_rin.idketerangan;
													// 			data_rka.rka[i].idsubtitle = detail_rin.idsubtitle;
													// 		}
													// 		if(!opsi){
													// 			no_excel++;
													// 			var tbody_excel = ''
													// 				+'<tr>'
													// 					+'<td style="mso-number-format:\@;">'+no_excel+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+kode_sbl+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].jenis_bl+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].idsubtitle+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].subs_bl_teks+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].idketerangan+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].ket_bl_teks+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].kode_akun+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].nama_akun+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].nama_komponen+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].spek_komponen+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].koefisien+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].satuan+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].harga_satuan+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].totalpajak+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].rincian+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_rinci_sub_bl+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_penerima+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].lokus_akun_teks+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_prop_penerima+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_camat_penerima+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_kokab_penerima+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_lurah_penerima+'</td>'
													// 					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].idkomponen+'</td>'
													// 				+'</tr>';
													// 			jQuery('#data_rin_excel').append(tbody_excel);
													// 			console.log('data_rka.rka[i]', data_rka.rka[i]);
													// 		}
													// 	});
													// }
												});
												Promise.all(sendData)
												.then(function(val_all){
													// console.log('sendMessage tes');
													no_page++;
													data_rka.no_page = no_page;
													data_rka.total_page = total_page;
													var data = {
														message:{
															type: "get-url",
															content: {
																url: config.url_server_lokal,
																type: 'post',
																data: data_rka,
																return: true
															}
														}
													};
													if(typeof continue_singkron_rka == 'undefined'){
														window.continue_singkron_rka = {};
													}
													continue_singkron_rka[kode_sbl] = {
														no_resolve: false,
														resolve: resolve_reduce,
														next: nextData,
														alert: false
													};
													if(!opsi || !opsi.no_return){
														continue_singkron_rka[kode_sbl].alert = true;
													}
													if(
														total_page == 1
														|| total_page == no_page
													){
														continue_singkron_rka[kode_sbl].no_resolve = true;
														resolve_reduce(nextData);
													}
													chrome.runtime.sendMessage(data, function(response) {});
												})
												.catch(function(err){
													console.log('err', err);
													return resolve_reduce(nextData);
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
									}, Promise.resolve(_data_all[last]))
									.then(function(data_last){
										// jika sub kegiatan aktif tapi nilai rincian dikosongkan, maka tetap perlu disingkronkan ke lokal
										if(_data_all.length == 0){
											data_rka.no_page = no_page;
											data_rka.total_page = total_page;
											var data = {
												message:{
													type: "get-url",
													content: {
														url: config.url_server_lokal,
														type: 'post',
														data: data_rka,
														return: true
													}
												}
											};
											if(typeof continue_singkron_rka == 'undefined'){
												window.continue_singkron_rka = {};
											}
											continue_singkron_rka[kode_sbl] = {
												no_resolve: true,
												alert: false
											};
											if(!opsi || !opsi.no_return){
												continue_singkron_rka[kode_sbl].alert = true;
											}
											chrome.runtime.sendMessage(data, function(response) {});
										}
										console.log('selesai kirim data ke lokal!', opsi);
									});

									// langsung jalankan callback untuk proses ke sub keg selanjutnya
									if(callback){
										callback();
									}
								}
							});
						});
					}
				});
			});
		}else{
			alert('ID Belanja tidak ditemukan!');
			hide_loading();
		}
	}
}

function getJadwalAktifRenja(){
	return new Promise(function(resolve, reduce){
		relayAjax({
			url: config.sipd_url+'api/jadwal/renja_jadwal/cek_aktif',
			cache: true,
			type: 'post',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
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

function get_skpd(tahun, iddaerah, idskpd){
    return new Promise(function(resolve, reject){
		relayAjax({	      	
			url: config.sipd_url+'api/master/skpd/view/'+idskpd+'/'+tahun+'/'+iddaerah,			
			type: 'GET',	      				
			processData: false,
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},	
	      	success: function(skpd){
	      		return resolve(skpd);
	      	}
	    });
    });
}

function list_belanja_by_tahun_daerah_unit(idskpd){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/list_belanja_by_tahun_daerah_unit',
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_unit: idskpd
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(subkeg){
	      		return resolve(subkeg);
	      	}
	    });
    });
}

function setup_unit(idunit){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/setup_unit/find_by_id_unit',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_unit: idunit
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(opd){
	      		return resolve(opd);
	      	}
	    });
    });
}

function get_pagu_validasi(tahun, iddaerah, idskpd){
    return new Promise(function(resolve, reject){
		relayAjax({	      	
			url: config.sipd_url+'api/renja/setup_unit/pagu_validasi?tahun='+tahun+'&id_daerah='+iddaerah+'&id_unit='+idskpd,			
			type: 'GET',	      							
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},	
	      	success: function(data){
	      		return resolve(data);
	      	}
	    });
    });
}

function total_usul_bantuan(idskpd){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/usulan/usul_bantuan/total_approve',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_skpd: idskpd
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(asmas){
	      		return resolve(asmas);
	      	}
	    });
    });
}

function total_usul_pokir(idskpd){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/usulan/usul_pokir/total_approve',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_skpd: idskpd
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(pokir){
	      		return resolve(pokir);
	      	}
	    });
    });
}

function sub_bl_view(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/view/'+id_sub_bl,                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(sub_bl_view){
	      		return resolve(sub_bl_view);
	      	}
	    });
    });
}

function master_label_giat(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/label_giat/list',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(master_label_giat){
	      		return resolve(master_label_giat);
	      	}
	    });
    });
}

function master_lokasi(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/daerah/lokasi',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(master_lokasi){
	      		return resolve(master_lokasi);
	      	}
	    });
    });
}

function master_sumberdana(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/sumber_dana/list',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				length: 1000,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(master_sumberdana){
	      		return resolve(master_sumberdana);
	      	}
	    });
    });
}

function rinci_sub_bl(idskpd){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/rinci_sub_bl/list_by_id_skpd',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_skpd: idskpd
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(rinci_sub_bl){
	      		return resolve(rinci_sub_bl);
	      	}
	    });
    });
}

function tag_bl(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/tag_bl/get_by_id_sub_bl',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_sub_bl: id_sub_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(tag_bl){
	      		return resolve(tag_bl);
	      	}
	    });
    });
}

function label_bl(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/label_bl/get_by_id_sub_bl',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_sub_bl: id_sub_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(labelbl){
	      		return resolve(labelbl);
	      	}
	    });
    });
}

function subs_sub_bl(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/subs_sub_bl/list',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					tahun: _token.tahun,
					id_sub_bl: id_sub_bl
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(subs_sub_bl){
	      		return resolve(subs_sub_bl);
	      	}
	    });
    });
}

function ket_sub_bl(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/ket_sub_bl/list',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					tahun: _token.tahun,
					id_sub_bl: id_sub_bl
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ket_sub_bl){
	      		return resolve(ket_sub_bl);
	      	}
	    });
    });
}

function dana_sub_bl(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/dana_sub_bl/get_by_id_sub_bl',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_sub_bl: id_sub_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(dana_sub_bl){
	      		return resolve(dana_sub_bl);
	      	}
	    });
    });
}

function detil_lokasi_bl(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/detil_lokasi_bl/get_by_id_sub_bl',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_sub_bl: id_sub_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(detil_lokasi_bl){
	      		return resolve(detil_lokasi_bl);
	      	}
	    });
    });
}

function capaian_bl(id_unit, id_skpd, id_sub_skpd, id_program, id_giat){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/capaian_bl/load_data',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					tahun: _token.tahun,
					id_program: id_program,
					id_giat: id_giat,
					id_unit: id_unit,
					id_skpd: id_skpd,
					id_sub_skpd: id_sub_skpd,
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(capaian_bl){
	      		return resolve(capaian_bl);
	      	}
	    });
    });
}

//output sub giat
function output_bl(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/output_bl/get_by_id_sub_bl',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					tahun: _token.tahun,
					id_sub_bl: id_sub_bl
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(output_bl){
	      		return resolve(output_bl);
	      	}
	    });
    });
}

function get_master_label_kokab(tahun, iddaerah, id_label_kokab){
    return new Promise(function(resolve, reject){
		relayAjax({	      	
			url: config.sipd_url+'api/master/label_kokab/view/'+id_label_kokab+'/'+tahun+'/'+iddaerah,			
			type: 'GET',	      							
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},	
	      	success: function(data){
	      		return resolve(data);
	      	}
	    });
    });
}

function get_sumber_dana(tahun, id_dana){
    return new Promise(function(resolve, reject){
		relayAjax({	      	
			url: config.sipd_url+'api/master/sumber_dana/view/'+id_dana+'/'+tahun,			
			type: 'GET',	      							
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},	
	      	success: function(data){
	      		return resolve(data);
	      	}
	    });
    });
}

function get_kode_from_rincian_page(opsi, kode_sbl){
	return new Promise(function(resolve, reject){
		if(!opsi || !opsi.kode_bl){
			// var url_sub_keg = jQuery('.white-box .p-b-20 a.btn-circle').attr('href');
			relayAjax({
				url: config.sipd_url+'api/renja/rinci_sub_bl/list_by_id_skpd',                                    
				type: 'POST',	      				
				data: {            
						id_daerah: _token.daerah_id,				
						tahun: _token.tahun,
						id_skpd: opsi.id_unit,
					},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
				success: function(html){
					list_belanja_by_tahun_daerah_unit(opsi.id_unit)
					.then(function(subkeg){
						var cek = false;
						// ganti menjadi true jika ingin mengsingkronkan sub keg yang tergembok / nomenklatur lama
						var allow_lock_subkeg = false;
						subkeg.data.map(function(b, i){
							if(
								(
									allow_lock_subkeg 
									|| b.sub_giat_locked == 0
								)
								&& b.kode_sub_skpd
								&& b.kode_sbl == kode_sbl
							){
								cek = true;
								// return resolve({ url: b.action.split("detilGiat('")[1].split("'")[0], data: b });
								return resolve({ data: b });
							}
						});
						if(!cek){
							alert('Sub kegiatan ini tidak ditemukan di SIPD. (Sub kegiatan tergembok / sudah dihapus)');
						}
					});
				}
			});
		}else{
			return resolve(false);
		}
	});
}

function go_halaman_detail_rincian(options){
	return new Promise(function(resolve, reject){
		if(!options.go_rinci){
			return resolve({
				kode_get_rinci: options.kode,
				// kode_get_rinci_subtitle: lru19,
				// kode_get_rinci_realisasi: lru18
			});
		}else{
			relayAjax({
				// url: options.kode,
				url: config.sipd_url+'api/renja/sub_bl/view/'+options.kode,                                    
				type: 'POST',	      				
				data: {            
						id_daerah: _token.daerah_id,				
						tahun: _token.tahun
					},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
				success: function(html){
					console.log('go_halaman_detail_rincian', html);
					var kode_get_rinci = html.data.id_sub_bl;
					// var kode_get_rinci = html.split('lru1="')[1].split('"')[0];
					// var kode_get_rinci_realisasi = html.split('lru18="')[1].split('"')[0];
					// var kode_get_rinci_subtitle = html.split('lru19="')[1].split('"')[0];
					return resolve({
						kode_get_rinci: kode_get_rinci,
						// kode_get_rinci: kode_get_rinci,
						// kode_get_rinci_subtitle: kode_get_rinci_subtitle,
						// kode_get_rinci_realisasi: kode_get_rinci_realisasi
					});
				}
			});
		}
	})
	.catch(function(e){
        console.log(e);
        return Promise.resolve();
    });
}


// function getRealisasiBelanja(kode_get_rinci_realisasi){
// 	return new Promise(function(resolve, reject){
// 		if(config.realisasi){
// 			jQuery.ajax({
// 				url: kode_get_rinci_realisasi,
// 				type: 'post',
// 				data: "_token="+tokek+'&v1bnA1m='+v1bnA1m,
// 				success: function(ret){
// 					return resolve(ret.data);
// 				},
// 				error: function(ret){
// 					return resolve(false);
// 				}
// 			});
// 		}else{
// 			return resolve(false);
// 		}
// 	})
// }

function getSumberDanaBelanja(substeks_all, kode_get_rinci_subtitle){
	return new Promise(function(resolve, reject){
		var data_array = [];
		for(var i in substeks_all){
			data_array.push({
				kelompok: i,
				data: substeks_all[i]
			});
		}
		var last = data_array.length-1;
		data_array.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			if(
						current_data.kelompok == ''
						|| current_data.kelompok == '_'
						|| current_data.kelompok == null
						|| !current_data.kelompok
					){
						substeks_all[current_data.kelompok].sumber_dana = {
							"id_subtitle":null,
							"subtitle_teks":"",
							"is_paket":1,
							"id_dana":null,
							"kode_dana":null,
							"nama_dana":null
						};
						resolve_reduce(nextData);
					}else{
						var formDataCustom = new FormData();
						formDataCustom.append('_token', tokek);
						formDataCustom.append('v1bnA1m', v1bnA1m);
						formDataCustom.append('DsK121m', Curut("id_subtitle=0&subs_teks="+encodeURIComponent(current_data.kelompok)));
						relayAjax({
							url: kode_get_rinci_subtitle+'&subs_teks='+current_data.kelompok,
							type: 'post',
					        data: formDataCustom,
					        processData: false,
					        contentType: false,
							success: function(data){
								var subs_teks = this.url.split('&subs_teks=')[1];
								substeks_all[current_data.kelompok].sumber_dana = data;
								resolve_reduce(nextData);
							}
						});
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
        }, Promise.resolve(data_array[last]))
        .then(function(data_last){
        	resolve(substeks_all);
        });
	});
}

function getDetailRin(id_unit, kode_sbl, idbelanjarinci, nomor_lampiran, kode_get_rka){
	return new Promise(function(resolve, reject){
		if(!kode_get_rka && !config.sipd_private){
			if(typeof resolve_get_url == 'undefined'){
				window.resolve_get_url = {};
			}
			resolve_get_url[idbelanjarinci] = resolve;
			var data_send = { 
				action: 'get_data_rka',
				api_key: config.api_key,
				tahun_anggaran: config.tahun_anggaran,
				kode_sbl: kode_sbl,
				idbelanjarinci: idbelanjarinci
			};
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: data_send,
		    			return: true
					}
			    }
			};
			chrome.runtime.sendMessage(data, function(response) {
			    console.log('responeMessage', response);
			});
		}else{
			getKeyCariRinc(kode_get_rka, id_unit, kode_sbl, idbelanjarinci).then(function(kode_get_rka){
				getToken().then(function(_token){
					relayAjax({
						// url: config.sipd_url+'daerah/main/'+get_type_jadwal()+'/belanja/'+config.tahun_anggaran+'/rinci/cari-rincian/'+config.id_daerah+'/'+id_unit,
						url: config.sipd_url+'daerah/main?'+kode_get_rka,
						type: 'POST',
						data: formData,
						processData: false,
						contentType: false,
						success: function(rinci){
							if(nomor_lampiran == 5){
								getProv(id_unit, rincsub[kode_sbl].lru4).then(function(prov){
									if(prov[rinci.id_prop_penerima]){
										rinci.nama_prop = prov[rinci.id_prop_penerima].nama;
										getKab(id_unit, rinci.id_prop_penerima, rincsub[kode_sbl].lru5).then(function(kab){
											if(kab[rinci.id_kokab_penerima]){
												rinci.nama_kab = kab[rinci.id_kokab_penerima].nama;
												getKec(id_unit, rinci.id_prop_penerima, rinci.id_kokab_penerima, rincsub[kode_sbl].lru6).then(function(kec){
													if(kec[rinci.id_camat_penerima]){
														rinci.nama_kec = kec[rinci.id_camat_penerima].nama;
														getKel(id_unit, rinci.id_prop_penerima, rinci.id_kokab_penerima, rinci.id_camat_penerima, rincsub[kode_sbl].lru7).then(function(kel){
															if(kel[rinci.id_lurah_penerima]){
																rinci.nama_kel = kel[rinci.id_lurah_penerima].nama;
																return resolve(rinci);
															}else{
																return resolve(rinci);
															}
														});
													}else{
														return resolve(rinci);
													}
												});
											}else{
												return resolve(rinci);
											}
										});
									}else{
										return resolve(rinci);
									}
								});
							}else{
								return resolve(rinci);
							}
						},
						error: function(e){
							return resolve(false)
						}
					});
				});
			});
		}
	});
}

function proses_setting_kegiatan(tipe_task, sigkron_sub_keg=false){
	var data_selected = [];
	jQuery('#table-extension tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_selected.push(rka_all[id]);
		}
	});
	if(data_selected.length >= 1){
		console.log('data_selected', data_selected);
		if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
			var last = data_selected.length-1;
			data_selected.reduce(function(sequence, nextData){
	            return sequence.then(function(current_data){
	        		return new Promise(function(resolve_reduce, reject_reduce){
						if(tipe_task == 'kunci-tambah-kegiatan'){
							update_kunci_tambah_giat(current_data, 1)
							.then(function(){
								resolve_reduce(nextData);
							});
						}else if(tipe_task == 'buka-tambah-kegiatan'){
							update_kunci_tambah_giat(current_data, 0)
							.then(function(){
								if(!sigkron_sub_keg){
									resolve_reduce(nextData);
								}else{
									window.idunitskpd = current_data.id_skpd;
									get_renja_lokal(true)
									.then(function(){
										resolve_reduce(nextData);
									});
								}
							});
						}else if(tipe_task == 'kunci-kegiatan'){
							update_kunci_belanja_unit(current_data, 1)
							.then(function(){
								resolve_reduce(nextData);
							});
						}else if(tipe_task == 'buka-kegiatan'){
							update_kunci_belanja_unit(current_data, 0)
							.then(function(){
								resolve_reduce(nextData);
							});
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
	        .then(function(data_last){
				run_script('hide_modal');
	        	alert('Berhasil proses data!');
				hide_loading();
	        });
		}		
	}else{
		alert('Pilih data dulu!');
	}
}

function update_kunci_tambah_giat(units, kunci_tambah_giat) {
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/setup_unit/update_kunci_tambah_giat_unit',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				kunci_tambah_giat: kunci_tambah_giat,
				id_unit: units.id_skpd,
				id_user_log: _token.user_id,
				id_daerah_log: _token.daerah_id
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(html){
				return resolve();
			}
		});
	})
}

function update_kunci_belanja_unit(units, kunci_bl) {
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/update_kunci_belanja_unit',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				kunci_bl: kunci_bl,
				id_unit: units.id_skpd,
				id_user_log: _token.user_id,
				id_daerah_log: _token.daerah_id
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(html){
				return resolve();
			}
		});
	})
}

function get_setup_unit(units) {
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/setup_unit/find_by_id_unit',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,				
				id_unit: units.id_skpd
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res);
			}
		});
	})
}

function get_label_kokab(id_label_kokab){
    return new Promise(function(resolve, reject){
		relayAjax({	      				
			url: config.sipd_url+'api/master/label_kokab/view/'+id_label_kokab+'/'+_token.tahun+'/'+_token.daerah_id,			
			type: 'GET',	      				
			processData: false,
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},	
	      	success: function(label_kokab){
	      		return resolve(label_kokab);
	      	}
	    });
    });
}

function get_label_prov(id_label_prov){
	getuserbytoken().then(function(getuserbytoken){
		return new Promise(function(resolve, reject){
			relayAjax({	      				
				url: config.sipd_url+'api/master/label_prov/view/'+id_label_prov+'/'+_token.tahun+'/'+getuserbytoken.id_prop,			
				type: 'GET',	      				
				processData: false,
				contentType : 'application/json',
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
				success: function(label_prov){
					return resolve(label_prov);
				}
			});
		});
	});
}

function get_label_pusat(id_label_pusat){
	getuserbytoken().then(function(getuserbytoken){
		return new Promise(function(resolve, reject){
			relayAjax({	      				
				url: config.sipd_url+'api/master/label_pusat/view/'+id_label_pusat+'/'+_token.tahun+'/'+getuserbytoken.id_prop,			
				type: 'GET',	      				
				processData: false,
				contentType : 'application/json',
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
				success: function(label_pusat){
					return resolve(label_pusat);
				}
			});
		});
	});
}

function getuserbytoken(){    
    return new Promise(function(resolve, reject){ 		
		relayAjax({
			url: config.sipd_url+'api/master/user/getuserbytoken',                                    
			type: 'GET',
			cache: true,
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("authorization", "Bearer "+_token.token+'|'+_token.daerah_id+'|'+_token.user_id);
			    xhr.setRequestHeader("x-api-key", x_api_key());
			    xhr.setRequestHeader("accept", 'application/json, text/plain, */*');
			},
	      	success: function(getuserbytoken){
	      		return resolve(getuserbytoken);
	      	}
	    });
    });
}

function get_rinci_sub_bl(idunit, id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/rinci_sub_bl/get_by_id_sub_bl',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_sub_bl: id_sub_bl,
				id_unit: idunit
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(rinci_sub_bl){
	      		return resolve(rinci_sub_bl);
	      	}
	    });
    });
}

function get_ket_sub_bl(id_ket_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/ket_sub_bl/find_by_id_list',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					tahun: _token.tahun,
					__id_ket_sub_bl_list: [id_ket_sub_bl]
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ket_sub_bl){
	      		return resolve(ket_sub_bl);
	      	}
	    });
    });
}

function get_subs_sub_bl(id_subs_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/subs_sub_bl/find_by_id_list',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					tahun: _token.tahun,
					__id_subs_sub_bl_list: [id_subs_sub_bl]
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(subs_sub_bl){
	      		return resolve(subs_sub_bl);
	      	}
	    });
    });
}
