function rekap_sumber_dana_sub_kegiatan(opsi_rekap={}){
    jQuery('#wrap-loading').show();
    if(opsi_rekap.id_sub_skpd){
    	var id_sub_skpd = opsi_rekap.id_sub_skpd;
    }else{
    	var id_sub_skpd = idunitskpd;
    }
	// get data list sub kegiatan
	relayAjax({
		url: config.sipd_url+'api/renja/sub_bl/list_belanja_by_tahun_daerah_unit',
		type: 'POST',	      				
		data: {            
			id_daerah: _token.daerah_id,				
			tahun: _token.tahun,
			id_unit: id_sub_skpd,
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
            			if(
            				opsi_rekap.id_sub_bl
            				&& opsi_rekap.id_sub_bl != current_data.id_sub_bl
            			){
            				return resolve_reduce(nextData);
            			}
            			console.log('current_data subkeg', current_data);
						var pagudana_sub_keg = 0;
						var pagudana_rincian = 0;
						var html_sumbedana = '';
						var opsi = {
							tidak_kirim_ke_lokal : true,
							hanya_sumber_dana : true,
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
						};
						singkron_rka_ke_lokal(opsi, function(data_rka){
							var substeks_all = {};
							data_rka.rka_all.map(function(rka, i){
								var substeks = jQuery('<textarea>'+rka.subs_bl_teks.substeks+'</textarea>').val()+rka.subs_bl_teks.sumber_dana.id_dana;
								if(!substeks_all[substeks]){
									rka.subs_bl_teks.pagu = 0;
									substeks_all[substeks] = rka.subs_bl_teks;
								}
								substeks_all[substeks].pagu += +rka.rincian;
								pagudana_rincian += +rka.rincian;
							});
							var dataDana = [];
							for(var i in data_rka.dataDana){
								dataDana.push(data_rka.dataDana[i]);
							}
							console.log('dataDana', dataDana, data_rka, substeks_all);
							var check_all = false;
							var pagu_rinci = 0;
							var sumber_dana_rinci = '<td class="text-center">-</td>';
							for(var i in substeks_all){
								var nama_sumber_dana_rinci = '['+substeks_all[i].sumber_dana.kode_dana+'] '+substeks_all[i].sumber_dana.nama_dana+'';
								if(!html_rekap_dana_all[substeks_all[i].sumber_dana.id_dana]){
									html_rekap_dana_all[substeks_all[i].sumber_dana.id_dana] = {
										nama_dana: nama_sumber_dana_rinci,
										pagu: 0,
										rinci: 0
									}
								}
								html_rekap_dana_all[substeks_all[i].sumber_dana.id_dana].rinci += +substeks_all[i].pagu;

								var check = false;
								dataDana.map(function(d, ii){
									if(d.iddana == substeks_all[i].sumber_dana.id_dana){
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
											+'<td class="text-right">'+formatMoney(substeks_all[i].pagu)+'</td>'
										+'</tr>');
									sumber_dana_rinci = '['+substeks_all[i].sumber_dana.kode_dana+'] '+substeks_all[i].sumber_dana.nama_dana+'';
									pagu_rinci += substeks_all[i].pagu;
	    							console.log('Sumber dana ada di rincian tapi tidak ada di sub kegiatan!', substeks_all[i]);
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
		                          		+'<td class="text-right">'+formatMoney(pagu_rinci)+'</td>'
									+'</tr>';
	    						console.log('sub kegiatan', subkeg);
							}
							dataDana.map(function(d, ii){
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
									if(d.iddana == substeks_all[i].sumber_dana.id_dana){
										if(check == false){
											check = [];
										}
										check.push(''
											+'<tr>'
												+'<td>'+i+'</td>'
												+'<td class="text-right">'+formatMoney(substeks_all[i].pagu)+'</td>'
											+'</tr>');
										sumber_dana_rinci = '['+d.kodedana+'] '+d.namadana+'';
										pagu_rinci += substeks_all[i].pagu;
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
		                          		+'<td class="text-right">'+formatMoney(d.pagudana)+'</td>'
		                          		+sumber_dana_rinci
		                          		+'<td class="text-right">'+formatMoney(pagu_rinci)+'</td>'
									+'</tr>';
							});

							var warning = "";
							if(pagudana_sub_keg != pagudana_rincian){
								warning = "background: #ff00003b;";
							}
							html_sumbedana += ''
								+'<tr style="'+warning+'">'
	                          		+'<td colspan="2" class="text-right">'+formatMoney(pagudana_sub_keg)+'</td>'
	                          		+'<td colspan="2" class="text-right">'+formatMoney(pagudana_rincian)+'</td>'
								+'</tr>';

							var warning2 = "";
							if(current_data.pagu != current_data.rincian){
								warning2 = "background: #ff00003b;";
							}
							total_pagu_validasi += +current_data.pagu;
							total_pagu_rinci += +current_data.rincian;
							html_rekap_dana += ''
								+'<tr kode_sbl="'+current_data.kode_sbl+'">'
									+'<td>'+current_data.kode_sub_giat+' '+current_data.nama_sub_giat+'</td>'
	                          		+'<td style="'+warning2+'">'+formatMoney(current_data.pagu)+'</td>'
	                          		+'<td style="'+warning2+'">'+formatMoney(current_data.rincian)+'</td>'
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
            				+'<td class="text-right">'+formatMoney(html_rekap_dana_all[i].pagu)+'</td>'
            				+'<td class="text-right">'+formatMoney(html_rekap_dana_all[i].rinci)+'</td>'
            			+'</tr>';
            		rekap_dana_all_pagu += html_rekap_dana_all[i].pagu;
            		rekap_dana_all_rinci += html_rekap_dana_all[i].rinci;
            	}
            	console.log('html_rekap_dana_all', html_rekap_dana_all);
            	jQuery('#rekap_total_pagu_validasi').text(formatMoney(total_pagu_validasi));
            	jQuery('#rekap_total_pagu_rincian').text(formatMoney(total_pagu_rinci));
            	if(total_pagu_validasi != total_pagu_rinci){
            		jQuery('#rekap_total_pagu_validasi').css('background', '#ff000082');
            		jQuery('#rekap_total_pagu_rincian').css('background', '#ff000082');
            	}else{
            		jQuery('#rekap_total_pagu_validasi').css('background', 'transparent');
            		jQuery('#rekap_total_pagu_rincian').css('background', 'transparent');
            	}
            	jQuery('#rekap_total_sumber_dana_pagu').text(formatMoney(rekap_dana_all_pagu));
            	jQuery('#rekap_total_sumber_dana_rinci').text(formatMoney(rekap_dana_all_rinci));
            	jQuery('#table_sub_keg_modal_sumber_dana_rekap tbody').html(html_rekap_dana_all_table);
            	if(rekap_dana_all_pagu != rekap_dana_all_rinci){
            		jQuery('#rekap_total_sumber_dana_pagu').css('background', '#ff000082');
            		jQuery('#rekap_total_sumber_dana_rinci').css('background', '#ff000082');
            	}else{
            		jQuery('#rekap_total_sumber_dana_pagu').css('background', 'transparent');
            		jQuery('#rekap_total_sumber_dana_rinci').css('background', 'transparent');
            	}

				run_script('show_modal_sumber_dana');
				jQuery('#table_sub_keg_modal_sumber_dana tbody').html(html_rekap_dana);
            	jQuery('#wrap-loading').hide();
            })
            .catch(function(e){
                console.log(e);
            });
		}
	});
}