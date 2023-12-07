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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
						xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
							xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
							xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
							xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
							xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
							xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
							xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
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