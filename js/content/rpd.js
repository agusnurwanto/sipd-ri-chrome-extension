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
	var body = '';
	if(type_data_rpd == 'tujuan'){
		get_tujuan_rpd({tahun: _token.tahun})
		.then(function(tujuan_sipd){
			rpd.map(function(b, i){
				var keyword = b.id_isu+'-'+b.id_unik+'-'+b.id_unik_indikator;
				rpd_all[keyword] = b;
				var cek_tujuan = '';
				var cek_exist = '';
				var catatan = '';
				var no_urut = '['+b.no_urut+'] ';
				if(b.id_unik_indikator == null){
					cek_tujuan = '#65ffb8c7';
					catatan = b.catatan_teks_tujuan;
					tujuan_sipd.data.map(function(ts, ii){
						if(replace_string(ts.tujuan_teks) == replace_string(b.tujuan_teks)){
							cek_exist = '<b>Existing</b>'
						}
					});
				}else if(b.id_unik_indikator != null){
					cek_tujuan = '#65cdff5c';
					catatan = b.indikator_catatan_teks;
					tujuan_sipd.data.map(function(ts, ii){
						if(
							replace_string(ts.tujuan_teks) == replace_string(b.tujuan_teks)
							&& replace_string(ts.indikator_teks) == replace_string(b.indikator_teks)
						){
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
					+'<td>'+catatan+'</td>'
				+'</tr>';
			});
			jQuery('#table-extension tbody').html(body);
			run_script('show_modal');
			hide_loading();
		});
	}else if(type_data_rpd == 'sasaran'){
		get_sasaran_rpd({tahun: _token.tahun})
		.then(function(sasaran_sipd){
			rpd.map(function(b, i){
				if(b.id_unik_indikator == null){
					var keyword = b.id_isu+'-'+b.id_unik;
					b.keyword = keyword;
					for(var bb in b){
						if(b[bb] == null){
							b[bb] = '';
						}
					}
					b.tujuan_ri = {};
					sasaran_sipd.tujuan.map(function(ts, ii){
						if(replace_string(ts.tujuan_teks) == replace_string(b.tujuan_teks)){
							b.tujuan_ri = ts;
						}
					});
					rpd_all[keyword] = b;
				}
			});
			var rpd_all_arr = objToArray(rpd_all);
			var last = rpd_all_arr.length-1;
			rpd_all_arr.reduce(function(sequence, nextData){
	            return sequence.then(function(current_data){
	        		return new Promise(function(resolve_reduce, reject_reduce){
	        			pesan_loading('Get sasaran RPD WP-SIPD dari tujuan = '+current_data.tujuan_teks, true);
						var data = {
						    message:{
						        type: "get-url",
						        content: {
								    url: config.url_server_lokal,
								    type: 'post',
								    data: { 
										action: 'get_rpd',
										run: 'continue_get_rpd',
										table: 'data_rpd_sasaran_lokal',
										id_unik_tujuan: current_data.id_unik,
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
						window.continue_get_rpd = function(data_sasaran){
							data_sasaran.map(function(b, i){
								var cek_sasaran = '';
								var cek_exist = '';
								var catatan = '';
								var keyword = current_data.keyword+'-'+b.id_unik+'-'+b.id_unik_indikator;
								b.tujuan = current_data;
								rpd_all[keyword] = b;
								var no_urut = '['+b.sasaran_no_urut+'] ';

								if(b.id_unik_indikator == null){
									cek_sasaran = '#65ffb8c7';
									catatan = b.sasaran_catatan;
									sasaran_sipd.data.map(function(ts, ii){
										if(replace_string(ts.sasaran_teks) == replace_string(b.sasaran_teks)){
											cek_exist = '<b>Existing</b>';
										}
									});
								}else if(b.id_unik_indikator != null){
									cek_sasaran = '#65cdff5c';
									catatan = b.indikator_catatan_teks;
									sasaran_sipd.data.map(function(ts, ii){
										if(
											replace_string(ts.sasaran_teks) == replace_string(b.sasaran_teks)
											&& replace_string(ts.indikator_teks) == replace_string(b.indikator_teks)
										){
											cek_exist = '<b>Existing</b>';
										}
									});
								}
								for(var bb in b){
									if(b[bb] == null){
										b[bb] = '';
									}
								}
								body += ''
								+'<tr style="background:'+cek_sasaran+'">'
									+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
									+'<td class="text-center">'+cek_exist+'</td>'
									+'<td>['+current_data.no_urut+'] '+current_data.tujuan_teks+'</td>'
									+'<td>'+no_urut+b.sasaran_teks+'</td>'
									+'<td>'+b.indikator_teks+'</td>'
									+'<td class="text-center">'+b.target_awal+'</td>'
									+'<td class="text-center">'+b.target_1+'</td>'
									+'<td class="text-center">'+b.target_2+'</td>'
									+'<td class="text-center">'+b.target_3+'</td>'
									+'<td class="text-center">'+b.target_4+'</td>'
									+'<td class="text-center">'+b.target_5+'</td>'
									+'<td class="text-center">'+b.target_akhir+'</td>'
									+'<td>'+catatan+'</td>'
								+'</tr>';
							});
							resolve_reduce(nextData);
						};
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
	        }, Promise.resolve(rpd_all_arr[last]))
	        .then(function(){
	        	delete window.continue_get_rpd;
				jQuery('#table-extension tbody').html(body);
				run_script('show_modal');
				hide_loading();
	        });
	     });
	}
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

function singkronisasi_rpd_sasaran_dari_lokal(){
	var data_selected = [];
	jQuery('#table-extension tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_selected.push(rpd_all[id]);
		}
	});
	if(data_selected.length >= 1){
		show_loading();
		console.log('data_selected', data_selected);
		getJadwalAktifRpd()
		.then(function(jadwal){
			get_sasaran_rpd({tahun: _token.tahun})
			.then(function(sasaran_ri){
				var last = data_selected.length-1;
				data_selected.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){
		        		return new Promise(function(resolve_reduce, reject_reduce){
		        			if(current_data.id_unik_indikator != ''){
		        				return resolve_reduce(nextData);
		        			}
		        			var sasaran_wp = replace_string(current_data.sasaran_teks);
		        			var check_exist = false;
		        			sasaran_ri.data.map(function(b, i){
		        				if(sasaran_wp == replace_string(b.sasaran_teks)){
		        					check_exist = b;
		        				}
		        			});
		        			if(!current_data.tujuan.tujuan_ri.id_unik){
        						pesan_loading('ID unik tujuan SIPD RI tidak ditemukan! dari sasaran = '+current_data.sasaran_teks, true);
		        				return resolve_reduce(nextData);
		        			}

		        			// jika sasaran kosong
		        			if(!check_exist){
        						pesan_loading('Simpan sasaran RPD '+current_data.sasaran_teks, true);
		        				relayAjaxApiKey({
		        					url: config.sipd_url+'api/rpjm/rpd_sasaran/add',
		        					type: 'post',
		        					data: formData({
		        						id_daerah: _token.daerah_id,
										tahun_awal: jadwal.tahun_awal,
										tahun_akhir: jadwal.tahun_akhir,
										id_tahap: jadwal.id_tahap,
										nama_tahap: jadwal.detail_tahap.nama_tahap,
										id_misi: 0,
										kode_tujuan: current_data.tujuan.tujuan_ri.id_unik, 
										sasaran_teks: current_data.sasaran_teks,
		        						urut_sasaran: current_data.sasaran_no_urut,
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
		        					}),
		        					success: function(ret){
		        						resolve_reduce(nextData);
		        					}
		        				});
		        			// jika nomor urut tidak sama diupdate
		        			}else if(
		        				current_data.sasaran_no_urut != ''
		        				&& check_exist.urut_sasaran != current_data.sasaran_no_urut
		        			){
        						pesan_loading('Update sasaran RPD '+current_data.tujuan_teks, true);
		        				relayAjaxApiKey({
		        					url: config.sipd_url+'api/rpjm/rpd_sasaran/updateBySasaranTeks',
		        					type: 'post',
		        					data: formData({
		        						urut_sasaran: current_data.sasaran_no_urut,
		        						id_daerah: check_exist.id_daerah,
										tahun_awal: check_exist.tahun_awal,
										tahun_akhir: check_exist.tahun_akhir,
										id_tahap: check_exist.id_tahap,
										nama_tahap: check_exist.nama_tahap,
										kode_tujuan: check_exist.kode_tujuan, 
										sasaran_teks: check_exist.sasaran_teks,
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
        						pesan_loading('Sudah ada tujuan RPD '+current_data.tujuan_teks, true);
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
		        	singkron_indikator_sasaran_rpd(data_selected, jadwal, function(){
						hide_loading();
						if(confirm('Berhasil simpan data RPD! Apakah anda mau merefresh halaman ini untuk melihat hasil perubahan terbaru?')){
							location.href = location.href;
						}
		        	});
		        });
			});
		});
	}else{
		alert('Pilih data dulu!');
	}
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
		show_loading();
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
        						pesan_loading('Simpan tujuan RPD '+current_data.tujuan_teks, true);
		        				relayAjaxApiKey({
		        					url: config.sipd_url+'api/rpjm/rpd_tujuan/add',
		        					type: 'post',
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
										id_misi: 0
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
        						pesan_loading('Update tujuan RPD '+current_data.tujuan_teks, true);
		        				relayAjaxApiKey({
		        					url: config.sipd_url+'api/rpjm/rpd_tujuan/updateByTujuanTeks',
		        					type: 'post',
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
        						pesan_loading('Sudah ada tujuan RPD '+current_data.tujuan_teks, true);
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
		        	singkron_indikator_tujuan_rpd(data_selected, jadwal, function(){
						hide_loading();
						if(confirm('Berhasil simpan data RPD! Apakah anda mau merefresh halaman ini untuk melihat hasil perubahan terbaru?')){
							location.href = location.href;
						}
		        	});
		        });
			});
		});
	}else{
		alert('Pilih data dulu!');
	}
}

function singkron_indikator_sasaran_rpd(data_selected, jadwal, cb){
	get_sasaran_rpd({tahun: _token.tahun})
	.then(function(sasaran_ri){
		var last = data_selected.length-1;
		data_selected.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			if(current_data.id_unik_indikator == ''){
        				return resolve_reduce(nextData);
        			}
        			var sasaran_wp = replace_string(current_data.sasaran_teks);
        			var indikator_sasaran_wp = replace_string(current_data.indikator_teks);
        			var check_exist_sasaran = false;
        			var check_exist_sasaran_indikator = false;
        			sasaran_ri.data.map(function(b, i){
        				if(sasaran_wp == replace_string(b.sasaran_teks)){
        					check_exist_sasaran = b;
        					if(indikator_sasaran_wp == replace_string(b.indikator_teks)){
        						check_exist_sasaran_indikator = b;
        					}
        				}
        			});
        			if(!check_exist_sasaran){
        				console.log('Sasaran RPD tidak ditemukan!', current_data);
        				return resolve_reduce(nextData);
        			}
        			if(!check_exist_sasaran_indikator){
        				pesan_loading('Simpan indikator sasaran RPD '+current_data.indikator_teks, true);
        				relayAjaxApiKey({
        					url: config.sipd_url+'api/rpjm/rpd_sasaran/add',
        					type: 'post',
        					data: formData({
        						id_daerah: _token.daerah_id,
								tahun_awal: jadwal.tahun_awal,
								tahun_akhir: jadwal.tahun_akhir,
								id_tahap: jadwal.id_tahap,
								nama_tahap: jadwal.detail_tahap.nama_tahap,
								id_misi: 0,
        						urut_sasaran: 0,
								kode_tujuan: check_exist_sasaran.id_unik,
								sasaran_teks: current_data.sasaran_teks,
								indikator_teks: current_data.indikator_teks,
								satuan: current_data.satuan,
								target_awal: current_data.target_awal,
								target_1: current_data.target_1,
								target_2: current_data.target_2,
								target_3: current_data.target_3,
								target_4: current_data.target_4,
								target_5: current_data.target_5,
								target_akhir: current_data.target_akhir,
								rpjpd_id_visi: 0,
								rpjpd_id_misi: 0,
								rpjpd_id_sasaran: 0,
								rpjpd_id_kebijakan: 0,
								rpjpd_id_strategi: 0,
								id_user_log: _token.user_id,
								id_daerah_log: _token.daerah_id,
								id_unik: check_exist_sasaran.id_unik
        					}),
        					success: function(ret){
        						resolve_reduce(nextData);
        					}
        				});
        			}else if(
        				check_exist_sasaran_indikator.satuan != current_data.satuan
        				|| check_exist_sasaran_indikator.target_1 != current_data.target_1
        				|| check_exist_sasaran_indikator.target_2 != current_data.target_2
        				|| check_exist_sasaran_indikator.target_3 != current_data.target_3
        				|| check_exist_sasaran_indikator.target_4 != current_data.target_4
        				|| check_exist_sasaran_indikator.target_5 != current_data.target_5
        				|| check_exist_sasaran_indikator.target_awal != current_data.target_awal
        				|| check_exist_sasaran_indikator.target_akhir != current_data.target_akhir
		        	){
        				pesan_loading('Update indikator sasaran RPD '+current_data.indikator_teks, true);
        				relayAjaxApiKey({
        					url: config.sipd_url+'api/rpjm/rpd_sasaran/updateBySasaranTeks',
        					type: 'post',
        					data: formData({
        						urut_sasaran: check_exist_sasaran_indikator.no_urut,
        						id_daerah: check_exist_sasaran_indikator.id_daerah,
								tahun_awal: check_exist_sasaran_indikator.tahun_awal,
								tahun_akhir: check_exist_sasaran_indikator.tahun_akhir,
								id_tahap: check_exist_sasaran_indikator.id_tahap,
								nama_tahap: check_exist_sasaran_indikator.nama_tahap,
								sasaran_teks: check_exist_sasaran_indikator.sasaran_teks,
								indikator_teks: check_exist_sasaran_indikator.indikator_teks,
								satuan: current_data.satuan,
								target_awal: current_data.target_awal,
								target_1: current_data.target_1,
								target_2: current_data.target_2,
								target_3: current_data.target_3,
								target_4: current_data.target_4,
								target_5: current_data.target_5,
								target_akhir: current_data.target_akhir,
								rpjpd_id_visi: check_exist_sasaran_indikator.rpjpd_id_visi,
								rpjpd_id_misi: check_exist_sasaran_indikator.rpjpd_id_misi,
								rpjpd_id_sasaran: check_exist_sasaran_indikator.rpjpd_id_sasaran,
								rpjpd_id_kebijakan: check_exist_sasaran_indikator.rpjpd_id_kebijakan,
								rpjpd_id_strategi: check_exist_sasaran_indikator.rpjpd_id_strategi,
								id_user_log: _token.user_id,
								id_daerah_log: _token.daerah_id,
								id_misi: check_exist_sasaran_indikator.id_misi,
								id_misi_old: check_exist_sasaran_indikator.id_misi,
								id_sasaran_old: check_exist_sasaran_indikator.id_sasaran_old,
								sasaran_teks_old: check_exist_sasaran_indikator.sasaran_teks,
								id_unik: check_exist_sasaran_indikator.id_unik,
								id_unik_indikator: check_exist_sasaran_indikator.id_unik_indikator,
								is_locked: check_exist_sasaran_indikator.is_locked,
								is_locked_indikator: check_exist_sasaran_indikator.is_locked_indikator
        					}),
        					success: function(ret){
        						resolve_reduce(nextData);
        					}
        				});
        			}else{
        				pesan_loading('Sudah ada indikator sasaran RPD '+current_data.indikator_teks, true);
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
        	cb();
        });
	});
}

function singkron_indikator_tujuan_rpd(data_selected, jadwal, cb){
	get_tujuan_rpd({tahun: _token.tahun})
	.then(function(tujuan_ri){
		var last = data_selected.length-1;
		data_selected.reduce(function(sequence, nextData){
            return sequence.then(function(current_data){
        		return new Promise(function(resolve_reduce, reject_reduce){
        			if(current_data.id_unik_indikator == ''){
        				return resolve_reduce(nextData);
        			}
        			var tujuan_wp = replace_string(current_data.tujuan_teks);
        			var indikator_tujuan_wp = replace_string(current_data.indikator_teks);
        			var check_exist_tujuan = false;
        			var check_exist_tujuan_indikator = false;
        			tujuan_ri.data.map(function(b, i){
        				if(tujuan_wp == replace_string(b.tujuan_teks)){
        					check_exist_tujuan = b;
        					if(indikator_tujuan_wp == replace_string(b.indikator_teks)){
        						check_exist_tujuan_indikator = b;
        					}
        				}
        			});
        			if(!check_exist_tujuan){
        				console.log('Tujuan RPD tidak ditemukan!', current_data);
        				return resolve_reduce(nextData);
        			}
        			if(!check_exist_tujuan_indikator){
        				pesan_loading('Simpan indikator tujuan RPD '+current_data.indikator_teks, true);
        				relayAjaxApiKey({
        					url: config.sipd_url+'api/rpjm/rpd_tujuan/add',
        					type: 'post',
        					data: formData({
        						urut_tujuan: 0,
        						id_daerah: _token.daerah_id,
								tahun_awal: jadwal.tahun_awal,
								tahun_akhir: jadwal.tahun_akhir,
								id_tahap: jadwal.id_tahap,
								nama_tahap: jadwal.detail_tahap.nama_tahap,
								tujuan_teks: current_data.tujuan_teks,
								indikator_teks: current_data.indikator_teks,
								satuan: current_data.satuan,
								target_awal: current_data.target_awal,
								target_1: current_data.target_1,
								target_2: current_data.target_2,
								target_3: current_data.target_3,
								target_4: current_data.target_4,
								target_5: current_data.target_5,
								target_akhir: current_data.target_akhir,
								rpjpd_id_visi: 0,
								rpjpd_id_misi: 0,
								rpjpd_id_sasaran: 0,
								rpjpd_id_kebijakan: 0,
								rpjpd_id_strategi: 0,
								id_user_log: _token.user_id,
								id_daerah_log: _token.daerah_id,
								id_misi: 0,
								id_unik: check_exist_tujuan.id_unik
        					}),
        					success: function(ret){
        						resolve_reduce(nextData);
        					}
        				});
        			}else if(
        				check_exist_tujuan_indikator.satuan != current_data.satuan
        				|| check_exist_tujuan_indikator.target_1 != current_data.target_1
        				|| check_exist_tujuan_indikator.target_2 != current_data.target_2
        				|| check_exist_tujuan_indikator.target_3 != current_data.target_3
        				|| check_exist_tujuan_indikator.target_4 != current_data.target_4
        				|| check_exist_tujuan_indikator.target_5 != current_data.target_5
        				|| check_exist_tujuan_indikator.target_awal != current_data.target_awal
        				|| check_exist_tujuan_indikator.target_akhir != current_data.target_akhir
		        	){
        				pesan_loading('Update indikator tujuan RPD '+current_data.indikator_teks, true);
        				relayAjaxApiKey({
        					url: config.sipd_url+'api/rpjm/rpd_tujuan/updateByTujuanTeks',
        					type: 'post',
        					data: formData({
        						urut_tujuan: check_exist_tujuan_indikator.no_urut,
        						id_daerah: check_exist_tujuan_indikator.id_daerah,
								tahun_awal: check_exist_tujuan_indikator.tahun_awal,
								tahun_akhir: check_exist_tujuan_indikator.tahun_akhir,
								id_tahap: check_exist_tujuan_indikator.id_tahap,
								nama_tahap: check_exist_tujuan_indikator.nama_tahap,
								tujuan_teks: check_exist_tujuan_indikator.tujuan_teks,
								indikator_teks: check_exist_tujuan_indikator.indikator_teks,
								satuan: current_data.satuan,
								target_awal: current_data.target_awal,
								target_1: current_data.target_1,
								target_2: current_data.target_2,
								target_3: current_data.target_3,
								target_4: current_data.target_4,
								target_5: current_data.target_5,
								target_akhir: current_data.target_akhir,
								rpjpd_id_visi: check_exist_tujuan_indikator.rpjpd_id_visi,
								rpjpd_id_misi: check_exist_tujuan_indikator.rpjpd_id_misi,
								rpjpd_id_sasaran: check_exist_tujuan_indikator.rpjpd_id_sasaran,
								rpjpd_id_kebijakan: check_exist_tujuan_indikator.rpjpd_id_kebijakan,
								rpjpd_id_strategi: check_exist_tujuan_indikator.rpjpd_id_strategi,
								id_user_log: _token.user_id,
								id_daerah_log: _token.daerah_id,
								id_misi: check_exist_tujuan_indikator.id_misi,
								id_misi_old: check_exist_tujuan_indikator.id_misi,
								id_tujuan_old: check_exist_tujuan_indikator.id_tujuan_old,
								tujuan_teks_old: check_exist_tujuan_indikator.tujuan_teks,
								id_unik: check_exist_tujuan_indikator.id_unik,
								id_unik_indikator: check_exist_tujuan_indikator.id_unik_indikator,
								is_locked: check_exist_tujuan_indikator.is_locked,
								is_locked_indikator: check_exist_tujuan_indikator.is_locked_indikator
        					}),
        					success: function(ret){
        						resolve_reduce(nextData);
        					}
        				});
        			}else{
        				pesan_loading('Sudah ada indikator tujuan RPD '+current_data.indikator_teks, true);
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
        	cb();
        });
	});
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
		get_tujuan_rpd(opsi)
		.then(function(tujuan_ri){
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
					ret.tujuan = tujuan_ri.data;
					resolve(ret);
				}
			})
		});
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