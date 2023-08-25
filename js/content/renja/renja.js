function list_skpd_sub_bl(offset=0){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/list_skpd',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
				id_user: _token.user_id,
				id_unit: 0,
				id_level: _token.level_id,
				limit: 100,
				offset: offset,
				is_anggaran: global_is_anggaran
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(units){
				var data_all = { data: [] };
				units.data = decrip(units.data);
				var last = units.data.length-1;
				units.data.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
							data_all.data.push(current_data);
							return resolve_reduce(nextData);
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
					if(
						units.recordsTotal > (data_all.data.length + (100*offset))
					){
						offset += 100;
						list_skpd_sub_bl(offset).then(function(data){
							data.data.map(function(b, i){
								data_all.data.push(b);
							})
							return resolve(data_all);
						});
					}else{
						return resolve(data_all);
					}
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
							if(unit.data.length == 0){
								return resolve_reduce(nextData);
							}
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

function get_renja_lokal(no_popup=false, hapus_sub_keg=false, id_jadwal=''){
	return new Promise(function(resolve, reject){
		window.global_resolve_get_renja_lokal = resolve;
		show_loading();
		pesan_loading('Get data RENJA dari WP-SIPD');
		var _run = 'open_modal_renja';
		if(hapus_sub_keg){
			_run = 'proses_hapus_modal_renja';
		}else if(no_popup){
			_run = 'proses_modal_renja';
		}else{
			id_jadwal = prompt('Masukan ID jadwal! Isikan kata "terbaru" jika ingin menarik data dari jadwal terbuka. Biarkan kosong jika ingin menarik data dari jadwal terkunci yang terakhir.');
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
						api_key: config.api_key,
						id_jadwal: id_jadwal
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
		list_belanja_by_tahun_daerah_unit(idunitskpd)
		.then(function(sub_keg_exist){
			window.rka_sipd = {};
			sub_keg_exist.data = decrip(sub_keg_exist.data);
			sub_keg_exist.data.map(function(b, i){
				rka_sipd[b.kode_sub_skpd+' '+b.kode_sub_giat+' '+removeNewlines(b.nama_sub_giat)] = b;
			});

			var result = {
				tidak_ada_di_sipd: [],
				tidak_ada_di_lokal: []
			}

			var rka_lokal = {};
			var body = '';
			res.data.map(function(b, i){
				var keyword = b.kode_sbl;
				rka_all[keyword] = b;

				var nama_sub = b.nama_sub_giat.split(' ');
				var kode_sub = nama_sub.shift();
				kode_sub = kode_sub.replace('X.XX', b.kode_bidang_urusan);
				nama_sub = nama_sub.join(' ');

				rka_lokal[b.kode_sub_skpd+' '+kode_sub+' '+removeNewlines(nama_sub)] = b;
				var existing = "";
				if(rka_sipd[b.kode_sub_skpd+' '+kode_sub+' '+removeNewlines(nama_sub)]){
					existing = " <b>Existing</b>";
				}else{
					result.tidak_ada_di_sipd.push(b);
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

			// menampilkan sub keg yang ada di sipd dan tidak ada dilokal wp-sipd
			for(var nama_sub in rka_sipd){
				var b = rka_sipd[nama_sub];
				if(!rka_lokal[nama_sub]){
					result.tidak_ada_di_lokal.push(b);
					body += ''
					+'<tr>'								
						+'<td class="text-center tidak-ada-dilokal" nama_sub="'+nama_sub+'"><span style="color: red; font-weight: bold;">Tidak ada di lokal</span></td>'
						+'<td>'+b.kode_sub_skpd+' - '+b.nama_sub_skpd+'</td>'
						+'<td>'+b.kode_program+' '+b.nama_program+'</td>'
						+'<td>'+b.kode_giat+' '+b.nama_giat+'</td>'
						+'<td>'+b.kode_sub_giat+' '+b.nama_sub_giat+'</td>'
						+'<td>'+formatMoney(b.pagu)+'</td>'
					+'</tr>';
				}
			}
			console.log('Cek selisih data sub kegiatan!', result);

			jQuery('#table-extension-renja-lokal tbody').html(body);
			run_script('show_modal', {
				id: 'modal-extension-renja-lokal'
			});
			hide_loading();
			global_resolve_get_renja_lokal();
		});
	}else{
		proses_modal_renja(res.data)
		.then(function(){
			global_resolve_get_renja_lokal();
		});
	}
}

function proses_hapus_modal_renja(res) {
	if(res.status == 'error'){
		hide_loading();
		return alert(res.message);
	}
	list_belanja_by_tahun_daerah_unit(idunitskpd)
	.then(function(sub_keg_exist){
		sub_keg_exist.data = decrip(sub_keg_exist.data);
		window.rka_sipd = {};
		sub_keg_exist.data.map(function(b, i){
			rka_sipd[b.kode_sub_skpd+' '+b.kode_sub_giat+' '+removeNewlines(b.nama_sub_giat)] = b;
		});
		var rka_lokal = {};
		res.data.map(function(b, i){
			var nama_sub = b.nama_sub_giat.split(' ');
			var kode_sub = nama_sub.shift();
			kode_sub = kode_sub.replace('X.XX', b.kode_bidang_urusan);
			nama_sub = nama_sub.join(' ');
			rka_lokal[b.kode_sub_skpd+' '+kode_sub+' '+removeNewlines(nama_sub)] = b;
		});

		var data_selected = [];
		for(var nama_sub in rka_sipd){
			var b = rka_sipd[nama_sub];
			if(!rka_lokal[nama_sub]){
				data_selected.push(rka_sipd[nama_sub]);
			}
		}
		hapus_modal_renja(data_selected)
		.then(function(){
			global_resolve_get_renja_lokal();
		});
	});
}

function hapus_modal_renja(data_selected_asli = false) {
	return new Promise(function(resolve, reject){
		var data_selected = [];
		if(data_selected_asli){
			data_selected = data_selected_asli;
		}else{
			jQuery('#table-extension-renja-lokal tbody tr .tidak-ada-dilokal').map(function(i, b){
				var nama_sub = jQuery(b).attr('nama_sub');
				data_selected.push(rka_sipd[nama_sub]);
			});
		}
		if(data_selected.length >= 1){
			if(
				data_selected_asli 
				|| confirm('Apakah anda yakin melakukan ini? sub kegiatan yang tidak ada di lokal akan dihapus.')
			){
				show_loading();
				console.log('data_selected', data_selected);
				var last = data_selected.length-1;
				data_selected.reduce(function(sequence, nextData){
					return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){
							var options_sub = {
								id_unit: current_data.id_unit,
								id_skpd: current_data.id_skpd,
								id_sub_skpd: current_data.id_sub_skpd,
								id_urusan: current_data.id_urusan,
								id_bidang_urusan: current_data.id_bidang_urusan,
								id_program: current_data.id_program,
								id_giat: current_data.id_giat,
								id_sub_giat: current_data.id_sub_giat,
								pagu: current_data.pagu,
								pagu_n_depan: current_data.pagu_n_depan,
								nama_sub_giat: current_data.nama_sub_giat,
								id_lokasi: _token.daerah_id,
								waktu_awal: current_data.waktu_awal,
								waktu_akhir: current_data.waktu_akhir,
								nama_daerah: _token.daerah_nama,
								nama_unit: current_data.nama_unit,
								nama_skpd: current_data.nama_skpd,
								nama_sub_skpd: current_data.nama_sub_skpd,
								nama_bidang_urusan: '',
								kode_sub_giat: current_data.kode_sub_giat,
								id_daerah_log: _token.daerah_id,
								id_user_log: _token.user_id,
								id_daerah: _token.daerah_id,
								tahun: _token.tahun,
								level_id: _token.level_id,
								created_user: _token.user_id
							};
							options_sub.created_user = current_data.created_user;
							options_sub.set_pagu_user = current_data.set_pagu_user;
							options_sub.pagu_giat = current_data.pagu_giat;
							options_sub.rincian = current_data.rincian;
							options_sub.rinci_giat = current_data.rinci_giat;
							options_sub.kode_bl = current_data.kode_bl;
							options_sub.kode_sbl = current_data.kode_sbl;
							options_sub.id_sub_bl = current_data.id_sub_bl;
							options_sub.created_date = current_data.created_date;
							options_sub.created_time = current_data.created_time;
							options_sub.updated_date = current_data.updated_date;
							options_sub.updated_time = current_data.updated_time;
							options_sub.user_created = current_data.user_created;
							options_sub.user_updated = current_data.user_updated;
							options_sub.nama_urusan = current_data.nama_urusan;
							options_sub.nama_bidang_urusan = current_data.nama_bidang_urusan;
							options_sub.nama_program = current_data.nama_program;
							options_sub.nama_giat = current_data.nama_giat;
							options_sub.nama_sub_giat = current_data.nama_sub_giat;
							options_sub.kode_skpd = current_data.kode_skpd;
							options_sub.kode_sub_skpd = current_data.kode_sub_skpd;
							options_sub.kode_urusan = current_data.kode_urusan;
							options_sub.kode_bidang_urusan = current_data.kode_bidang_urusan;
							options_sub.kode_program = current_data.kode_program;
							options_sub.kode_giat = current_data.kode_giat;
							options_sub.token = token_sub_keg(options_sub);

							// jika mau hapus sub kegiatan
							options_sub.aktivitas = 'delete';
							update_sub_bl(options_sub)
							.then(function(){
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
				}, Promise.resolve(data_selected[last]))
				.then(function(data_last){
					if(!data_selected_asli){
						run_script('hide_modal', {
							id: 'modal-extension-renja-lokal'
						});
						hide_loading();
						alert('Data berhasil dihapus! Refresh halaman ini untuk melihat hasilnya.');
					}
					return resolve();
				})
				.catch(function(e){
					console.log(e);
				});
			}else{
				return resolve();
			}
		}else{
			if(!data_selected_asli){
				alert('Data sub kegiatan yang tidak ada di lokal tidak ditemukan!');
			}else{
				console.log('Data sub kegiatan yang tidak ada di lokal untuk skpd ini tidak ditemukan!');
			}
			return resolve();
		}
	});
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
		        		find_by_tahun_daerah_unit(idunitskpd)
		        		.then(function(data_sub_skpd){
		        			var master_skpd = {};
		        			data_sub_skpd.data.map(function(b, i){
		        				master_skpd[b.kode_skpd] = b;
		        			});
			        		find_sub_giat({
			        			id_sub_skpd: data_skpd.data[0].id_skpd,
			        			nama_sub_skpd: data_skpd.data[0].nama_skpd,
								search: ''
			        		})
			        		.then(function(master_sub_keg_sipd){
								var master_sub_keg = {};
								master_sub_keg_sipd.map(function(b, i){
									master_sub_keg[b.kode_sub_giat+' '+removeNewlines(b.nama_sub_giat)] = b;
								});
								new Promise(function(resolve2, reject2){
									list_belanja_by_tahun_daerah_unit(idunitskpd)
									.then(function(sub_keg_exist){
										sub_keg_exist.data = decrip(sub_keg_exist.data);
										var rka_sipd = {};
										sub_keg_exist.data.map(function(b, i){
											rka_sipd[b.kode_sub_skpd+' '+b.kode_sub_giat+' '+removeNewlines(b.nama_sub_giat)] = b;
										});

										var last = data_selected.length-1;
										data_selected.reduce(function(sequence, nextData){
											return sequence.then(function(current_data){
												return new Promise(function(resolve_reduce, reject_reduce){
													var nama_sub_asli = current_data.nama_sub_giat.split(' ');
													var kode_sub_asli = nama_sub_asli.shift();
													var kode_sub = kode_sub_asli.replace('X.XX', current_data.kode_bidang_urusan);
													var nama_sub = kode_sub+' '+removeNewlines(nama_sub_asli.join(' '));
													nama_sub_asli = kode_sub_asli+' '+removeNewlines(nama_sub_asli.join(' '));
													var pemutakhiran = false;
													var existing = false;
													if(rka_sipd[current_data.kode_sub_skpd+' '+nama_sub]){
														existing = rka_sipd[current_data.kode_sub_skpd+' '+nama_sub];
													}
													if(current_data.kode_sbl_lama && current_data.sub_keg_lama){
														current_data.sub_keg_lama.map(function(b, i){
															var nama_sub_asli2 = b.nama_sub_giat.split(' ');
															var kode_sub_asli2 = nama_sub_asli2.shift();
															var kode_sub2 = kode_sub_asli2.replace('X.XX', b.kode_bidang_urusan);
															var nama_sub2 = kode_sub2+' '+removeNewlines(nama_sub_asli2.join(' '));
															nama_sub_asli2 = kode_sub_asli2+' '+removeNewlines(nama_sub_asli2.join(' '));
															if(rka_sipd[current_data.kode_sub_skpd+' '+nama_sub2]){
																existing = rka_sipd[current_data.kode_sub_skpd+' '+nama_sub2];
																pemutakhiran = b;
																pesan_loading('Pemutakhiran sub kegiatan SIPD dari "'+nama_sub_asli2+'" ke "'+nama_sub_asli+'"');
															}
														});
													}
													if(!master_sub_keg[nama_sub_asli]){
														pesan_loading('Sub kegiatan tidak ditemukan di master SIPD. "'+nama_sub_asli+'"');
														return resolve_reduce(nextData);
													}
													if(!master_skpd[current_data.kode_sub_skpd]){
														pesan_loading('SKPD tidak ditemukan di master SIPD. "'+current_data.kode_sub_skpd+' '+current_data.nama_skpd+'"');
														return resolve_reduce(nextData);
													}

													var options_sub = {
														id_unit: master_skpd[current_data.kode_sub_skpd].id_unit,
														id_skpd: master_skpd[current_data.kode_sub_skpd].id_unit,
														id_sub_skpd: master_skpd[current_data.kode_sub_skpd].id_skpd,
														id_urusan: master_sub_keg[nama_sub_asli].id_urusan,
														id_bidang_urusan: master_sub_keg[nama_sub_asli].id_bidang_urusan,
														id_program: master_sub_keg[nama_sub_asli].id_program,
														id_giat: master_sub_keg[nama_sub_asli].id_giat,
														id_sub_giat: master_sub_keg[nama_sub_asli].id_sub_giat,
														pagu: current_data.pagu,
														pagu_n_depan: current_data.pagu_n_depan,
														nama_sub_giat: current_data.nama_sub_giat,
														id_lokasi: _token.daerah_id,
														waktu_awal: current_data.waktu_awal,
														waktu_akhir: current_data.waktu_akhir,
														nama_daerah: _token.daerah_nama,
														nama_unit: master_skpd[current_data.kode_sub_skpd].nama_skpd,
														nama_skpd: master_skpd[current_data.kode_sub_skpd].nama_skpd,
														nama_sub_skpd: master_skpd[current_data.kode_sub_skpd].nama_skpd,
														nama_bidang_urusan: '',
														kode_sub_giat: master_sub_keg[nama_sub_asli].kode_sub_giat,
														id_daerah_log: _token.daerah_id,
														id_user_log: _token.user_id,
														id_daerah: _token.daerah_id,
														tahun: _token.tahun,
														level_id: _token.level_id,
														created_user: _token.user_id
													};

													// update baru dari sipd-ri 23-05-2023
													options_sub.token = token_sub_keg(options_sub);
													console.log('current_data', options_sub, current_data);

													if(master_sub_keg[nama_sub_asli].kode_sub_giat.indexOf('X.XX.') != -1){
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
														id_camat: 0,
														id_lurah: 0,
														id_daerah_log: options_sub.id_daerah_log,
														id_user_log: options_sub.id_user_log
													};
													if(current_data.lokasi.length >= 1){
														if(current_data.lokasi[0].idcamat){
															options_lokasi.id_camat = current_data.lokasi[0].idcamat;
															if(current_data.lokasi[0].idlurah){
																options_lokasi.id_lurah = current_data.lokasi[0].idlurah;
															}
														}
													}

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
														tolak_ukur: master_sub_keg[nama_sub_asli].indikator,
														target: targetoutput,
														satuan: master_sub_keg[nama_sub_asli].satuan,
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
														options_sub.created_user = existing.created_user;
														options_sub.set_pagu_user = existing.set_pagu_user;
														options_sub.pagu_giat = existing.pagu_giat;
														options_sub.rincian = existing.rincian;
														options_sub.rinci_giat = existing.rinci_giat;
														options_sub.kode_bl = existing.kode_bl;
														options_sub.kode_sbl = existing.kode_sbl;
														options_sub.id_sub_bl = existing.id_sub_bl;
														options_sub.created_date = existing.created_date;
														options_sub.created_time = existing.created_time;
														options_sub.updated_date = existing.updated_date;
														options_sub.updated_time = existing.updated_time;
														options_sub.user_created = existing.user_created;
														options_sub.user_updated = existing.user_updated;
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
											return resolve2();
										})
										.catch(function(e){
											console.log(e);
										});	
									});
								})
								.then(function(){
									// proses simpan indikator kegiatan
									list_belanja_by_tahun_daerah_unit(idunitskpd)
									.then(function(sub_keg_exist){
										var kegiatan_sipd = {};
										sub_keg_exist.data = decrip(sub_keg_exist.data);
										sub_keg_exist.data.map(function(b, i){
											b.exist = false;
											kegiatan_sipd[b.kode_sub_skpd+' '+b.kode_giat+' '+removeNewlines(b.nama_giat)] = b;
										});
										var last = data_selected.length-1;
										data_selected.reduce(function(sequence, nextData){
											return sequence.then(function(current_data){
												return new Promise(function(resolve_reduce, reject_reduce){
													var nama_giat_asli = current_data.nama_giat.split(' ');
													var kode_giat_asli = nama_giat_asli.shift();
													var kode_giat = kode_giat_asli.replace('X.XX', current_data.kode_bidang_urusan);
													var nama_giat = kode_giat+' '+removeNewlines(nama_giat_asli.join(' '));
													nama_giat_asli = kode_giat_asli+' '+removeNewlines(nama_giat_asli.join(' '));
													if(kegiatan_sipd[current_data.kode_sub_skpd+' '+nama_giat]){
														var giat = kegiatan_sipd[current_data.kode_sub_skpd+' '+nama_giat];
														if(!giat.exist){
															console.log('Simpan indikator kegiatan!', current_data);
															giat.exist = true;
															var opsi_indikator_program = [];
															var kode_rpjm = 'M-'+giat.id_skpd+'-'+giat.id_program+'-'+giat.id_giat;
															var kode_renstra = 'M-R-'+giat.id_skpd+'-'+giat.id_program+'-'+giat.id_giat;
															current_data.indikator_program.map(function(b, i){
																opsi_indikator_program.push({
																	indikator_program_list: '',
																	tahun: giat.tahun,
																	id_daerah: giat.id_daerah,
																	id_unit: giat.id_unit,
																	id_skpd: giat.id_skpd,
																	id_sub_skpd: giat.id_sub_skpd,
																	id_program: giat.id_program,
																	id_giat: giat.id_giat,
																	tolak_ukur: b.capaianteks,
																	target: b.targetcapaian,
																	satuan: b.satuancapaian,
																	target_teks: b.targetcapaianteks,
																	kode_rpjm: kode_rpjm,
																	id_daerah_log: giat.id_daerah,
																	id_user_log: _token.user_id
																});
															});
															var opsi_indikator_giat = [];
															current_data.indikator_kegiatan.map(function(b, i){
																opsi_indikator_giat.push({
																	indikator_kegiatan_list: '',
																	tahun: giat.tahun,
																	id_daerah: giat.id_daerah,
																	id_unit: giat.id_unit,
																	id_skpd: giat.id_skpd,
																	id_sub_skpd: giat.id_sub_skpd,
																	id_program: giat.id_program,
																	id_giat: giat.id_giat,
																	tolak_ukur: b.outputteks,
																	target: b.targetoutput,
																	satuan: b.satuanoutput,
																	target_teks: b.targetoutputteks,
																	kode_rpjm: kode_rpjm,
																	kode_renstra: kode_renstra,
																	id_daerah_log: giat.id_daerah,
																	id_user_log: _token.user_id
																});
															});
															var opsi_kelompok_sasaran = {
																tahun: giat.tahun,
																id_daerah: giat.id_daerah,
																id_unit: giat.id_unit,
																id_skpd: giat.id_skpd,
																id_sub_skpd: giat.id_sub_skpd,
																id_bl: 0,
																id_urusan: giat.id_urusan,
																id_bidang_urusan: giat.id_bidang_urusan,
																id_program: giat.id_program,
																id_giat: giat.id_giat,
																sasaran: current_data.sasaran,
																id_daerah_log: giat.id_daerah,
																id_user_log: _token.user_id
															};
															var opsi_indikator_hasil = [];
															current_data.indikator_hasil.map(function(b, i){
																opsi_indikator_hasil.push({
																	tahun: giat.tahun,
																	id_daerah: giat.id_daerah,
																	id_unit: giat.id_unit,
																	id_skpd: giat.id_skpd,
																	id_sub_skpd: giat.id_sub_skpd,
																	id_bl: 0,
																	id_urusan: giat.id_urusan,
																	id_bidang_urusan: giat.id_bidang_urusan,
																	id_program: giat.id_program,
																	id_giat: giat.id_giat,
																	tolak_ukur: b.hasilteks,
																	target: b.targethasil,
																	satuan: b.satuanhasil,
																	target_teks: b.targethasilteks,
																	created_user: _token.user_id,
																	id_daerah_log: giat.id_daerah,
																	id_user_log: _token.user_id
																});
															});
															new Promise(function(resolve2, reject2){
																capaian_bl(giat.id_unit, giat.id_skpd, giat.id_sub_skpd, giat.id_program, giat.id_giat)
																.then(function(capaian_ret){
																	var opsi_indikator_program_insert = [];
																	var opsi_indikator_program_update = [];
																	var indikator_program_list = [];
																	var indikator_program_unik = {};
																	var indikator_program_unik_sipd = {};
																	capaian_ret.data.map(function(b, i){
																		var key_unik = b.tolak_ukur+b.target_teks;
																		if(!indikator_program_unik_sipd[key_unik]){
																			indikator_program_unik_sipd[key_unik] = b;
																		}else{
																			return;
																		}
																	});
																	opsi_indikator_program.map(function(b, i){

																		// agar tidak double indikator
																		var key_unik = b.tolak_ukur+b.target_teks;
																		if(!indikator_program_unik[key_unik]){
																			indikator_program_unik[key_unik] = true;
																		}else{
																			return;
																		}

																		if(capaian_ret.data[i]){
																			if(
																				indikator_program_unik_sipd[key_unik]
																				&& !indikator_program_unik_sipd[key_unik].exist
																			){
																				b.id_capaian_bl = indikator_program_unik_sipd[key_unik].id_capaian_bl;
																				indikator_program_unik_sipd[key_unik].exist = true;
																			}else{
																				var id_capaian_bl = false;
																				for(var bb in indikator_program_unik_sipd){
																					if(
																						!indikator_program_unik_sipd[bb].exist
																						&& false == id_capaian_bl
																					){
																						id_capaian_bl = indikator_program_unik_sipd[bb].id_capaian_bl;
																						indikator_program_unik_sipd[bb].exist = true;
																					}
																				}
																				b.id_capaian_bl = id_capaian_bl;
																			}
																			indikator_program_list.push(b.id_capaian_bl);
																			opsi_indikator_program_update.push(b);
																		}else{
																			opsi_indikator_program_insert.push(b);
																		}
																	});
																	opsi_indikator_program_update.map(function(b, i){
																		opsi_indikator_program_update[i].indikator_program_list = indikator_program_list.join(',');
																	});
																	opsi_indikator_program_insert.map(function(b, i){
																		opsi_indikator_program_insert[i].indikator_program_list = indikator_program_list.join(',');
																	});
																	update_capaian_bl(opsi_indikator_program_update)
																	.then(function(){
																		simpan_capaian_bl(opsi_indikator_program_insert)
																		.then(function(){
																			return resolve2();
																		});
																	});
																});
															})
															.then(function(){
																return new Promise(function(resolve2, reject2){
																	output_giat(giat)
																	.then(function(output_ret){
																		var opsi_indikator_giat_insert = [];
																		var opsi_indikator_giat_update = [];
																		var indikator_giat_list = [];
																		var indikator_giat_unik = {};
																		var indikator_giat_unik_sipd = {};
																		output_ret.data.map(function(b, i){
																			var key_unik = b.tolok_ukur+b.target_teks;
																			if(!indikator_giat_unik_sipd[key_unik]){
																				indikator_giat_unik_sipd[key_unik] = b;
																			}else{
																				return;
																			}
																		});
																		opsi_indikator_giat.map(function(b, i){

																			// agar tidak double indikator
																			var key_unik = b.tolak_ukur+b.target_teks;
																			if(!indikator_giat_unik[key_unik]){
																				indikator_giat_unik[key_unik] = true;
																			}else{
																				return;
																			}

																			if(output_ret.data[i]){
																				if(
																					indikator_giat_unik_sipd[key_unik]
																					&& !indikator_giat_unik_sipd[key_unik].exist
																				){
																					b.id_output_giat = indikator_giat_unik_sipd[key_unik].id_output_giat;
																					indikator_giat_unik_sipd[key_unik].exist = true;
																				}else{
																					var id_output_giat = false;
																					for(var bb in indikator_giat_unik_sipd){
																						if(
																							!indikator_giat_unik_sipd[bb].exist
																							&& false == id_output_giat
																						){
																							id_output_giat = indikator_giat_unik_sipd[bb].id_output_giat;
																							indikator_giat_unik_sipd[bb].exist = true;
																						}
																					}
																					b.id_output_giat = id_output_giat;
																				}
																				indikator_giat_list.push(b.id_output_giat);
																				opsi_indikator_giat_update.push(b);
																			}else{
																				opsi_indikator_giat_insert.push(b);
																			}
																		});
																		opsi_indikator_giat_update.map(function(b, i){
																			opsi_indikator_giat_update[i].indikator_kegiatan_list = indikator_giat_list.join(',');
																		});
																		opsi_indikator_giat_insert.map(function(b, i){
																			opsi_indikator_giat_insert[i].indikator_kegiatan_list = indikator_giat_list.join(',');
																		});
																		update_output_giat(opsi_indikator_giat_update)
																		.then(function(){
																			simpan_output_giat(opsi_indikator_giat_insert)
																			.then(function(){
																				return resolve2();
																			});
																		});
																	});
																});
															})
															.then(function(){
																return new Promise(function(resolve2, reject2){
																	sasaran_giat(giat)
																	.then(function(sasaran){
																		if(sasaran.data && sasaran.data.id_bl){
																			opsi_kelompok_sasaran.id_bl = sasaran.data.id_bl;
																		}
																		simpan_kelompok_sasaran(opsi_kelompok_sasaran)
																		.then(function(){
																			return resolve2(opsi_kelompok_sasaran.id_bl);
																		});
																	});
																})
															})
															.then(function(id_bl){
																return new Promise(function(resolve2, reject2){
																	get_hasil(giat)
																	.then(function(output_hasil){
																		var opsi_indikator_hasil_insert = [];
																		var opsi_indikator_hasil_update = [];
																		var indikator_hasil_list = [];
																		var indikator_hasil_unik = {};
																		var indikator_hasil_unik_sipd = {};
																		if(output_hasil){
																			output_hasil.data.map(function(b, i){
																				var key_unik = b.tolak_ukur+b.target_teks;
																				if(!indikator_hasil_unik_sipd[key_unik]){
																					indikator_hasil_unik_sipd[key_unik] = b;
																				}else{
																					return;
																				}
																			});
																		}
																		opsi_indikator_hasil.map(function(b, i){

																			// agar tidak double indikator
																			var key_unik = b.tolak_ukur+b.target_teks;
																			if(!indikator_hasil_unik[key_unik]){
																				indikator_hasil_unik[key_unik] = true;
																			}else{
																				return;
																			}

																			if(
																				output_hasil 
																				&& output_hasil.data[i]
																			){
																				if(
																					indikator_hasil_unik_sipd[key_unik]
																					&& !indikator_hasil_unik_sipd[key_unik].exist
																				){
																					b.id_hasil_bl = indikator_hasil_unik_sipd[key_unik].id_hasil_bl;
																					indikator_hasil_unik_sipd[key_unik].exist = true;
																				}else{
																					var id_hasil_bl = false;
																					for(var bb in indikator_hasil_unik_sipd){
																						if(
																							!indikator_hasil_unik_sipd[bb].exist
																							&& false == id_hasil_bl
																						){
																							id_hasil_bl = indikator_hasil_unik_sipd[bb].id_hasil_bl;
																							indikator_hasil_unik_sipd[bb].exist = true;
																						}
																					}
																					b.id_hasil_bl = id_hasil_bl;
																				}
																				indikator_hasil_list.push(b.id_hasil_bl);
																				opsi_indikator_hasil_update.push(b);
																			}else{
																				opsi_indikator_hasil_insert.push(b);
																			}
																		});
																		update_hasil(opsi_indikator_hasil_update, id_bl)
																		.then(function(){
																			// dihapus insertnya karena indikator hasil hanya 1
																			if(opsi_indikator_hasil_update.length >= 1){
																				opsi_indikator_hasil_insert = [];
																			}
																			simpan_hasil(opsi_indikator_hasil_insert, id_bl)
																			.then(function(){
																				return resolve2(id_bl);
																			});
																		});
																	});
																})
															})
															.then(function(id_bl){
																get_label_pusat(giat.id_skpd)
																.then(function(label_pusat){
																	var id_label_pusat = 0;
																	label_pusat.data.map(function(b, i){
																		if(
																			current_data.label_pusat != null
																			&& removeNewlines(b.nama_label) == removeNewlines(current_data.label_pusat)
																		){
																			id_label_pusat = b.id_label_pusat;
																		}
																	});
																	label_bl(giat.id_sub_bl)
																	.then(function(label_bl){
																		var id_label_bl = 0;
																		if(label_bl.data.length >= 1){
																			id_label_bl = label_bl.data[0].id_label_bl;
																		}
																		var opsi_label_pusat = {
																			tahun: giat.tahun,
																			id_daerah: giat.id_daerah,
																			id_unit: giat.id_unit,
																			id_skpd: giat.id_skpd,
																			id_sub_skpd: giat.id_sub_skpd,
																			id_urusan: giat.id_urusan,
																			id_bidang_urusan: giat.id_bidang_urusan,
																			id_program: giat.id_program,
																			id_giat: giat.id_giat,
																			id_bl: id_bl,
																			id_sub_giat: giat.id_sub_giat,
																			id_label_pusat: id_label_pusat,
																			id_label_bl: id_label_bl,
																			id_daerah_log: giat.id_daerah,
																			id_user_log: _token.user_id
																		};
																		simpan_label_pusat(opsi_label_pusat)
																		.then(function(){
																			return resolve_reduce(nextData);
																		});
																	});
																});
															});
														}else{
															return resolve_reduce(nextData);
														}
													}else{
														console.log('Kegiatan tidak ditemukan!', current_data);
														return resolve_reduce(nextData);
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
								});
			        		});
		        		});
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
				token: opsi.token,
				level_id: opsi.level_id,
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
				id_camat: opsi.id_camat,
				id_lurah: opsi.id_lurah,
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
				if(
					opsi.pagu_dana == null
					|| opsi.pagu_dana == ''
				){
					opsi.pagu_dana = 0;
				}
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
	if(opsi.aktivitas == 'delete'){
		pesan_loading("Hapus Sub Kegiatan '"+opsi.nama_sub_giat+"' OPD "+opsi.nama_sub_skpd);
	}else{
		pesan_loading("Update Sub Kegiatan '"+opsi.nama_sub_giat+"' OPD "+opsi.nama_sub_skpd);
	}
	return new Promise(function(resolve, reject){
		sub_bl_view(opsi.id_sub_bl)
		.then(function(data_exist){
			var promise_all = data_exist.data.map(function(data, i){
				return new Promise(function(resolve2, reject2){
					opsi.id_bidang_urusan_pusat = data.id_bidang_urusan_pusat;
					opsi.id_unik = data.id_unik;
					opsi.updated_user = _token.user_id;
					var opsi_data = {
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
						token: opsi.token,
						level_id: opsi.level_id,
						updated_user: opsi.updated_user
					};

					// untuk hapus data sub kegiatan
					if(opsi.aktivitas == 'delete'){
						opsi_data.created_user = opsi.created_user;
						opsi_data.set_pagu_user = opsi.set_pagu_user;
						opsi_data.pagu_giat = opsi.pagu_giat;
						opsi_data.rincian = opsi.rincianl;
						opsi_data.rinci_giat = opsi.rinci_giatl;
						opsi_data.kode_bl = opsi.kode_bl;
						opsi_data.kode_sbl = opsi.kode_sbl;
						opsi_data.kunci_bl = 3;
						opsi_data.kunci_bl_rinci = 0;
						opsi_data.user_created = opsi.user_created;
						opsi_data.created_date = opsi.created_date;
						opsi_data.created_time = opsi.created_time;
						opsi_data.user_updated = opsi.user_updated;
						opsi_data.updated_date = opsi.updated_date;
						opsi_data.updated_time = opsi.updated_time;
						opsi_data.aktivitas = opsi.aktivitas;
					}
					relayAjax({
						url: config.sipd_url+'api/renja/sub_bl/update',
						type: 'POST',
						data: opsi_data,
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
							id_camat: opsi.id_camat,
							id_lurah: opsi.id_lurah,
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
				options_dana[b.kodedana] = {};
				for(var n in opsi){
					options_dana[b.kodedana][n] = opsi[n];
				}
				options_dana[b.kodedana].id_dana = global_all_sumber_dana_obj[b.kodedana].id_dana;
				options_dana[b.kodedana].nama_dana = global_all_sumber_dana_obj[b.kodedana].nama_dana;
				options_dana[b.kodedana].kode_dana = global_all_sumber_dana_obj[b.kodedana].kode_dana;
				options_dana[b.kodedana].pagu_dana = b.pagudana;
			});
			var promise_all = data_exist.data.map(function(data, i){
				let no = i;
				return new Promise(function(resolve2, reject2){
					if(!options_dana[data.kode_dana]){
						var opsi_dana = {
							id_dana_sub_bl: data.id_dana_sub_bl,
							id_unit: data.id_unit,
							id_dana: data.id_dana,
							kode_dana: data.kode_dana,
							nama_dana: global_all_sumber_dana_obj[data.kode_dana].nama_dana,
							id_sub_bl: opsi.id_sub_bl
						};
						return hapus_sumber_dana(opsi_dana)
						.then(function(){
							return resolve2();
						})
					}
					pesan_loading('Update sumber dana kode='+data.kode_dana);
					options_dana[data.kode_dana].singkron = 1;
					if(
						options_dana[data.kode_dana].pagu_dana == null
						|| options_dana[data.kode_dana].pagu_dana == ''
					){
						options_dana[data.kode_dana].pagu_dana = 0;
					}
					relayAjax({
						url: config.sipd_url+'api/renja/dana_sub_bl/update',
						type: 'POST',
						data: {
							id_dana_sub_bl: data.id_dana_sub_bl,
							tahun: options_dana[data.kode_dana].tahun,
							id_daerah: options_dana[data.kode_dana].id_daerah,
							id_unit: 0,
							id_bl: 0,
							id_sub_bl: options_dana[data.kode_dana].id_sub_bl,
							id_dana: options_dana[data.kode_dana].id_dana,
							nama_dana: options_dana[data.kode_dana].nama_dana,
							kode_dana: options_dana[data.kode_dana].kode_dana,
							id_skpd: 0,
							id_sub_skpd: 0,
							id_program: 0,
							id_giat: 0,
							id_sub_giat: 0,
							pagu_dana: options_dana[data.kode_dana].pagu_dana,
							id_daerah_log: options_dana[data.kode_dana].id_daerah_log,
							id_user_log: options_dana[data.kode_dana].id_user_log
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
				var new_data = {sumber_dana: []};
				for(var kode in options_dana){
					if(!options_dana[kode].singkron){
						current_data.sumber_dana.map(function(b, i){
							if(b.kodedana == kode){
								new_data.sumber_dana.push(b);
							}
						});
					}
				}
				simpan_dana_sub_bl(options_dana[kode], new_data)
				.then(function(){
					return resolve();
				});
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
	id_unit = idunit ? idunit : _token.unit;
	show_loading();
	list_belanja_by_tahun_daerah_unit(id_unit)
	.then(function(subkeg){
		subkeg.data = decrip(subkeg.data);
		console.log('list_belanja_by_tahun_daerah_unit', subkeg.data);
		
		// ubah status sub_keg_bl jadi tidak aktif semua agar jika ada sub keg yang dihapus, sipd lokal bisa ikut terupdate
		new Promise(function(resolve_reduce_nonactive, reject_reduce_nonactive){
			if(typeof promise_nonactive == 'undefined'){
				window.promise_nonactive = {};
			}
			promise_nonactive[id_unit] = resolve_reduce_nonactive;
			var subkeg_aktif = [];
			subkeg.data.map(function(b, i){
				// console.log('map',b);
				if(
					b.kode_sub_skpd
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
			console.log('list bl', subkeg.data);
			window.sub_keg_skpd = subkeg.data;
			subkeg.data.map(function(b, i){
				if(
					b.kode_sub_skpd
				){
					var keyword = b.kode_sbl;
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
	});
}

function singkron_subgiat_modal(sub_keg_asli=false){
	var data_sub_keg_selected = [];
	if(sub_keg_asli){
		data_sub_keg_selected = sub_keg_asli;
	}
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
	}else if(
		sub_keg_asli
		|| confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')
	){
		console.log('data_sub_keg_selected', data_sub_keg_selected);
		var id_unit = _token.unit;
		var cat_wp = '';
		var last = data_sub_keg_selected.length-1;
		data_sub_keg_selected.reduce(function(sequence, nextData){
			return sequence.then(function(current_data){
				return new Promise(function(resolve_reduce, reject_reduce){
					if(
						current_data.kode_sub_skpd
					){
						show_loading('singkron SKPD '+current_data.nama_sub_skpd, true);
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
			alert('Berhasil singkron ke DB lokal!');
			run_script('hide_modal');
			hide_loading();
		})
		.catch(function(e){
			console.log(e);
		});
	}
}

function singkron_all_unit(units) {
	show_loading();
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
				pesan_loading('singkron SKPD '+current_data.nama_skpd);
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
            			singkron_rka_ke_lokal_all(current_data, function(){
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
    	alert('Berhasil singkron ke DB lokal!');
    	hide_loading();
    })
    .catch(function(e){
        console.log(e);
    });
}

function singkron_rka_ke_lokal_all(opsi_unit, callback) {
	if((opsi_unit && opsi_unit.id_skpd) || confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		if((!opsi_unit || !opsi_unit.id_skpd)){
			show_loading();
		}
		id_unit = opsi_unit.id_skpd;
		if(opsi_unit && opsi_unit.id_skpd){
			// script singkron pagu SKPD
			get_skpd(_token.tahun, _token.daerah_id, id_unit).then(function(skpd){
				get_pagu_validasi(_token.tahun, _token.daerah_id, id_unit).then(function(paguvalidasi){
					list_belanja_by_tahun_daerah_unit(id_unit)
					.then(function(sub_keg_exist){
						var nilairincian = 0;
						var rinci_giat = 0;
						var nilaipagu = 0;
						sub_keg_exist.data = decrip(sub_keg_exist.data);
						sub_keg_exist.data.map(function(b, i){
							nilaipagu += b.pagu;
							nilairincian += b.rincian;
							rinci_giat += b.rinci_giat;
						});
						var opsi = { 
							action: 'set_unit_pagu',
							type: 'ri',
							api_key: config.api_key,
							tahun_anggaran: _token.tahun,
							data : {
								batasanpagu : paguvalidasi.data,
								id_daerah : _token.daerah_id,
								id_level : _token.id_level,
								id_skpd : opsi_unit.id_skpd,
								id_unit : opsi_unit.id_unit,
								id_user : _token.user_id,
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
								nilaipagu : nilaipagu,
								nilaipagumurni : opsi_unit.nilaipagumurni,
								nilairincian : nilairincian,
								pagu_giat : opsi_unit.pagu_giat,
								realisasi : opsi_unit.realisasi,
								rinci_giat : rinci_giat,
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
					});
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
			// ubah status sub_keg_bl jadi tidak aktif semua agar jika ada sub keg yang dihapus, sipd lokal bisa ikut terupdate
			new Promise(function(resolve_reduce_nonactive, reject_reduce_nonactive){
				promise_nonactive[id_unit] = resolve_reduce_nonactive;
				var subkeg_aktif = [];
				subkeg.data = decrip(subkeg.data);
				subkeg.data.map(function(b, i){
					// console.log('map',b);
					if(
						b.kode_sub_skpd
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
					// subkeg.data = decrip(subkeg.data);
					var last = subkeg.data.length-1;
					console.log('subkeg', subkeg.data);
					subkeg.data.reduce(function(sequence, nextData){
						return sequence.then(function(current_data){
							return new Promise(function(resolve_reduce, reject_reduce){
								console.log('current_data subkeg', current_data);
								if(
									current_data.kode_sub_skpd
								){
                                    var nama_skpd = current_data.nama_skpd;
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
							alert('Berhasil singkron data ke DB lokal!');
						}
					})
					.catch(function(e){
						console.log(e);
					});
				}else{
					console.log('jika tidak ada muncul data sub giat', subkeg.data);
					open_modal_subgiat(id_unit);
				}
			});	
		});
	}
}

function singkron_rka_ke_lokal(opsi, callback) {
	if(
		(
			opsi 
			&& opsi.kode_bl
		) 
		|| confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')
	){
		if(
			!opsi 
			|| !opsi.kode_bl
		){
			show_loading();
		}
        pesan_loading('singkron_rka_ke_lokal kode_sbl='+opsi.kode_sbl+' nama_sub_skpd='+opsi.nama_sub_skpd);
		var id_unit = opsi.id_skpd ? opsi.id_skpd : _token.unit;
		if(
			opsi 
			&& opsi.id_unit
		){
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
		if(
			!opsi 
			|| !opsi.kode_bl
		){
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
		if(
			(
				idbl 
				&& idsubbl
			) 
			|| kode_sbl
		){
			tahun = opsi.tahun;
			id_daerah = opsi.id_daerah;
			console.log('data opsi singkron_rka_ke_lokal', opsi);
			var res_sub_bl_view = {};
			var data_unit = {};
			var detaillokasi = {};
			var capaian_bl_res = {};
			var dana_sub_bl_res = {};
			var output_bl_res = {};
			var tag_bl_res = {};
			new Promise(function(resolve, reject){
				// get data meta dan indikator program kegiatan dan sub kegiatan
				sub_bl_view(idsubbl).then(function(res){
					res_sub_bl_view = res;
					pesan_loading('sub_bl_view get data sub kegiatan '+res_sub_bl_view.data[0].nama_sub_giat);
					get_skpd(tahun, id_daerah, id_unit).then(function(res){
						data_unit = res;
						detil_lokasi_bl(idsubbl).then(function(res){
							detaillokasi = res;
							capaian_bl(opsi.id_unit, opsi.id_skpd, opsi.id_sub_skpd, opsi.id_program, opsi.id_giat).then(function(res){
								capaian_bl_res = res;
								dana_sub_bl(idsubbl).then(function(res){
									dana_sub_bl_res = res;
									output_bl(idsubbl).then(function(res){
										output_bl_res = res;
										tag_bl(idsubbl).then(function(res){
											tag_bl_res = res;
											resolve();
										})
									})
								})
							})
						})
					})
				})
			})
			.then(function(res){
				// get indikator kegitan
				output_giat(opsi)
				.then(function(subkeg){
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
					for(var j in data_unit.data){
						data_rka.data_unit[j] = data_unit.data[j];
					}
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

						var id_kab_kota = _token.id_daerah;
						if(d.id_kab_kota != 0){
							id_kab_kota = d.id_kab_kota;
						}
						get_view_daerah(id_kab_kota).then(function(daerah){
							data_rka.dataLokout[i].daerahteks = daerah.data[0].nama_daerah;
							if(d.id_camat != 0){
								get_view_kecamatan(d.id_camat).then(function(kecamatan){
									data_rka.dataLokout[i].camatteks = kecamatan.data[0].camat_teks;
									if(d.id_lurah != 0){
										get_view_desa_kel(d.id_lurah).then(function(kelurahan){
											data_rka.dataLokout[i].lurahteks = kelurahan.data[0].lurah_teks;
										});
									}
								});
							}																
						});
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
						pesan_loading('tag_bl belum diset pada sub kegiatan '+res_sub_bl_view.data[0].nama_sub_giat+'!');
					}else{
						tag_bl_res.data.map(function(d, i){
							data_rka.dataTag[i] = {};
							data_rka.dataTag[i].idlabelgiat = d.idlabelgiat;
							data_rka.dataTag[i].namalabel = d.nama_bl;
							data_rka.dataTag[i].idtagbl = d.id_tag_bl;
						});
					}

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
						label_bl(d.id_sub_bl).then(function(labelbl){
							data_rka.dataBl[i].id_label_bl = labelbl.data[0].id_label_bl; //baru
							data_rka.dataBl[i].id_label_kokab = labelbl.data[0].id_label_kokab;
							if(labelbl.data[0].id_label_kokab != 0){
								get_label_kokab(labelbl.data[0].id_label_kokab).then(function(label_kokab){
									if(label_kokab.length >= 1){
										data_rka.dataBl[i].label_kokab = label_kokab.data[0].nama_label;
									}
								});		
							}
							data_rka.dataBl[i].id_label_prov = labelbl.data[0].id_label_prov;
							if(labelbl.data[0].id_label_prov != 0){
								get_label_prov(labelbl.data[0].id_label_prov).then(function(label_prov){
									if(label_prov.length >= 1){
										data_rka.dataBl[i].label_prov = label_prov.data[0].nama_label;
									}
								});		
							}
							data_rka.dataBl[i].id_label_pusat = labelbl.data[0].id_label_pusat;
							if(labelbl.data[0].id_label_pusat != 0){
								get_label_pusat(labelbl.data[0].id_label_pusat).then(function(label_pusat){
									if(label_pusat.length >= 1){
										data_rka.dataBl[i].label_pusat = label_pusat.data[0].nama_label;
									}
								});		
							}
						});														
					});
					
					if(opsi && opsi.action){
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
						pesan_loading('Rincian kosong di SIPD!');
						return true;
					}
					get_rinci_sub_bl(opsi.id_skpd, idsubbl)
					.then(function(data){
						var _leng = 500;
						if(config.jml_rincian){
							_leng = config.jml_rincian;
						}
						var _data_all = [];
						var _data = [];
						data.data.map(function(rka, i){
							var _rka = {};
							_rka.action = rka.action;
							_rka.id_rinci_sub_bl = rka.id_rinci_sub_bl;
							_rka.createddate = rka.createddate;
							_rka.createdtime = rka.createdtime;
							_rka.harga_satuan_murni = rka.harga_satuan_murni;
							_rka.is_locked = rka.is_locked;
							_rka.koefisien_murni = rka.koefisien_murni;
							_rka.nama_akun = rka.nama_akun;
							if(!rka.nama_standar_harga){
								_rka.nama_standar_harga = rka.nama_akun;
							}
							_rka.nama_komponen = rka.nama_standar_harga;
							_rka.spek_komponen = rka.spek;
							_rka.id_subs_sub_bl = rka.id_subs_sub_bl; //baru
							_rka.id_ket_sub_bl = rka.id_ket_sub_bl; //baru
							_rka.idketerangan = rka.id_ket_sub_bl;
							_rka.idsubtitle = rka.id_subs_sub_bl;
							if(rka.satuan){
								_rka.satuan = rka.satuan;
							}else{
								if(rka.koefisien){
									_rka.satuan = rka.koefisien.split(' ');
									_rka.satuan.shift();
									_rka.satuan = _rka.satuan.join(' ');
								}
							}
							_rka.volume_murni = rka.volume_murni;
							_rka.rincian = rka.total_harga;
							_rka.pajak_murni = rka.pajak_murni;
							_rka.totalpajak = rka.totalpajak;
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
							_data.push(_rka);
							if((i+1)%_leng == 0){
								_data_all.push(_data);
								_data = [];
							}
						});
						if(_data.length > 0){
							_data_all.push(_data);
						}

						var no_page = 0;
						var no_rka = 0;
						var total_page = _data_all.length;
						var last = _data_all.length-1;

						_data_all.reduce(function(sequence, nextData){
							return sequence.then(function(current_data){
								return new Promise(function(resolve_reduce, reject_reduce){

									var last2 = current_data.length-1;
									current_data.reduce(function(sequence2, nextData2){
										return sequence2.then(function(_rka){
											return new Promise(function(resolve_reduce2, reject_reduce2){
												new Promise(function(resolve3, reject3){
													detail_rincian_sub_bl(_rka).then(function(detail){																											
													if(detail.message == "Data tidak ditemukan"){
														return resolve3();
													}else{
														detail = detail.data[0];
														_rka.id_rinci_sub_bl = detail.id_rinci_sub_bl;
											            _rka.id_unik = detail.id_unik;
											            _rka.tahun = detail.tahun;
											            _rka.id_daerah = detail.id_daerah;
											            _rka.id_unit = detail.id_unit;
											            _rka.id_bl = detail.id_bl;
											            _rka.id_sub_bl = detail.id_sub_bl;
											            _rka.id_subs_sub_bl = detail.id_subs_sub_bl;
											            _rka.id_ket_sub_bl = detail.id_ket_sub_bl;
											            _rka.id_akun = detail.id_akun;
											            _rka.id_standar_harga = detail.id_standar_harga;
											            _rka.id_standar_nfs = detail.id_standar_nfs;
											            _rka.pajak = detail.pajak;
											            _rka.volume = detail.volume;
											            _rka.harga_satuan = detail.harga_satuan;
											            _rka.koefisien = detail.koefisien;
											            _rka.total_harga = detail.total_harga;
											            _rka.vol_1 = detail.vol_1;
											            _rka.sat_1 = detail.sat_1;
											            _rka.vol_2 = detail.vol_2;
											            _rka.sat_2 = detail.sat_2;
											            _rka.vol_3 = detail.vol_3;
											            _rka.sat_3 = detail.sat_3;
											            _rka.vol_4 = detail.vol_4;
											            _rka.sat_4 = detail.sat_4;
											            _rka.created_user = detail.created_user;
											            _rka.created_at = detail.created_at;
											            _rka.updated_user = detail.updated_user;
											            _rka.updated_at = detail.updated_at;
											            _rka.id_jadwal_murni = detail.id_jadwal_murni;
											            _rka.is_lokus_akun = detail.is_lokus_akun;
											            _rka.lokus_akun_teks = detail.lokus_akun_teks;
											            _rka.jenis_bl = detail.jenis_bl;
											            _rka.id_blt = detail.id_blt;
											            _rka.id_usulan = detail.id_usulan;
											            _rka.id_jenis_usul = detail.id_jenis_usul;
											            _rka.id_skpd = detail.id_skpd;
											            _rka.id_sub_skpd = detail.id_sub_skpd;
											            _rka.id_program = detail.id_program;
											            _rka.id_giat = detail.id_giat;
											            _rka.id_sub_giat = detail.id_sub_giat;
											            _rka.rkpd_murni = detail.rkpd_murni;
											            _rka.rkpd_pak = detail.rkpd_pak;
											            _rka.set_sisa_kontrak = detail.set_sisa_kontrak;
											            _rka.nama_daerah = detail.nama_daerah;
											            _rka.nama_unit = detail.nama_unit;
											            _rka.nama_bl = detail.nama_bl;
											            _rka.nama_sub_bl = detail.nama_sub_bl;
											            _rka.nama_subs_sub_bl = detail.nama_subs_sub_bl;
											            _rka.nama_ket_sub_bl = detail.nama_ket_sub_bl;
											            _rka.nama_akun = detail.nama_akun;
											            _rka.nama_standar_harga = detail.nama_standar_harga;
											            _rka.nama_standar_nfs = detail.nama_standar_nfs;
											            _rka.nama_jadwal_murni = detail.nama_jadwal_murni;
											            _rka.nama_blt = detail.nama_blt;
											            _rka.nama_usulan = detail.nama_usulan;
											            _rka.nama_jenis_usul = detail.nama_jenis_usul;
											            _rka.nama_skpd = detail.nama_skpd;
											            _rka.nama_sub_skpd = detail.nama_sub_skpd;
											            _rka.nama_program = detail.nama_program;
											            _rka.nama_giat = detail.nama_giat;
											            _rka.nama_sub_giat = detail.nama_sub_giat;
											            _rka.kode_daerah = detail.kode_daerah;
											            _rka.kode_unit = detail.kode_unit;
											            _rka.kode_akun = detail.kode_akun;
											            _rka.kode_standar_harga = detail.kode_standar_harga;
											            _rka.kode_skpd = detail.kode_skpd;
											            _rka.kode_sub_skpd = detail.kode_sub_skpd;
											            _rka.kode_program = detail.kode_program;
											            _rka.kode_giat = detail.kode_giat;
											            _rka.kode_sub_giat = detail.kode_sub_giat;
											            _rka.kua_murni = detail.kua_murni;
											            _rka.kua_pak = detail.kua_pak;
											            _rka.id_dana = detail.id_dana;
											            _rka.id_jadwal = detail.id_jadwal;
											            if(detail.is_lokus_akun == 0){
															return resolve3();
											            }else{
															// return resolve3();
											            	detail_penerima_bantuan(_rka).then(function(penerima){
											            		penerima = penerima.data[0];
											            		_rka.id_penerima_bantuan = penerima.id_penerima_bantuan;
													            _rka.jenis_bantuan = penerima.jenis_bantuan;
													            _rka.lokus_akun = penerima.lokus_akun;
													            _rka.id_profil = penerima.id_profil;
													            _rka.id_parpol = penerima.id_parpol;
													            _rka.id_prop = penerima.id_prop;
													            _rka.id_kokab = penerima.id_kokab;
													            _rka.id_camat = penerima.id_camat;
													            _rka.id_lurah = penerima.id_lurah;
												            	if(!penerima.id_kokab){
												            		return resolve3();
												            	}else{
												            		if(penerima.id_camat){
												            			detail_kecamatan(penerima).then(function(kecamatan){
												            				kecamatan = kecamatan.data[0];
												            				_rka.id_camat = kecamatan.id_camat;
																            _rka.id_prop = kecamatan.id_prop;
																            _rka.id_kab_kota = kecamatan.id_kab_kota;
																            _rka.kode_camat = kecamatan.kode_camat;
																            _rka.camat_teks = kecamatan.camat_teks;
																            _rka.camat_kode_ddn = kecamatan.kode_ddn;
																            _rka.camat_kode_ddn_2 = kecamatan.kode_ddn_2;
												            			});
												            		}
												            		if(penerima.id_lurah){
												            			detail_kelurahan(penerima).then(function(kelurahan){
												            				kelurahan = kelurahan.data[0];
												            				_rka.id_lurah = kelurahan.id_lurah;
																            _rka.kode_lurah = kelurahan.kode_lurah;
																            _rka.lurah_teks = kelurahan.lurah_teks;
																            _rka.lurah_kode_ddn = kelurahan.kode_ddn;
																            _rka.lurah_kode_ddn_2 = kelurahan.kode_ddn_2;
																            _rka.is_desa = kelurahan.is_desa;
												            			});
												            		}

												            		detail_daerah({ id_daerah: penerima.id_kokab }).then(function(daerah){
												            			daerah = daerah.data[0];
															            _rka.kode_prop = daerah.kode_prop;
															            _rka.kode_kab = daerah.kode_kab;
															            _rka.nama_daerah = daerah.nama_daerah;
															            _rka.kokab_kode_ddn = daerah.kode_ddn;
															            _rka.kokab_kode_ddn_2 = daerah.kode_ddn_2;
															            _rka.is_pusat = daerah.is_pusat;
															            _rka.is_prop = daerah.is_prop;
															            _rka.id_prop = daerah.id_prop;
															            _rka.jqm_code = daerah.jqm_code;
															            _rka.jqm_path = daerah.jqm_path;
															            _rka.is_deleted = daerah.is_deleted;
															            _rka.is_rekap = daerah.is_rekap;
															            _rka.set_zona = daerah.set_zona;
															            _rka.set_waktu_zona = daerah.set_waktu_zona;
															            _rka.set_gmt_zona = daerah.set_gmt_zona;
															            _rka.kode_satker = daerah.kode_satker;
															            _rka.kode_prov_djpk = daerah.kode_prov_djpk;
															            _rka.kode_kab_djpk = daerah.kode_kab_djpk;
															            _rka.will_migrated = daerah.will_migrated;
															            return resolve3();
												            		});
												            	}
											            	});
											            }
													}
													});	
												})
												.then(function(){
													return new Promise(function(resolve3, reject3){
														if(_rka.id_ket_sub_bl!=0){
															get_ket_sub_bl(_rka.id_ket_sub_bl).then(function(ket_sub_bl){
																if(ket_sub_bl.data.length > 0){
																	_rka.ket_bl_teks = ket_sub_bl.data[0].ket_bl_teks;
																	return resolve3();
																}
																return resolve3();
															});	
														}else{
															return resolve3();
														}
													});
												})
												.then(function(){
													return new Promise(function(resolve3, reject3){
														if(_rka.id_subs_sub_bl!=0){
															get_subs_sub_bl(_rka.id_subs_sub_bl).then(function(subs_sub_bl){
															if(subs_sub_bl.data.length > 0){
																_rka.subs_bl_teks = {
																	subs_asli: subs_sub_bl.data[0].subs_bl_teks,
																	substeks: subs_sub_bl.data[0].subs_bl_teks,
																	sumber_dana: {
																		id_dana: subs_sub_bl.data[0].id_dana,
																		nama_dana: '',
																		is_paket: subs_sub_bl.data[0].is_paket,
																		kode_dana: '',
																		id_subtitle: _rka.id_subs_sub_bl,
																		subtitle_teks: subs_sub_bl.data[0].subs_bl_teks
																	}
																};															
																_rka.id_jenis_barjas = subs_sub_bl.data[0].id_jenis_barjas;
																_rka.id_metode_barjas = subs_sub_bl.data[0].id_metode_barjas;
															}
																return resolve3();
															});	
														}else{
															return resolve3();
														}
													});
												})
												.then(function(){
													data_rka.rka[no_rka] = _rka;
													no_rka++;
													return resolve_reduce2(nextData2);
												});
											})
											.catch(function(e){
												console.log(e);
												return Promise.resolve(nextData2);
											});
										})
										.catch(function(e){
											console.log(e);
											return Promise.resolve(nextData2);
										});
									}, Promise.resolve(current_data[last2]))
									.then(function(data_last2){
										no_page++;
										data_rka.no_page = no_page;
										data_rka.total_page = total_page;

										// kirim rincian ke lokal
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
										}else{
										}
										if(
											total_page == 1
											|| total_page == no_page
										){
											continue_singkron_rka[kode_sbl].no_resolve = true;
											resolve_reduce(nextData);
										}
										chrome.runtime.sendMessage(data, function(response) {});
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
							pesan_loading('selesai kirim data ke lokal sub kegiatan='+kode_sbl+' '+res_sub_bl_view.data[0].nama_sub_giat);
							if(callback){
								callback();
							}
						});
					});
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
				id_unit: idskpd,
				is_anggaran: global_is_anggaran
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

function find_by_tahun_daerah_unit(idskpd){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/skpd/find_by_tahun_daerah_unit?tahun='+_token.tahun+'&id_daerah='+_token.daerah_id+'&id_unit='+idskpd+'&search=',
			type: 'GET',
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		return resolve(ret);
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
				tahun: _token.tahun,
				is_anggaran: global_is_anggaran
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
        	return resolve(substeks_all);
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
			if(
				(
					tipe_task == 'buka-tambah-kegiatan'
					&& sigkron_sub_keg
				)
				|| tipe_task == 'hapus-sub-kegiatan'
			){
				var id_jadwal = prompt('Masukan ID jadwal! Isikan kata "terbaru" jika ingin menarik data dari jadwal terbuka. Biarkan kosong jika ingin menarik data dari jadwal terkunci yang terakhir.');
			}
			show_loading();
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
									get_renja_lokal(true, false, id_jadwal)
									.then(function(){
										resolve_reduce(nextData);
									});
								}
							});
						}else if(tipe_task == 'hapus-sub-kegiatan'){
							window.idunitskpd = current_data.id_skpd;
							get_renja_lokal(true, true, id_jadwal)
							.then(function(sub_keg_exist){
								resolve_reduce(nextData);
							});
						}else if(tipe_task == 'kunci-kegiatan'){
							update_kunci_belanja_unit(current_data, 1)
							.then(function(){
								resolve_reduce(nextData);
							});
						}else if(tipe_task == 'validasi-sub-kegiatan'){
							validasi_pagu(current_data)
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
	return new Promise(function(resolve, reject){
		relayAjax({	      				
			url: config.sipd_url+'api/master/label_prov/view/'+id_label_prov+'/'+_token.tahun+'/'+_token.id_prop,
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
}

function get_label_pusat(id_label_pusat){
	return new Promise(function(resolve, reject){
		relayAjax({	      				
			url: config.sipd_url+'api/master/label_pusat/view/'+id_label_pusat+'/'+_token.tahun+'/'+_token.id_prop,
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
				id_unit: idunit,
				is_anggaran: global_is_anggaran
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
    	if(typeof global_ket_sub_bl == 'undefined'){
    		window.global_ket_sub_bl = {};
    	}
    	if(!global_ket_sub_bl[id_ket_sub_bl]){
    		pesan_loading('get_ket_sub_bl id_ket_sub_bl='+id_ket_sub_bl);
			relayAjax({
				url: config.sipd_url+'api/renja/ket_sub_bl/find_by_id_list',                                    
				type: 'POST',	      				
				data: {            
						id_daerah: _token.daerah_id,				
						tahun: _token.tahun,
						__id_ket_sub_bl_list: '['+id_ket_sub_bl+']',
						is_anggaran: global_is_anggaran
					},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
		      	success: function(ket_sub_bl){
		      		global_ket_sub_bl[id_ket_sub_bl] = ket_sub_bl;
		      		return resolve(ket_sub_bl);
		      	}
		    });
		}else{
		    return resolve(global_ket_sub_bl[id_ket_sub_bl]);
    	}
    });
}

function get_subs_sub_bl(id_subs_sub_bl){    
    return new Promise(function(resolve, reject){
    	if(typeof global_subs_sub_bl == 'undefined'){
    		window.global_subs_sub_bl = {};
    	}
    	if(!global_subs_sub_bl[id_subs_sub_bl]){
    		pesan_loading('get_subs_sub_bl id_subs_sub_bl='+id_subs_sub_bl);
			relayAjax({
				url: config.sipd_url+'api/renja/subs_sub_bl/find_by_id_list',                                    
				type: 'POST',	      				
				data: {            
						id_daerah: _token.daerah_id,				
						tahun: _token.tahun,
						__id_subs_sub_bl_list: '['+id_subs_sub_bl+']',
						is_anggaran: global_is_anggaran
					},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
		      	success: function(subs_sub_bl){
		      		global_subs_sub_bl[id_subs_sub_bl] = subs_sub_bl;
		      		return resolve(subs_sub_bl);
		      	}
		    });
		}else{
		    return resolve(global_subs_sub_bl[id_subs_sub_bl]);
    	}
    });
}


function singkron_master_cse(val){
	jQuery('#wrap-loading').show();
	console.log('val', val);
	if(typeof rincsub == 'undefined'){
		window.rincsub = {};
	}
	
	if(val == 'penerima_bantuan'){
		getDetailPenerima().then(function(_data){
			var data_profile = { 
				action: 'singkron_penerima_bantuan',
				tahun_anggaran: _token.tahun,
				type: 'ri',
				api_key: config.api_key,
				profile : {}
			};
			console.log('data penerima', _data.data);
			_data.data.map(function(profile, i){
				data_profile.profile[i] = {};
				data_profile.profile[i].alamat_teks = profile.alamat_teks;
				data_profile.profile[i].id_profil = profile.id_profil;
				data_profile.profile[i].jenis_penerima = profile.jenis_penerima;
				data_profile.profile[i].nama_teks = profile.nama_teks;
			});
			var data = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: data_profile,
		    			return: true
					}
			    }
			};
			chrome.runtime.sendMessage(data, function(response) {
			    console.log('responeMessage', response);
			});
		});
	}else if(val == 'alamat'){		
		// var id_unit = 0;
		getProv().then(function(prov){
			var data_alamat = { 
				action: 'singkron_alamat',
				tahun_anggaran: _token.tahun,
				type: 'ri',
				api_key: config.api_key,
				alamat : {}
			};
			var check_id_daerah_is_prov = false;
			var data_prov_map = [];
			console.log('data prov', prov.data);
			for(var i in prov.data){				
					
						if(i != 'kab'){
							data_alamat.alamat[i] = {};
							data_alamat.alamat[i].nama = prov.data[i].nama_daerah;
							data_alamat.alamat[i].id_alamat = prov.data[i].id_daerah;
							data_alamat.alamat[i].id_prov = '';
							data_alamat.alamat[i].id_kab = '';
							data_alamat.alamat[i].id_kec = '';
							data_alamat.alamat[i].is_prov = 1;
							data_alamat.alamat[i].is_kab = '';
							data_alamat.alamat[i].is_kec = '';
							data_alamat.alamat[i].is_kel = '';
							data_prov_map.push(data_alamat.alamat[i]);
							if(_token.daerah_id == prov.data[i].id_daerah){
								check_id_daerah_is_prov = _token.daerah_id;
							}
						}
													
			}
			var data_prov = {
			    message:{
			        type: "get-url",
			        content: {
					    url: config.url_server_lokal,
					    type: 'post',
					    data: data_alamat,
		    			return: false
					}
			    }
			};
			chrome.runtime.sendMessage(data_prov, function(response) {
			    console.log('responeMessage', response);
			});
			var last = data_prov_map.length-1;
			data_prov_map.reduce(function(sequence, nextData){
                return sequence.then(function(current_data){
                	return new Promise(function(resolve_reduce, reject_reduce){
                		if(
                			check_id_daerah_is_prov
                			&& check_id_daerah_is_prov != current_data.id_alamat
                		){
                			return resolve_reduce(nextData);
                		}
                		console.log('current_data', current_data);
						getKab(current_data.id_alamat).then(function(kab){
							console.log('kab', kab.data);
							var check_id_daerah_is_kab = false;
							var data_alamat_kab = { 
								action: 'singkron_alamat',
								tahun_anggaran: _token.tahun,
								type: 'ri',
								api_key: config.api_key,
								alamat : {}
							};
							var data_kab_map = [];
							for(var j in kab.data){
								if(j != 'kec' && j != 0){
									data_alamat_kab.alamat[j] = {};
									data_alamat_kab.alamat[j].nama = kab.data[j].nama_daerah;
									data_alamat_kab.alamat[j].id_alamat = kab.data[j].id_daerah;
									data_alamat_kab.alamat[j].id_prov = current_data.id_alamat;
									data_alamat_kab.alamat[j].id_kab = '';
									data_alamat_kab.alamat[j].id_kec = '';
									data_alamat_kab.alamat[j].is_prov = '';
									data_alamat_kab.alamat[j].is_kab = 1;
									data_alamat_kab.alamat[j].is_kec = '';
									data_alamat_kab.alamat[j].is_kel = '';
									data_kab_map.push(data_alamat_kab.alamat[j]);
			                		if(
			                			!check_id_daerah_is_prov
			                			&& _token.daerah_id == kab.data[j].id_daerah
			                		){
			                			check_id_daerah_is_kab = kab.data[j].id_daerah;
			                		}
								}
							}
							var data_kab = {
							    message:{
							        type: "get-url",
							        content: {
									    url: config.url_server_lokal,
									    type: 'post',
									    data: data_alamat_kab,
						    			return: false
									}
							    }
							};
							chrome.runtime.sendMessage(data_kab, function(response) {
							    console.log('responeMessage', response);
							});
							console.log('check_id_daerah_is_kab, check_id_daerah_is_prov', check_id_daerah_is_kab, check_id_daerah_is_prov);
							var last2 = data_kab_map.length-1;
							data_kab_map.reduce(function(sequence2, nextData2){
	                			return sequence2.then(function(current_data2){
                					return new Promise(function(resolve_reduce2, reject_reduce2){                						
										if(
                							!check_id_daerah_is_prov
                							&& (
                								!check_id_daerah_is_kab
                								|| check_id_daerah_is_kab != current_data2.id_alamat
                							)
                						){
                							return resolve_reduce2(nextData2);
                						}
										
                						console.log('current_data2', current_data2);
										getKec(current_data2.id_alamat).then(function(kec){
											var data_alamat_kec = { 
												action: 'singkron_alamat',
												tahun_anggaran: _token.tahun,
												type: 'ri',
												api_key: config.api_key,
												alamat : {}
											};
											console.log('data_kec_map', kec);
											var data_kec_map = [];
											for(var k in kec.data){
												if(k != 'kel' && k != 0){
													data_alamat_kec.alamat[k] = {};
													data_alamat_kec.alamat[k].nama = kec.data[k].camat_teks;
													data_alamat_kec.alamat[k].id_alamat = kec.data[k].id_camat;
													data_alamat_kec.alamat[k].id_prov = current_data2.id_prov;
													data_alamat_kec.alamat[k].id_kab = current_data2.id_alamat;
													data_alamat_kec.alamat[k].id_kec = '';
													data_alamat_kec.alamat[k].is_prov = '';
													data_alamat_kec.alamat[k].is_kab = '';
													data_alamat_kec.alamat[k].is_kec = 1;
													data_alamat_kec.alamat[k].is_kel = '';
													data_kec_map.push(data_alamat_kec.alamat[k]);
												}
											}
											var data_kec = {
											    message:{
											        type: "get-url",
											        content: {
													    url: config.url_server_lokal,
													    type: 'post',
													    data: data_alamat_kec,
										    			return: false
													}
											    }
											};
											chrome.runtime.sendMessage(data_kec, function(response) {
											    console.log('responeMessage', response);
											});
											var last3 = data_kec_map.length-1;
											data_kec_map.reduce(function(sequence3, nextData3){
					                			return sequence3.then(function(current_data3){
				                					return new Promise(function(resolve_reduce3, reject_reduce3){
                										console.log('current_data3', current_data3);
														getKel(current_data3.id_alamat).then(function(kel){
															var data_alamat_kel = { 
																action: 'singkron_alamat',
																tahun_anggaran: _token.tahun,
																type: 'ri',
																api_key: config.api_key,	
																alamat : {}
															};
															for(var l in kel.data){
																if(l != 0){
																	data_alamat_kel.alamat[l] = {};
																	data_alamat_kel.alamat[l].nama = kel.data[l].lurah_teks;
																	data_alamat_kel.alamat[l].id_alamat = kel.data[l].id_lurah;
																	data_alamat_kel.alamat[l].id_prov = current_data3.id_prov;
																	data_alamat_kel.alamat[l].id_kab = current_data3.id_kab;
																	data_alamat_kel.alamat[l].id_kec = current_data3.id_alamat;
																	data_alamat_kel.alamat[l].is_prov = '';
																	data_alamat_kel.alamat[l].is_kab = '';
																	data_alamat_kel.alamat[l].is_kec = '';
																	data_alamat_kel.alamat[l].is_kel = 1;
																}
															}
															var data_kel = {
															    message:{
															        type: "get-url",
															        content: {
																	    url: config.url_server_lokal,
																	    type: 'post',
																	    data: data_alamat_kel,
														    			return: false
																	}
															    }
															};
															chrome.runtime.sendMessage(data_kel, function(response) {
															    console.log('responeMessage', response);
															});
															resolve_reduce3(nextData3);
														});
													});
												})
								                .catch(function(e){
								                    console.log(e);
								                    return Promise.resolve(nextData3);
								                });
							                }, Promise.resolve(data_kec_map[last3]))
								            .then(function(data_last){
								            	return resolve_reduce2(nextData2);
								            });
										});
									})
					                .catch(function(e){
					                    console.log(e);
					                    return Promise.resolve(nextData2);
					                });
								})
				                .catch(function(e){
				                    console.log(e);
				                    return Promise.resolve(nextData2);
				                });
				            }, Promise.resolve(data_kab_map[last2]))
				            .then(function(data_last){
				            	return resolve_reduce(nextData);
				            });
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
            }, Promise.resolve(data_prov_map[last]))
            .then(function(data_last){
            	alert('Berhasil simpan data master Alamat!');
				jQuery('#wrap-loading').hide();
            });
		});
	}else{
		jQuery('#wrap-loading').hide();
	}
}

function getDetailPenerima(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/profil_user/list_for_penerima_bantuan',                               
			type: 'POST',	      				
			data: {				
				id_daerah: _token.daerah_id,
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(prov){
	      		return resolve(prov);
	      	}
	    });
    });
}

function getProv(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/provinsi/findlistpusat',                               
			type: 'POST',	      				
			data: {				
				tipe: 'prov'
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(prov){
	      		return resolve(prov);
	      	}
	    });
    });
}

function getKab(iddaerah){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/kabkot/findlist ',                               
			type: 'POST',	      				
			data: {				
				id_daerah: iddaerah,
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(kab){
	      		return resolve(kab);
	      	}
	    });
    });
}

function getKec(iddaerah){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/kecamatan/list_by_kotkab_and_tahun',                               
			type: 'POST',	      				
			data: {				
				id_kab_kota: iddaerah,
				tahun: _token.tahun,
				length: 1000
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(kab){
	      		return resolve(kab);
	      	}
	    });
    });
}

function getKel(iddaerah){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/kelurahan/list_by_kecamatan_and_tahun',                               
			type: 'POST',	      				
			data: {				
				id_camat: iddaerah,
				tahun: _token.tahun,
				length: 1000
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(kab){
	      		return resolve(kab);
	      	}
	    });
    });
}

// simpan indikator program, jika ada 2 indikator maka di simpan 2x
function simpan_capaian_bl(opsi, offset=0){    
    return new Promise(function(resolve, reject){
    	if(opsi.length == 0){
    		return resolve();
    	}
    	console.log('simpan_capaian_bl', opsi[offset]);
		relayAjax({
			url: config.sipd_url+'api/renja/capaian_bl/add',                               
			type: 'POST',	      				
			data: {				
				indikator_program_list: opsi[offset].indikator_program_list,
				tahun: opsi[offset].tahun,
				id_daerah: opsi[offset].id_daerah,
				id_unit: opsi[offset].id_unit,
				id_skpd: opsi[offset].id_skpd,
				id_sub_skpd: opsi[offset].id_sub_skpd,
				id_bl: 0,
				id_program: opsi[offset].id_program,
				id_giat: opsi[offset].id_giat,
				tolak_ukur: opsi[offset].tolak_ukur,
				target: opsi[offset].target,
				satuan: opsi[offset].satuan,
				target_teks: opsi[offset].target_teks,
				kode_rpjm: opsi[offset].kode_rpjm,
				id_daerah_log: opsi[offset].id_daerah_log,
				id_user_log: opsi[offset].id_user_log
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		offset += 1;
	      		if(opsi.length > offset){
	      			simpan_capaian_bl(opsi, offset)
	      			.then(function(ret){
	      				return resolve(ret);
	      			})
	      		}else{
	      			return resolve(ret);
	      		}
	      	}
	    });
    });
}

function update_capaian_bl(opsi, offset=0){    
    return new Promise(function(resolve, reject){
    	if(opsi.length == 0){
    		return resolve();
    	}
    	console.log('update_capaian_bl', opsi[offset]);
		relayAjax({
			url: config.sipd_url+'api/renja/capaian_bl/update',                               
			type: 'POST',	      				
			data: {				
				indikator_program_list: opsi[offset].indikator_program_list,
				tahun: opsi[offset].tahun,
				id_daerah: opsi[offset].id_daerah,
				id_unit: opsi[offset].id_unit,
				id_skpd: opsi[offset].id_skpd,
				id_sub_skpd: opsi[offset].id_sub_skpd,
				id_bl: 0,
				id_program: opsi[offset].id_program,
				id_giat: opsi[offset].id_giat,
				tolak_ukur: opsi[offset].tolak_ukur,
				target: opsi[offset].target,
				satuan: opsi[offset].satuan,
				target_teks: opsi[offset].target_teks,
				kode_rpjm: opsi[offset].kode_rpjm,
				id_daerah_log: opsi[offset].id_daerah_log,
				id_user_log: opsi[offset].id_user_log,
				id_capaian_bl: opsi[offset].id_capaian_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		offset += 1;
	      		if(opsi.length > offset){
	      			update_capaian_bl(opsi, offset)
	      			.then(function(ret){
	      				return resolve(ret);
	      			})
	      		}else{
	      			return resolve(ret);
	      		}
	      	}
	    });
    });
}

// simpan indikator output kegiatan, jika ada 2 indikator maka di simpan 2x
function simpan_output_giat(opsi, offset=0){    
    return new Promise(function(resolve, reject){
    	if(opsi.length == 0){
    		return resolve();
    	}
    	console.log('simpan_output_giat', opsi[offset]);
		relayAjax({
			url: config.sipd_url+'api/renja/output_giat/add',                               
			type: 'POST',	      				
			data: {				
				indikator_kegiatan_list: opsi[offset].indikator_kegiatan_list,
				tahun: opsi[offset].tahun,
				id_daerah: opsi[offset].id_daerah,
				id_unit: opsi[offset].id_unit,
				id_skpd: opsi[offset].id_skpd,
				id_sub_skpd: opsi[offset].id_sub_skpd,
				id_bl: 0,
				id_program: opsi[offset].id_program,
				id_giat: opsi[offset].id_giat,
				tolak_ukur: opsi[offset].tolak_ukur,
				target: opsi[offset].target,
				satuan: opsi[offset].satuan,
				target_teks: opsi[offset].target_teks,
				kode_rpjm: opsi[offset].kode_rpjm,
				kode_renstra: opsi[offset].kode_renstra,
				id_daerah_log: opsi[offset].id_daerah_log,
				id_user_log: opsi[offset].id_user_log
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		offset += 1;
	      		if(opsi.length > offset){
	      			simpan_output_giat(opsi, offset)
	      			.then(function(ret){
	      				return resolve(ret);
	      			})
	      		}else{
	      			return resolve(ret);
	      		}
	      	}
	    });
    });
}

function update_output_giat(opsi, offset=0){
    return new Promise(function(resolve, reject){
    	if(opsi.length == 0){
    		return resolve();
    	}
    	console.log('update_output_giat', opsi[offset]);
		relayAjax({
			url: config.sipd_url+'api/renja/output_giat/update',
			type: 'POST',
			data: {
				indikator_kegiatan_list: opsi[offset].indikator_kegiatan_list,
				tahun: opsi[offset].tahun,
				id_daerah: opsi[offset].id_daerah,
				id_unit: opsi[offset].id_unit,
				id_skpd: opsi[offset].id_skpd,
				id_sub_skpd: opsi[offset].id_sub_skpd,
				id_bl: 0,
				id_program: opsi[offset].id_program,
				id_giat: opsi[offset].id_giat,
				tolak_ukur: opsi[offset].tolak_ukur,
				target: opsi[offset].target,
				satuan: opsi[offset].satuan,
				target_teks: opsi[offset].target_teks,
				kode_rpjm: opsi[offset].kode_rpjm,
				kode_renstra: opsi[offset].kode_renstra,
				id_daerah_log: opsi[offset].id_daerah_log,
				id_user_log: opsi[offset].id_user_log,
				id_output_giat: opsi[offset].id_output_giat
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		offset += 1;
	      		if(opsi.length > offset){
	      			update_output_giat(opsi, offset)
	      			.then(function(ret){
	      				return resolve(ret);
	      			})
	      		}else{
	      			return resolve(ret);
	      		}
	      	}
	    });
    });
}

// simpan kelompok sasaran, hanya 1
function simpan_kelompok_sasaran(opsi){
    return new Promise(function(resolve, reject){
    	console.log('simpan_kelompok_sasaran', opsi);
		relayAjax({
			url: config.sipd_url+'api/renja/bl/simpandata',                               
			type: 'POST',	      				
			data: {				
				tahun: opsi.tahun,
				id_daerah: opsi.id_daerah,
				id_unit: opsi.id_unit,
				id_skpd: opsi.id_skpd,
				id_sub_skpd: opsi.id_sub_skpd,
				id_bl: opsi.id_bl,
				id_urusan: opsi.id_urusan,
				id_bidang_urusan: opsi.id_bidang_urusan,
				id_program: opsi.id_program,
				id_giat: opsi.id_giat,
				sasaran: opsi.sasaran,
				id_daerah_log: opsi.id_daerah_log,
				id_user_log: opsi.id_user_log
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		return resolve(ret);
	      	}
	    });
    });
}

// simpan indikator hasil giat
function simpan_hasil(opsi, id_bl, offset=0){
    return new Promise(function(resolve, reject){
    	if(opsi.length == 0){
    		return resolve();
    	}
    	console.log('simpan_hasil', opsi[offset]);
		jQuery.ajax({
			url: config.sipd_url+'api/renja/hasil_bl/add',                               
			type: 'POST',	      				
			data: {				
				tahun: opsi[0].tahun,
				id_daerah: opsi[0].id_daerah,
				id_unit: opsi[0].id_unit,
				id_skpd: opsi[0].id_skpd,
				id_sub_skpd: opsi[0].id_sub_skpd,
				id_bl: id_bl,
				id_urusan: opsi[0].id_urusan,
				id_bidang_urusan: opsi[0].id_bidang_urusan,
				id_program: opsi[0].id_program,
				id_giat: opsi[0].id_giat,
				tolak_ukur: opsi[0].tolak_ukur,
				target: opsi[0].target,
				satuan: opsi[0].satuan,
				target_teks: opsi[0].target_teks,
				created_user: opsi[0].created_user,
				id_daerah_log: opsi[0].id_daerah_log,
				id_user_log: opsi[0].id_user_log
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		return resolve(ret); // langsung direturn karena hanya bisa satu indikator hasil
	      		offset += 1;
	      		if(opsi.length > offset){
	      			simpan_hasil(opsi, id_bl, offset)
	      			.then(function(ret){
	      				return resolve(ret);
	      			})
	      		}else{
	      			return resolve(ret);
	      		}
	      	},
	      	error: function(ret){
	      		console.log('error', ret);
	      		return resolve();
	      	}
	    });
    });
}

// update indikator hasil giat
function update_hasil(opsi, id_bl, offset=0){
    return new Promise(function(resolve, reject){
    	if(opsi.length == 0){
    		return resolve();
    	}
    	console.log('update_hasil', opsi[offset]);
		jQuery.ajax({
			url: config.sipd_url+'api/renja/hasil_bl/update',                               
			type: 'POST',	      				
			data: {				
				tahun: opsi[0].tahun,
				id_daerah: opsi[0].id_daerah,
				id_unit: opsi[0].id_unit,
				id_skpd: opsi[0].id_skpd,
				id_sub_skpd: opsi[0].id_sub_skpd,
				id_bl: id_bl,
				id_urusan: opsi[0].id_urusan,
				id_bidang_urusan: opsi[0].id_bidang_urusan,
				id_program: opsi[0].id_program,
				id_giat: opsi[0].id_giat,
				tolak_ukur: opsi[0].tolak_ukur,
				target: opsi[0].target,
				satuan: opsi[0].satuan,
				target_teks: opsi[0].target_teks,
				created_user: opsi[0].created_user,
				id_daerah_log: opsi[0].id_daerah_log,
				id_user_log: opsi[0].id_user_log,
				id_hasil_bl: opsi[0].id_hasil_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		return resolve(ret); // langsung direturn karena hanya bisa satu indikator hasil
	      		offset += 1;
	      		if(opsi.length > offset){
	      			update_hasil(opsi, id_bl, offset)
	      			.then(function(ret){
	      				return resolve(ret);
	      			})
	      		}else{
	      			return resolve(ret);
	      		}
	      	},
	      	error: function(ret){
	      		console.log('error', ret);
	      		return resolve();
	      	}
	    });
    });
}

// simpan label pusat, hanya 1
function simpan_label_pusat(opsi){
    return new Promise(function(resolve, reject){
    	console.log('simpan_label_pusat', opsi);
		jQuery.ajax({
			url: config.sipd_url+'api/renja/label_bl/simpandata',                               
			type: 'POST',	      				
			data: {				
				tahun: opsi.tahun,
				id_daerah: opsi.id_daerah,
				id_unit: opsi.id_unit,
				id_skpd: opsi.id_skpd,
				id_sub_skpd: opsi.id_sub_skpd,
				id_bl: opsi.id_bl,
				id_urusan: opsi.id_urusan,
				id_bidang_urusan: opsi.id_bidang_urusan,
				id_program: opsi.id_program,
				id_giat: opsi.id_giat,
				id_sub_giat: opsi.id_sub_giat,
				id_label_pusat: opsi.id_label_pusat,
				id_label_bl: opsi.id_label_bl,
				id_daerah_log: opsi.id_daerah_log,
				id_user_log: opsi.id_user_log
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		return resolve(ret);
	      	},
	      	error: function(ret){
	      		console.log('error', ret);
	      		return resolve();
	      	}
	    });
    });
}

function get_hasil(opsi){    
    return new Promise(function(resolve, reject){
		jQuery.ajax({
			url: config.sipd_url+'api/renja/hasil_bl/load_data',                               
			type: 'POST',	      				
			data: {
				tahun: opsi.tahun,
				id_daerah: opsi.id_daerah,
				id_program: opsi.id_program,
				id_giat: opsi.id_giat,
				id_unit: opsi.id_unit,
				id_skpd: opsi.id_skpd,
				id_sub_skpd: opsi.id_sub_skpd
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(ret){
	      		return resolve(ret);
	      	},
	      	error: function(ret){
	      		return resolve(false);
	      	}
	    });
    });
}

function get_label_pusat(id_skpd){    
    return new Promise(function(resolve, reject){
    	if(typeof global_label_pusat == 'undefined'){
			relayAjax({
				url: config.sipd_url+'api/master/label_pusat/find',                               
				type: 'POST',	      				
				data: {				
					id_skpd: id_skpd,
					tahun: _token.tahun,
					id_daerah: _token.daerah_id,
					'search[value]': ''
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
		      	success: function(ret){
		      		global_label_pusat = ret;
		      		return resolve(global_label_pusat);
		      	}
		    });
    	}else{
      		return resolve(global_label_pusat);
    	}
    });
}

// get detail indikator kegiatan
function output_giat(opsi){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/output_giat/load_data',						
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				id_program: opsi.id_program,
				id_giat: opsi.id_giat,
				id_unit: opsi.id_unit,
				id_skpd: opsi.id_skpd,
				id_sub_skpd: opsi.id_sub_skpd
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

// get kelompok belanja
function sasaran_giat(opsi){
	return new Promise(function(resolve, reject){
		jQuery.ajax({
			url: config.sipd_url+'api/renja/bl/load_data',						
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
				return resolve(subkeg);
			},
			error: function(e){
				console.log(e);
				return resolve({});
			}
		});
	});
}

// hapus sumber dana di sub kegiatan
function hapus_sumber_dana(opsi){
	pesan_loading('Hapus sumber dana '+opsi.kode_dana+' '+opsi.nama_dana+'!');
	return new Promise(function(resolve, reject){
		jQuery.ajax({
			url: config.sipd_url+'api/renja/dana_sub_bl/delete',						
			type: 'POST',	      				
			data: {
				id_dana_sub_bl: opsi.id_dana_sub_bl,
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				id_unit: opsi.id_unit,
				id_dana: opsi.id_dana,
				id_daerah_log: _token.daerah_id,
				id_user_log: _token.user_id,
				id_sub_bl: opsi.id_sub_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res);
			},
			error: function(e){
				console.log(e);
				return resolve({});
			}
		});
	});
}

// validasi sub kegiatan
function validasi_pagu(opsi){
	pesan_loading('Validasi pagu sub kegiatan '+opsi.nama_skpd+'!');
	return new Promise(function(resolve, reject){
		jQuery.ajax({
			url: config.sipd_url+'api/renja/sub_bl/validasi_semua_pagu',						
			type: 'POST',	      				
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				id_unit: opsi.id_skpd,
				id_user: _token.user_id
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res);
			},
			error: function(e){
				console.log(e);
				return resolve({});
			}
		});
	});
}

// get rincian 
function detail_rincian_sub_bl(opsi){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/rinci_sub_bl/view/'+opsi.id_rinci_sub_bl,						
			type: 'POST',	      				
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				id_sub_bl: opsi.id_sub_bl
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

// get rincian 
function detail_penerima_bantuan(opsi){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/renja/penerima_bantuan/view_by_id_rinci_sub_bl/'+opsi.id_rinci_sub_bl,						
			type: 'POST',	      				
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id
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

// get detail daerah
function detail_daerah(opsi){
	return new Promise(function(resolve, reject){
		if(typeof global_detail_daerah){
			window.global_detail_daerah = {};
		}
		if(!global_detail_daerah[opsi.id_daerah]){
			pesan_loading("Get detail daerah id_daerah="+opsi.id_daerah);
			relayAjax({
				url: config.sipd_url+'api/master/daerah/view/'+opsi.id_daerah,
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
				success: function(res){
					global_detail_daerah[opsi.id_daerah] = res;
					return resolve(res);
				}
			});
		}else{
			return resolve(global_detail_daerah[opsi.id_daerah]);
		}
	});
}

// get detail kecamatan
function detail_kecamatan(opsi){
	return new Promise(function(resolve, reject){
		if(typeof global_detail_kecamatan){
			window.global_detail_kecamatan = {};
		}
		if(!global_detail_kecamatan[opsi.tahun+'-'+opsi.id_camat]){
			pesan_loading("Get detail kecamatan id="+opsi.id_camat+' tahun='+opsi.tahun);
			relayAjax({
				url: config.sipd_url+'api/master/kecamatan/view/'+opsi.tahun+'/'+opsi.id_camat,
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
				success: function(res){
					global_detail_kecamatan[opsi.tahun+'-'+opsi.id_camat] = res;
					return resolve(res);
				}
			});
		}else{
			return resolve(global_detail_kecamatan[opsi.tahun+'-'+opsi.id_camat]);
		}
	});
}

// get detail kelurahan
function detail_kelurahan(opsi){
	return new Promise(function(resolve, reject){
		if(typeof global_detail_kelurahan){
			window.global_detail_kelurahan = {};
		}
		if(!global_detail_kelurahan[opsi.tahun+'-'+opsi.id_lurah]){
			pesan_loading("Get detail kelurahan id="+opsi.id_lurah+' tahun='+opsi.tahun);
			relayAjax({
				url: config.sipd_url+'api/master/kelurahan/view/'+opsi.tahun+'/'+opsi.id_lurah,
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
				success: function(res){
					global_detail_kelurahan[opsi.tahun+'-'+opsi.id_lurah] = res;
					return resolve(res);
				}
			});
		}else{
			return resolve(global_detail_kelurahan[opsi.tahun+'-'+opsi.id_lurah]);
		}
	});
}