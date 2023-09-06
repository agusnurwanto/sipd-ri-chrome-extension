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

function rekap_sumber_dana_sub_kegiatan(){
    jQuery('#wrap-loading').show();
	// get data list sub kegiatan
	relayAjax({
		url: config.sipd_url+'api/renja/sub_bl/list_belanja_by_tahun_daerah_unit',
		type: 'POST',	      				
		data: {            
			id_daerah: _token.daerah_id,				
			tahun: _token.tahun,
			id_unit: idunitskpd,
			is_anggaran: global_is_anggaran
		},
		beforeSend: function (xhr) {			    
			xhr.setRequestHeader("X-API-KEY", x_api_key());
			xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
		},
		success: function(subkeg){
			subkeg.data = decrip(subkeg.data);
			var no_tes = 0;
			var html_rekap_dana_all = {};
        	var total_pagu_validasi = 0;
        	var total_pagu_rinci = 0;
			var html_rekap_dana = '';
			var last = subkeg.data.length-1;
			subkeg.data.reduce(function(sequence, nextData){
                return sequence.then(function(current_data){
            		return new Promise(function(resolve_reduce, reject_reduce){
            			console.log('current_data subkeg', current_data);
                    	if(
                    		// current_data.nama_sub_giat.mst_lock == 0 
                    		// && current_data.kode_sub_skpd
                    		current_data.kode_sub_skpd
                    	){
                    		// untuk testing saja, biar tidak menunggu lama
                    		if(
                    			no_tes >= 3
                    			&& false
                    		){
                    			resolve_reduce(nextData);
                    		}
                    		no_tes++;
                    		id_sub_bl = current_data.id_sub_bl;
                    		id_skpd = current_data.id_skpd;
							// kode_get = current_data.action.split("detilGiat('")[1].split("'")[0];
							// get detail sub kegiatan
							relayAjax({
								url: config.sipd_url+'api/renja/rinci_sub_bl/get_by_id_sub_bl',                                    
								type: 'POST',	      				
								data: {            
									id_daerah: _token.daerah_id,				
									tahun: _token.tahun,
									id_sub_bl: id_sub_bl,
									id_unit: id_skpd,
									is_anggaran: global_is_anggaran
								},
								beforeSend: function (xhr) {			    
									xhr.setRequestHeader("X-API-KEY", x_api_key());
									xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
								},
								success: function(subkeg){
									var pagudana_sub_keg = 0;
									var pagudana_rincian = 0;
									var html_sumbedana = '';
									new Promise(function(resolve2, reject2){
										console.log('get detail sub kegiatan',subkeg.data);
										// var aksi = current_data.action.split("main?");
										if(subkeg.data.length > 2){
											var kode_go_hal_rinci = {};
											kode_go_hal_rinci.go_rinci = true;
											// kode_go_hal_rinci.kode = 'main?'+aksi[1].split("'")[0];
											go_halaman_detail_rincian(kode_go_hal_rinci)
											.then(function(kode_get_rinci_all){
												var kode_get_rinci = kode_get_rinci_all.kode_get_rinci;
												var kode_get_rinci_subtitle = kode_get_rinci_all.kode_get_rinci_subtitle;
												// get halaman rincian
												relayAjax({
													url: kode_get_rinci,
													type: 'post',
													data: formData,
													processData: false,
													contentType: false,
													success: function(data){
														var substeks_all = {};
														data.data.map(function(rka, i){
															var substeks = jQuery('<textarea>'+rka.subs_bl_teks.substeks+'</textarea>').val();
															if(!substeks_all[substeks]){
																rka.subs_bl_teks.pagu = 0;
																substeks_all[substeks] = rka.subs_bl_teks;
															}
															substeks_all[substeks].pagu += +rka.rincian;
															pagudana_rincian += +rka.rincian;
														});
														getSumberDanaBelanja(substeks_all, kode_get_rinci_subtitle)
														.then(function(substeks_all_new){
															console.log('substeks_all_new', substeks_all_new, subkeg.dataDana);
															var check_all = false;
															var pagu_rinci = 0;
															var sumber_dana_rinci = '<td class="text-center">-</td>';
															for(var i in substeks_all){
																var nama_sumber_dana_rinci = '['+substeks_all_new[i].sumber_dana.kode_dana+'] '+substeks_all_new[i].sumber_dana.nama_dana+'';
																if(!html_rekap_dana_all[substeks_all_new[i].sumber_dana.id_dana]){
																	html_rekap_dana_all[substeks_all_new[i].sumber_dana.id_dana] = {
																		nama_dana: nama_sumber_dana_rinci,
																		pagu: 0,
																		rinci: 0
																	}
																}
																html_rekap_dana_all[substeks_all_new[i].sumber_dana.id_dana].rinci += +substeks_all_new[i].pagu;

																var check = false;
																subkeg.dataDana.map(function(d, ii){
																	if(d.iddana == substeks_all_new[i].sumber_dana.id_dana){
																		check = true;
																	}
																});
																if(check == false){
																	if(check_all == false){
																		check_all = [];
																	}
																	check_all.push(''
																		+'<tr>'
																			+'<td>'+i+'</td>'
																			+'<td class="text-right">'+formatRupiah(substeks_all_new[i].pagu)+'</td>'
																		+'</tr>');
																	sumber_dana_rinci = '['+substeks_all_new[i].sumber_dana.kode_dana+'] '+substeks_all_new[i].sumber_dana.nama_dana+'';
																	pagu_rinci += substeks_all_new[i].pagu;
									    							console.log('Sumber dana ada di rincian tapi tidak ada di sub kegiatan!', substeks_all_new[i]);
																}
															}
															if(check_all){
																sumber_dana_rinci = ''
																	+'<td>'
																		+sumber_dana_rinci
																		+'<br>'
																		+'<table class="table table-bordered">'
																			+'<thead>'
																				+'<tr>'
																					+'<th>Nama Kelompok</th>'
																					+'<th>Pagu</th>'
																				+'</tr>'
																			+'</thead>'
																			+'<tbody>'
																				+check_all.join('')
																			+'</tbody>'
																		+'</table>'
																	+'</td>';
																html_sumbedana += ''
																	+'<tr iddana="" iddanasubbl="" style="background: #ff00003b;">'
										                          		+'<td class="text-center">-</td>'
										                          		+'<td class="text-center">-</td>'
										                          		+sumber_dana_rinci
										                          		+'<td class="text-right">'+formatRupiah(pagu_rinci)+'</td>'
																	+'</tr>';
									    						console.log('sub kegiatan', subkeg);
															}
															subkeg.dataDana.map(function(d, ii){
																var nama_sumber_dana_pagu = '['+d.kodedana+'] '+d.namadana+'';
																if(!html_rekap_dana_all[d.iddana]){
																	html_rekap_dana_all[d.iddana] = {
																		nama_dana: nama_sumber_dana_pagu,
																		pagu: 0,
																		rinci: 0
																	}
																}
																html_rekap_dana_all[d.iddana].pagu += +d.pagudana;

																var check = false;
																var pagu_rinci = 0;
																var sumber_dana_rinci = '<td class="text-center">-</td>';
																pagudana_sub_keg += +d.pagudana;
																for(var i in substeks_all){
																	if(d.iddana == substeks_all_new[i].sumber_dana.id_dana){
																		if(check == false){
																			check = [];
																		}
																		check.push(''
																			+'<tr>'
																				+'<td>'+i+'</td>'
																				+'<td class="text-right">'+formatRupiah(substeks_all_new[i].pagu)+'</td>'
																			+'</tr>');
																		sumber_dana_rinci = '['+d.kodedana+'] '+d.namadana+'';
																		pagu_rinci += substeks_all_new[i].pagu;
																	}
																}
																var warning3 = '';
																if(check){
																	sumber_dana_rinci = ''
																		+'<td>'
																			+sumber_dana_rinci
																			+'<br>'
																			+'<table class="table table-bordered">'
																				+'<thead>'
																					+'<tr>'
																						+'<th>Nama Kelompok</th>'
																						+'<th>Pagu</th>'
																					+'</tr>'
																				+'</thead>'
																				+'<tbody>'
																					+check.join('')
																				+'</tbody>'
																			+'</table>'
																		+'</td>';
																}else{
																	warning3 = 'background: #ff00003b;';
																}
																html_sumbedana += ''
																	+'<tr style="'+warning3+'" iddana="'+d.iddana+'" iddanasubbl="'+d.iddanasubbl+'">'
										                          		+'<td>['+d.kodedana+'] '+d.namadana+'</td>'
										                          		+'<td class="text-right">'+formatRupiah(d.pagudana)+'</td>'
										                          		+sumber_dana_rinci
										                          		+'<td class="text-right">'+formatRupiah(pagu_rinci)+'</td>'
																	+'</tr>';
															});
										    				resolve2();
														});
													}
												});
											});
										}else{
											subkeg.dataDana.map(function(d, i){
												html_sumbedana += ''
													+'<tr iddana="'+d.iddana+'" iddanasubbl="'+d.iddanasubbl+'">'
						                          		+'<td>'+d.kodedana+' '+d.namadana+'</td>'
						                          		+'<td class="text-right">'+formatRupiah(d.pagudana)+'</td>'
						                          		+'<td class="text-center">-</td>'
						                          		+'<td class="text-center">-</td>'
													+'</tr>';
											});
										    console.log('RENJA tanpa rincian!', subkeg);
										    resolve2();
										}
									}).then(function(){
										var warning = "";
										if(pagudana_sub_keg != pagudana_rincian){
											warning = "background: #ff00003b;";
										}
										html_sumbedana += ''
											+'<tr style="'+warning+'">'
				                          		+'<td colspan="2" class="text-right">'+formatRupiah(pagudana_sub_keg)+'</td>'
				                          		+'<td colspan="2" class="text-right">'+formatRupiah(pagudana_rincian)+'</td>'
											+'</tr>';

										var warning2 = "";
										if(current_data.nama_sub_giat.pagu != current_data.nama_sub_giat.rincian){
											warning2 = "background: #ff00003b;";
										}
										total_pagu_validasi += +current_data.nama_sub_giat.pagu;
										total_pagu_rinci += +current_data.nama_sub_giat.rincian;
										html_rekap_dana += ''
											+'<tr kode_sbl="'+current_data.kode_sbl+'">'
												+'<td>'+current_data.nama_sub_giat.nama_sub_giat+'</td>'
				                          		+'<td style="'+warning2+'">'+formatRupiah(current_data.nama_sub_giat.pagu)+'</td>'
				                          		+'<td style="'+warning2+'">'+formatRupiah(current_data.nama_sub_giat.rincian)+'</td>'
				                          		+'<td>'
				                          			+'<table class="table table-bordered">'
				                          				+'<thead>'
				                          					+'<tr>'
				                          						+'<th class="text-center">Sumber Dana Sub Kegiatan</th>'
				                          						+'<th class="text-center">Pagu Sumber Dana Sub Kegiatan</th>'
				                          						+'<th class="text-center">Sumber Dana Rincian</th>'
				                          						+'<th class="text-center">Pagu Sumber Dana Rincian</th>'
				                          					+'</tr>'
				                          				+'</thead>'
				                          				+'<tbody>'
				                          					+html_sumbedana
				                          				+'</tbody>'
				                          			+'</table>'
				                          		+'</td>'
											+'</tr>';
									    resolve_reduce(nextData);
									})
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
            }, Promise.resolve(subkeg.data[last]))
            .then(function(data_last){
            	var rekap_dana_all_pagu = 0;
            	var rekap_dana_all_rinci = 0;
            	var html_rekap_dana_all_table = '';
            	for(var i in html_rekap_dana_all){
            		var warning = '';
            		if(html_rekap_dana_all[i].pagu != html_rekap_dana_all[i].rinci){
            			warning = 'background: #ff00003b;';
            		}
            		html_rekap_dana_all_table += ''
            			+'<tr style="'+warning+'">'
            				+'<td>'+html_rekap_dana_all[i].nama_dana+'</td>'
            				+'<td class="text-right">'+formatRupiah(html_rekap_dana_all[i].pagu)+'</td>'
            				+'<td class="text-right">'+formatRupiah(html_rekap_dana_all[i].rinci)+'</td>'
            			+'</tr>';
            		rekap_dana_all_pagu += html_rekap_dana_all[i].pagu;
            		rekap_dana_all_rinci += html_rekap_dana_all[i].rinci;
            	}
            	console.log('html_rekap_dana_all', html_rekap_dana_all);
            	jQuery('#rekap_total_pagu_validasi').text(formatRupiah(total_pagu_validasi));
            	jQuery('#rekap_total_pagu_rincian').text(formatRupiah(total_pagu_rinci));
            	if(total_pagu_validasi != total_pagu_rinci){
            		jQuery('#rekap_total_pagu_validasi').css('background', '#ff000082');
            		jQuery('#rekap_total_pagu_rincian').css('background', '#ff000082');
            	}else{
            		jQuery('#rekap_total_pagu_validasi').css('background', 'transparent');
            		jQuery('#rekap_total_pagu_rincian').css('background', 'transparent');
            	}
            	jQuery('#rekap_total_sumber_dana_pagu').text(formatRupiah(rekap_dana_all_pagu));
            	jQuery('#rekap_total_sumber_dana_rinci').text(formatRupiah(rekap_dana_all_rinci));
            	jQuery('#table_sub_keg_modal_sumber_dana_rekap tbody').html(html_rekap_dana_all_table);
            	if(rekap_dana_all_pagu != rekap_dana_all_rinci){
            		jQuery('#rekap_total_sumber_dana_pagu').css('background', '#ff000082');
            		jQuery('#rekap_total_sumber_dana_rinci').css('background', '#ff000082');
            	}else{
            		jQuery('#rekap_total_sumber_dana_pagu').css('background', 'transparent');
            		jQuery('#rekap_total_sumber_dana_rinci').css('background', 'transparent');
            	}

				run_script('jQuery("#table_sub_keg_modal_sumber_dana").DataTable().destroy();');
				jQuery('#table_sub_keg_modal_sumber_dana tbody').html(html_rekap_dana);
				run_script('jQuery("#table_sub_keg_modal_sumber_dana").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
				run_script('jQuery("#mod-rekap-sumber-dana-sub-keg").modal("show");');
            	jQuery('#wrap-loading').hide();
            })
            .catch(function(e){
                console.log(e);
            });
		}
	});
}

function rekap_sumber_dana_sub_kegiatan_rinci(){
    jQuery('#wrap-loading').show();
	var html_rekap_dana = '';
    // var kode_sbl = kodesbl;
	// get_kode_from_rincian_page(false, kode_sbl)
	list_belanja_by_tahun_daerah_unit(idunitskpd)
	.then(function(data_sbl){		
		// kode_get = data_sbl.url;
		data_sbl.data = decrip(data_sbl.data);
		var last = data_sbl.data.length-1;
		data_sbl.data.reduce(function(sequence, nextData){
			return sequence.then(function(current_data){
				return new Promise(function(resolve_reduce, reject_reduce){
					console.log('rekap_sumber_dana_sub_kegiatan_rinci subkeg', current_data);
					id_sub_bl = current_data.id_sub_bl;
					id_skpd = current_data.id_skpd;
					
					// get detail sub kegiatan
					relayAjax({
						url: config.sipd_url+'api/renja/rinci_sub_bl/get_by_id_sub_bl',                                    
						type: 'POST',	      				
						data: {            
							id_daerah: _token.daerah_id,				
							tahun: _token.tahun,
							id_sub_bl: id_sub_bl,
							id_unit: id_skpd,
							is_anggaran: global_is_anggaran
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", x_api_key());
							xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
						},
						success: function(subkeg){
							var _leng = 500;
							if(config.jml_rincian){
								_leng = config.jml_rincian;
							}
							var _data_all = [];
							var _data = [];
							subkeg.data.map(function(rka, i){
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

							var html_rekap_dana_all = {};
							var pagudana_sub_keg = 0;
							var pagudana_rincian = 0;
							var html_sumbedana = '';
							var substeks_all = {};
							_data_all.reduce(function(sequence, nextData){
							return sequence.then(function(current_data){
								return new Promise(function(resolve_reduce, reject_reduce){
									// console.log('RKA',current_data);
									current_data.map(function(val, n){
										return new Promise(function(resolve, reject){
											detail_rincian_sub_bl(val).then(function(detail){
												console.log('detail_rincian_sub_bl',detail.data[0]);
												detail = detail.data[0];
												get_subs_sub_bl(val.id_subs_sub_bl).then(function(subs_sub_bl){	
													console.log('subs_sub_bl',subs_sub_bl.data);
													var substeks = jQuery('<textarea>'+subs_sub_bl.data[0].subs_bl_teks+'</textarea>').val();
													if(!substeks_all[substeks]){
														subs_sub_bl.pagu = 0;														
														substeks_all[substeks] = subs_sub_bl.data[0].subs_bl_teks;
													}
													substeks_all[substeks].pagu += +subs_sub_bl.rincian;
													pagudana_rincian += +subs_sub_bl.rincian;
												});			

												dana_sub_bl(detail.id_sub_bl).then(function(res){
													// console.log('substeks_all_new', substeks_all_new, subkeg.dataDana);
													console.log('substeks_all_new', res);
													// console.log('substeks_all_new', substeks_all_new);
													var substeks_all_new = {};
													var check_all = false;
													var pagu_rinci = 0;
													var sumber_dana_rinci = '<td class="text-center">-</td>';
													res.data.map(function(d, i){
														substeks_all_new[i] = {};
														substeks_all_new[i].namadana = d.nama_dana;
														substeks_all_new[i].kodedana = d.kode_dana;
														substeks_all_new[i].iddana = d.id_dana;
														substeks_all_new[i].iddanasubbl = d.id_dana_sub_bl;
														substeks_all_new[i].pagudana = d.pagu_dana;
														substeks_all_new[i].id_sub_bl = d.id_sub_bl; //baru	
													});
													for(var i in substeks_all){
														var nama_sumber_dana_rinci = '['+substeks_all_new[i].kodedana+'] '+substeks_all_new[i].namadana+'';
														if(!html_rekap_dana_all[substeks_all_new[i].iddana]){
															html_rekap_dana_all[substeks_all_new[i].iddana] = {
																nama_dana: namadana,
																pagu: 0,
																rinci: 0
															}
														}
														html_rekap_dana_all[substeks_all_new[i].iddana].rinci += +substeks_all_new[i].pagu;

														var check = false;
														subkeg.dataDana.map(function(d, ii){
															if(d.iddana == substeks_all_new[i].iddana){
																check = true;
															}
														});
														if(check == false){
															if(check_all == false){
																check_all = [];
															}
															check_all.push(''
																+'<tr>'
																	+'<td>'+i+'</td>'
																	+'<td class="text-right">'+formatRupiah(substeks_all_new[i].pagu)+'</td>'
																+'</tr>');
															sumber_dana_rinci = '['+substeks_all_new[i].kodedana+'] '+substeks_all_new[i].nama_dana+'';
															pagu_rinci += substeks_all_new[i].pagu;
							    							console.log('Sumber dana ada di rincian tapi tidak ada di sub kegiatan!', substeks_all_new[i]);
														}
													}
													if(check_all){
														sumber_dana_rinci = ''
															+'<td>'
																+sumber_dana_rinci
																+'<br>'
																+'<table class="table table-bordered">'
																	+'<thead>'
																		+'<tr>'
																			+'<th>Nama Kelompok</th>'
																			+'<th>Pagu</th>'
																		+'</tr>'
																	+'</thead>'
																	+'<tbody>'
																		+check_all.join('')
																	+'</tbody>'
																+'</table>'
															+'</td>';
														html_sumbedana += ''
															+'<tr iddana="" iddanasubbl="" style="background: #ff00003b;">'
								                          		+'<td class="text-center">-</td>'
								                          		+'<td class="text-center">-</td>'
								                          		+sumber_dana_rinci
								                          		+'<td class="text-right">'+formatRupiah(pagu_rinci)+'</td>'
															+'</tr>';
							    						console.log('sub kegiatan', subkeg);
													}
													subkeg.dataDana.map(function(d, ii){
														var nama_sumber_dana_pagu = '['+d.kodedana+'] '+d.namadana+'';
														if(!html_rekap_dana_all[d.iddana]){
															html_rekap_dana_all[d.iddana] = {
																nama_dana: nama_sumber_dana_pagu,
																pagu: 0,
																rinci: 0
															}
														}
														html_rekap_dana_all[d.iddana].pagu += +d.pagudana;

														var check = false;
														var pagu_rinci = 0;
														var sumber_dana_rinci = '<td class="text-center">-</td>';
														pagudana_sub_keg += +d.pagudana;
														for(var i in substeks_all){
															if(d.iddana == substeks_all_new[i].sumber_dana.id_dana){
																if(check == false){
																	check = [];
																}
																check.push(''
																	+'<tr>'
																		+'<td style="word-break: break-all;">'+i+'</td>'
																		+'<td class="text-right">'+formatRupiah(substeks_all_new[i].pagu)+'</td>'
																	+'</tr>');
																sumber_dana_rinci = '['+d.kodedana+'] '+d.namadana+'';
																pagu_rinci += substeks_all_new[i].pagu;
															}
														}
														var warning3 = '';
														if(check){
															sumber_dana_rinci = ''
																+'<td>'
																	+sumber_dana_rinci
																	+'<br>'
																	+'<table class="table table-bordered">'
																		+'<thead>'
																			+'<tr>'
																				+'<th>Nama Kelompok</th>'
																				+'<th>Pagu</th>'
																			+'</tr>'
																		+'</thead>'
																		+'<tbody>'
																			+check.join('')
																		+'</tbody>'
																	+'</table>'
																+'</td>';
														}else{
															warning3 = 'background: #ff00003b;';
														}
														html_sumbedana += ''
															+'<tr style="'+warning3+'" iddana="'+d.iddana+'" iddanasubbl="'+d.iddanasubbl+'">'
								                          		+'<td>['+d.kodedana+'] '+d.namadana+'</td>'
								                          		+'<td class="text-right">'+formatRupiah(d.pagudana)+'</td>'
								                          		+sumber_dana_rinci
								                          		+'<td class="text-right">'+formatRupiah(pagu_rinci)+'</td>'
															+'</tr>';
													});
								    				resolve();
												})
											// }).then(function(ret){
											}).then(function(){
												//val.detail_rincian_sub_bl = ret.data;
												
												//return resolve(val);
											});
										})
										.catch(function(e){
											console.log(e);
											return Promise.resolve(val);
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
						}, Promise.resolve(_data_all[last]))
						.then(function(data_last){
							console.log(data_last);
							hide_loading();        
						})
						.catch(function(e){
							console.log(e);
						});

							// new Promise(function(resolve2, reject2){
							// 	var kode_go_hal_rinci = {
							// 		go_rinci: false,
							// 		kode: lru1
							// 	};
							// 	go_halaman_detail_rincian(kode_go_hal_rinci)
							// 	.then(function(kode_get_rinci_all){
							// 		var kode_get_rinci = kode_get_rinci_all.kode_get_rinci;
							// 		var kode_get_rinci_subtitle = kode_get_rinci_all.kode_get_rinci_subtitle;
							// 		// get halaman rincian
							// 		relayAjax({
							// 			url: kode_get_rinci,
							// 			type: 'post',
							// 			data: formData,
							// 			processData: false,
							// 			contentType: false,
							// 			success: function(data){
							// 				var substeks_all = {};
							// 				data.data.map(function(rka, i){
							// 					var substeks = jQuery('<textarea>'+rka.subs_bl_teks.substeks+'</textarea>').val();
							// 					if(!substeks_all[substeks]){
							// 						rka.subs_bl_teks.pagu = 0;
							// 						rka.subs_bl_teks.action = rka.action;
							// 						substeks_all[substeks] = rka.subs_bl_teks;
							// 					}
							// 					substeks_all[substeks].pagu += +rka.rincian;
							// 					pagudana_rincian += +rka.rincian;
							// 				});

							// 				new Promise(function(resolve, reject){
							// 					// cek jika user bisa edit data / ada form edit
							// 					if(jQuery('select[name="sumberdana"]').length >= 1){
							// 						var sumberdana = jQuery('select[name="sumberdana"] option').eq(1).attr('value');
							// 						if(!sumberdana){
							// 							alert('Kelompok kosong! dan Sumber dana belum diset di sub kegiatan!');
							// 							return resolve();
							// 						}

							// 						// jika posisi tombol tambah rincian aktif, otomatis edit text kelompok yang null menjadi tulisan kosong
							// 						var subtitle_all = [];
							// 						jQuery('select[name="subtitle"] option').map(function(i, b){
							// 							var val = jQuery(b).attr('value');
							// 							var text = jQuery(b).text();
							// 							if(text == ''){
							// 								subtitle_all.push(val);
							// 							}
							// 						});
							// 						var sendData = subtitle_all.map(function(idsubtitle, i){
							// 				    		return new Promise(function(resolve3, reject3){
							// 					    		var formDataCustom = new FormData();
							// 								formDataCustom.append('_token', tokek);
							// 								formDataCustom.append('v1bnA1m', v1bnA1m);
							// 								formDataCustom.append('DsK121m', Curut("jenis_subtitle=2&sumberdana="+sumberdana+"&subtitle_add=kosong"+i+"&subtitle_tmp=&aksi_subs=ubah&id_subs_sbl="+idsubtitle));
							// 					    		relayAjax({
							// 									url: lru11,
							// 									type: 'post',
							// 									data: formDataCustom,
							// 									processData: false,
							// 									contentType: false,
							// 									success: function(data){
							// 										resolve3();
							// 									}
							// 								});
							// 							});
							// 				    	});
							// 					    Promise.all(sendData)
							// 					    .then(function(){
							// 					    	resolve();
							// 					    });
							// 					}else{
							// 					    resolve();
							// 					}
							// 				})
							// 				.then(function(){
							// 					getSumberDanaBelanja(substeks_all, kode_get_rinci_subtitle)
							// 					.then(function(substeks_all_new){
							// 						console.log('substeks_all_new', substeks_all_new, subkeg.dataDana);
							// 						var check_all = false;
							// 						var pagu_rinci = 0;
							// 						var sumber_dana_rinci = '<td class="text-center">-</td>';
							// 						for(var i in substeks_all){
							// 							var nama_sumber_dana_rinci = '['+substeks_all_new[i].sumber_dana.kode_dana+'] '+substeks_all_new[i].sumber_dana.nama_dana+'';
							// 							if(!html_rekap_dana_all[substeks_all_new[i].sumber_dana.id_dana]){
							// 								html_rekap_dana_all[substeks_all_new[i].sumber_dana.id_dana] = {
							// 									nama_dana: nama_sumber_dana_rinci,
							// 									pagu: 0,
							// 									rinci: 0
							// 								}
							// 							}
							// 							html_rekap_dana_all[substeks_all_new[i].sumber_dana.id_dana].rinci += +substeks_all_new[i].pagu;

							// 							var check = false;
							// 							subkeg.dataDana.map(function(d, ii){
							// 								if(d.iddana == substeks_all_new[i].sumber_dana.id_dana){
							// 									check = true;
							// 								}
							// 							});
							// 							if(check == false){
							// 								if(check_all == false){
							// 									check_all = [];
							// 								}
							// 								check_all.push(''
							// 									+'<tr>'
							// 										+'<td>'+i+'</td>'
							// 										+'<td class="text-right">'+formatRupiah(substeks_all_new[i].pagu)+'</td>'
							// 									+'</tr>');
							// 								sumber_dana_rinci = '['+substeks_all_new[i].sumber_dana.kode_dana+'] '+substeks_all_new[i].sumber_dana.nama_dana+'';
							// 								pagu_rinci += substeks_all_new[i].pagu;
							//     							console.log('Sumber dana ada di rincian tapi tidak ada di sub kegiatan!', substeks_all_new[i]);
							// 							}
							// 						}
							// 						if(check_all){
							// 							sumber_dana_rinci = ''
							// 								+'<td>'
							// 									+sumber_dana_rinci
							// 									+'<br>'
							// 									+'<table class="table table-bordered">'
							// 										+'<thead>'
							// 											+'<tr>'
							// 												+'<th>Nama Kelompok</th>'
							// 												+'<th>Pagu</th>'
							// 											+'</tr>'
							// 										+'</thead>'
							// 										+'<tbody>'
							// 											+check_all.join('')
							// 										+'</tbody>'
							// 									+'</table>'
							// 								+'</td>';
							// 							html_sumbedana += ''
							// 								+'<tr iddana="" iddanasubbl="" style="background: #ff00003b;">'
							// 	                          		+'<td class="text-center">-</td>'
							// 	                          		+'<td class="text-center">-</td>'
							// 	                          		+sumber_dana_rinci
							// 	                          		+'<td class="text-right">'+formatRupiah(pagu_rinci)+'</td>'
							// 								+'</tr>';
							//     						console.log('sub kegiatan', subkeg);
							// 						}
							// 						subkeg.dataDana.map(function(d, ii){
							// 							var nama_sumber_dana_pagu = '['+d.kodedana+'] '+d.namadana+'';
							// 							if(!html_rekap_dana_all[d.iddana]){
							// 								html_rekap_dana_all[d.iddana] = {
							// 									nama_dana: nama_sumber_dana_pagu,
							// 									pagu: 0,
							// 									rinci: 0
							// 								}
							// 							}
							// 							html_rekap_dana_all[d.iddana].pagu += +d.pagudana;

							// 							var check = false;
							// 							var pagu_rinci = 0;
							// 							var sumber_dana_rinci = '<td class="text-center">-</td>';
							// 							pagudana_sub_keg += +d.pagudana;
							// 							for(var i in substeks_all){
							// 								if(d.iddana == substeks_all_new[i].sumber_dana.id_dana){
							// 									if(check == false){
							// 										check = [];
							// 									}
							// 									check.push(''
							// 										+'<tr>'
							// 											+'<td style="word-break: break-all;">'+i+'</td>'
							// 											+'<td class="text-right">'+formatRupiah(substeks_all_new[i].pagu)+'</td>'
							// 										+'</tr>');
							// 									sumber_dana_rinci = '['+d.kodedana+'] '+d.namadana+'';
							// 									pagu_rinci += substeks_all_new[i].pagu;
							// 								}
							// 							}
							// 							var warning3 = '';
							// 							if(check){
							// 								sumber_dana_rinci = ''
							// 									+'<td>'
							// 										+sumber_dana_rinci
							// 										+'<br>'
							// 										+'<table class="table table-bordered">'
							// 											+'<thead>'
							// 												+'<tr>'
							// 													+'<th>Nama Kelompok</th>'
							// 													+'<th>Pagu</th>'
							// 												+'</tr>'
							// 											+'</thead>'
							// 											+'<tbody>'
							// 												+check.join('')
							// 											+'</tbody>'
							// 										+'</table>'
							// 									+'</td>';
							// 							}else{
							// 								warning3 = 'background: #ff00003b;';
							// 							}
							// 							html_sumbedana += ''
							// 								+'<tr style="'+warning3+'" iddana="'+d.iddana+'" iddanasubbl="'+d.iddanasubbl+'">'
							// 	                          		+'<td>['+d.kodedana+'] '+d.namadana+'</td>'
							// 	                          		+'<td class="text-right">'+formatRupiah(d.pagudana)+'</td>'
							// 	                          		+sumber_dana_rinci
							// 	                          		+'<td class="text-right">'+formatRupiah(pagu_rinci)+'</td>'
							// 								+'</tr>';
							// 						});
							// // 	    				resolve2();
							// 					});
							// 				});
							// 			}
							// 		});
							// 	});
							// }).then(function(){
							// 	var warning = "";
							// 	if(pagudana_sub_keg != pagudana_rincian){
							// 		warning = "background: #ff00003b;";
							// 	}
							// 	html_sumbedana += ''
							// 		+'<tr style="'+warning+'">'
			                //       		+'<td colspan="2" class="text-right">'+formatRupiah(pagudana_sub_keg)+'</td>'
			                //       		+'<td colspan="2" class="text-right">'+formatRupiah(pagudana_rincian)+'</td>'
							// 		+'</tr>';

							// 	var warning2 = "";
							// 	if(subkeg.dataBl[0].pagu != pagudana_rincian){
							// 		warning2 = "background: #ff00003b;";
							// 	}
							// 	html_rekap_dana += ''
							// 		+'<tr kode_sbl="'+subkeg.kode_sbl+'">'
							// 			+'<td>'+subkeg.dataBl[0].nama_sub_giat+'</td>'
			                //       		+'<td style="'+warning2+'">'+formatRupiah(subkeg.dataBl[0].pagu)+'</td>'
			                //       		+'<td style="'+warning2+'">'+formatRupiah(pagudana_rincian)+'</td>'
			                //       		+'<td>'
			                //       			+'<table class="table table-bordered">'
			                //       				+'<thead>'
			                //       					+'<tr>'
			                //       						+'<th class="text-center">Sumber Dana Sub Kegiatan</th>'
			                //       						+'<th class="text-center">Pagu Sumber Dana Sub Kegiatan</th>'
			                //       						+'<th class="text-center" style="width: 500px;">Sumber Dana Rincian</th>'
			                //       						+'<th class="text-center">Pagu Sumber Dana Rincian</th>'
			                //       					+'</tr>'
			                //       				+'</thead>'
			                //       				+'<tbody>'
			                //       					+html_sumbedana
			                //       				+'</tbody>'
			                //       			+'</table>'
			                //       		+'</td>'
							// 		+'</tr>';

				            // 	var rekap_dana_all_pagu = 0;
				            // 	var rekap_dana_all_rinci = 0;
				            // 	var html_rekap_dana_all_table = '';
				            // 	for(var i in html_rekap_dana_all){
				            // 		var warning = '';
				            // 		if(html_rekap_dana_all[i].pagu != html_rekap_dana_all[i].rinci){
				            // 			warning = 'background: #ff00003b;';
				            // 		}
				            // 		html_rekap_dana_all_table += ''
				            // 			+'<tr style="'+warning+'">'
				            // 				+'<td>'+html_rekap_dana_all[i].nama_dana+'</td>'
				            // 				+'<td class="text-right">'+formatRupiah(html_rekap_dana_all[i].pagu)+'</td>'
				            // 				+'<td class="text-right">'+formatRupiah(html_rekap_dana_all[i].rinci)+'</td>'
				            // 			+'</tr>';
				            // 		rekap_dana_all_pagu += html_rekap_dana_all[i].pagu;
				            // 		rekap_dana_all_rinci += html_rekap_dana_all[i].rinci;
				            // 	}
				            // 	console.log('html_rekap_dana_all', html_rekap_dana_all);
				            // 	jQuery('#rekap_total_pagu_validasi').text(formatRupiah(subkeg.dataBl[0].pagu));
				            // 	jQuery('#rekap_total_pagu_rincian').text(formatRupiah(pagudana_rincian));
				            // 	if(subkeg.dataBl[0].pagu != pagudana_rincian){
				            // 		jQuery('#rekap_total_pagu_validasi').css('background', '#ff000082');
				            // 		jQuery('#rekap_total_pagu_rincian').css('background', '#ff000082');
				            // 	}else{
				            // 		jQuery('#rekap_total_pagu_validasi').css('background', 'transparent');
				            // 		jQuery('#rekap_total_pagu_rincian').css('background', 'transparent');
				            // 	}
				            // 	jQuery('#rekap_total_sumber_dana_pagu').text(formatRupiah(rekap_dana_all_pagu));
				            // 	jQuery('#rekap_total_sumber_dana_rinci').text(formatRupiah(rekap_dana_all_rinci));
				            // 	jQuery('#table_sub_keg_modal_sumber_dana_rekap tbody').html(html_rekap_dana_all_table);
				            // 	if(rekap_dana_all_pagu != rekap_dana_all_rinci){
				            // 		jQuery('#rekap_total_sumber_dana_pagu').css('background', '#ff000082');
				            // 		jQuery('#rekap_total_sumber_dana_rinci').css('background', '#ff000082');
				            // 	}else{
				            // 		jQuery('#rekap_total_sumber_dana_pagu').css('background', 'transparent');
				            // 		jQuery('#rekap_total_sumber_dana_rinci').css('background', 'transparent');
				            // 	}

			            	// 	console.log('html_rekap_dana_all', html_rekap_dana_all);
							// 	run_script('jQuery("#table_sub_keg_modal_sumber_dana").DataTable().destroy();');
							// 	jQuery('#table_sub_keg_modal_sumber_dana tbody').html(html_rekap_dana);
							// 	run_script('jQuery("#table_sub_keg_modal_sumber_dana").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
							// 	run_script('jQuery("#mod-rekap-sumber-dana-sub-keg").modal("show");');
						    // 	jQuery('#wrap-loading').hide();
							// })
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
		}, Promise.resolve(data_sbl.data[last]))
		.catch(function(e){
            console.log(e);
        });
	});
}

function get_kode_from_rincian_page(opsi, kode_sbl){
	return new Promise(function(resolve, reject){
		if(!opsi || !opsi.kode_bl){
			var url_sub_keg = jQuery('.white-box .p-b-20 a.btn-circle').attr('href');
			relayAjax({
				url: url_sub_keg,
				success: function(html){
					var url_list_sub = html.split('lru8="')[1].split('"')[0];
					relayAjax({
						url: url_list_sub,
						type: 'POST',
						data: formData,
						processData: false,
						contentType: false,
						success: function(subkeg){
							var cek = false;
							// ganti menjadi true jika ingin mengsingkronkan sub keg yang tergembok / nomenklatur lama
							var allow_lock_subkeg = false;
							subkeg.data.map(function(b, i){
								if(
									(
										allow_lock_subkeg 
										|| b.nama_sub_giat.mst_lock == 0
									)
									&& b.kode_sub_skpd
									&& b.kode_sbl == kode_sbl
								){
									cek = true;
									return resolve({ url: b.action.split("detilGiat('")[1].split("'")[0], data: b });
								}
							});
							if(!cek){
								alert('Sub kegiatan ini tidak ditemukan di SIPD. (Sub kegiatan tergembok / sudah dihapus)');
							}
						}
					});
				}
			});
		}else{
			return resolve(false);
		}
	});
}