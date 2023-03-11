function open_modal_skpd(){
	window.rka_all = {};
	var body = '';
	var cek_unit = idunitskpd;
	if(cek_unit == 0){
		show_loading();
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/list_skpd',
			cache: true,
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
				length: 10000
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(units){
				console.log('data', units.data);
				window.units_skpd = units.data;				
				units.data.map(function(b, i){
					var keyword = b.id_skpd+'-'+b.id_unit;
					rka_all[keyword] = b;
					body += ''
						+'<tr>'								
							+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
							+'<td>'+b.kode_skpd+' - '+b.nama_skpd+'</td>'
							+'<td>-</td>'								
						+'</tr>';
				});
				jQuery('#table-extension tbody').html(body);
				run_script('show_modal_sm');
				hide_loading();
			}
		});
	}else{
		//singkron_rka_ke_lokal_all(idunitskpd);
		show_loading();	
		let units= [{
			tahun: _token.tahun,
			id_daerah: _token.id_daerah,
			id_unit: cek_unit,
			id_skpd: cek_unit,
			nama_skpd: _token.nama_skpd,
			kode_skpd: _token.kode_skpd
		}];
		units.map(function(b, i){
			var keyword = b.id_skpd+'-'+b.id_unit;
			rka_all[keyword] = b;
			body += ''
			+'<tr>'								
				+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
				+'<td>'+b.kode_skpd+' - '+b.nama_skpd+'</td>'
				+'<td>-</td>'								
			+'</tr>';
		});
		jQuery('#table-extension tbody').html(body);
		run_script('show_modal_sm');
		hide_loading();
	}	
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

function singkron_rka_ke_lokal_all(opsi_unit, callback) {
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
				console.log(current_data);
    			// relayAjax({
				// 	url: endog + '?' + current_data.nama_skpd.sParam,
				// 	success: function(html){
				// 		var kode_get = html.split('lru8="')[1].split('"')[0];
				// 		current_data.kode_get = kode_get;
            			singkron_rka_ke_lokal_all(current_data, function(){
            				console.log('next reduce', nextData);
							resolve_reduce(nextData);
            			});
            	// 	}
            	// });
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
		jQuery('#wrap-loading').show();
		var id_unit = opsi_unit.id_skpd;
		if(opsi_unit && opsi_unit.id_skpd){
			tahun = opsi_unit.tahun;
			id_daerah = opsi_unit.id_daerah;
			id_unit = opsi_unit.id_skpd;
			console.log('opsi_unit', opsi_unit);
			get_skpd(tahun, id_daerah, opsi_unit.id_skpd).then(function(skpd){
				console.log('skpd', skpd);
				var opsi = { 
					action: 'set_unit_pagu',
					type: 'ri',
					api_key: config.api_key,
					tahun_anggaran: _token.tahun,
					data : {
				// 		batasanpagu : opsi_unit.batasanpagu,
						id_daerah : opsi_unit.id_daerah,
				// 		id_level : opsi_unit.id_level,
						id_skpd : opsi_unit.id_skpd,
						id_unit : opsi_unit.id_unit,
				// 		id_user : opsi_unit.id_user,
				// 		is_anggaran : opsi_unit.is_anggaran,
				// 		is_deleted : opsi_unit.is_deleted,
				// 		is_komponen : opsi_unit.is_komponen,
						is_locked : skpd.data[0].is_locked,
						is_skpd : skpd.data[0].is_skpd,
						kode_skpd : opsi_unit.kode_skpd,
				// 		kunci_bl : opsi_unit.kunci_bl,
				// 		kunci_bl_rinci : opsi_unit.kunci_bl_rinci,
				// 		kuncibl : opsi_unit.kuncibl,
				// 		kunciblrinci : opsi_unit.kunciblrinci,
				// 		nilaipagu : opsi_unit.nilaipagu,
				// 		nilaipagumurni : opsi_unit.nilaipagumurni,
				// 		nilairincian : opsi_unit.nilairincian,
				// 		pagu_giat : opsi_unit.pagu_giat,
				// 		realisasi : opsi_unit.realisasi,
						rinci_giat : opsi_unit.rinci_giat,
						set_pagu_giat : opsi_unit.set_pagu_giat,
						set_pagu_skpd : opsi_unit.set_pagu_skpd,
						tahun : opsi_unit.tahun,
						total_giat : opsi_unit.total_giat,					
				// 		totalgiat : opsi_unit.totalgiat
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
		}

		if(typeof promise_nonactive == 'undefined'){
			window.promise_nonactive = {};
		}
		var url_get_unit = lru8;
		if(opsi_unit && opsi_unit.kode_get){
			url_get_unit = opsi_unit.kode_get;
		}
		relayAjax({
			url: url_get_unit,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			success: function(subkeg){
				// ubah status sub_keg_bl jadi tidak aktif semua agar jika ada sub keg yang dihapus, sipd lokal bisa ikut terupdate
				new Promise(function(resolve_reduce_nonactive, reject_reduce_nonactive){
					promise_nonactive[id_unit] = resolve_reduce_nonactive;
					var subkeg_aktif = [];
					subkeg.data.map(function(b, i){
						if(
							b.nama_sub_giat.mst_lock == 0
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
									api_key: config.api_key,
									tahun_anggaran: config.tahun_anggaran,
									id_unit: id_unit,
									subkeg_aktif: subkeg_aktif
							    },
				    			return: true
							}
					    }
					};
					chrome.runtime.sendMessage(data, function(response) {
					    console.log('responeMessage', response);
					});
				}).then(function(){
					if(opsi_unit && opsi_unit.id_skpd){
						var cat_wp = '';
						var last = subkeg.data.length-1;
						subkeg.data.reduce(function(sequence, nextData){
		                    return sequence.then(function(current_data){
		                		return new Promise(function(resolve_reduce, reject_reduce){
		                        	if(
		                        		current_data.nama_sub_giat.mst_lock == 0 
		                        		&& current_data.kode_sub_skpd
		                        	){
		                        		cat_wp = current_data.kode_sub_skpd+' '+current_data.nama_sub_skpd;
		                        		var nama_skpd = current_data.nama_skpd.split(' ');
		                        		nama_skpd.shift();
		                        		nama_skpd = nama_skpd.join(' ');
										singkron_rka_ke_lokal({
											id_unit: id_unit,
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
		            	window.sub_keg_skpd = subkeg.data;
						var html = '';
						subkeg.data.map(function(b, i){
							if(
								b.nama_sub_giat.mst_lock == 0
								&& b.kode_sub_skpd
							){
								html += ''
									+'<tr>'
										+'<td><input type="checkbox" class="cek_sub_keg_modal" data-id="'+b.kode_sbl+'"></td>'
										+'<td>'+b.nama_sub_giat.nama_sub_giat+'</td>'
										+'<td>-</td>'
									+'</tr>';
							}
						});
						run_script('jQuery("#table_sub_keg_modal").DataTable().destroy();');
						jQuery('#table_sub_keg_modal tbody').html(html);
						run_script('jQuery("#table_sub_keg_modal").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
						run_script('jQuery("#mod-konfirmasi-sub-keg").modal("show");');
						hide_loading();
		            }
				});
			}
		});
	}
}

function singkron_rka_ke_lokal(opsi, callback) {
	// if((opsi && opsi.kode_bl) || confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
	if((opsi && opsi.kode_bl) || confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		if(jQuery('#only_pagu').is(':checked')){
			return callback();
		}
		var id_unit = idune;
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
			// get detail SKPD
			get_detail_skpd(id_unit).then(function(data_unit){
				get_kode_from_rincian_page(opsi, kode_sbl).then(function(data_sbl){
					if(opsi && opsi.action){
						kode_get = opsi.action.split("detilGiat('")[1].split("'")[0];
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
						url: endog+'?'+kode_get,
						type: 'post',
						data: formData,
						processData: false,
						contentType: false,
						success: function(subkeg){
							var data_rka = { 
								action: 'singkron_rka',
								tahun_anggaran: config.tahun_anggaran,
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
								for(var j in data_unit){
									data_rka.data_unit[j] = data_unit[j];
								}
							}
							console.log('data_unit', data_unit, data_rka.data_unit);
							subkeg.dataOutputGiat.map(function(d, i){
								data_rka.dataOutputGiat[i] = {};
					            data_rka.dataOutputGiat[i].outputteks = d.outputteks;
					            data_rka.dataOutputGiat[i].satuanoutput = d.satuanoutput;
					            data_rka.dataOutputGiat[i].targetoutput = d.targetoutput;
					            data_rka.dataOutputGiat[i].targetoutputteks = d.targetoutputteks;
							});
							subkeg.dataLokout.map(function(d, i){
								data_rka.dataLokout[i] = {};
								data_rka.dataLokout[i].camatteks = d.camatteks;
								data_rka.dataLokout[i].daerahteks = d.daerahteks;
								data_rka.dataLokout[i].idcamat = d.idcamat;
								data_rka.dataLokout[i].iddetillokasi = d.iddetillokasi;
								data_rka.dataLokout[i].idkabkota = d.idkabkota;
								data_rka.dataLokout[i].idlurah = d.idlurah;
								data_rka.dataLokout[i].lurahteks = d.lurahteks;
							});
							subkeg.dataOutput.map(function(d, i){
								data_rka.dataOutput[i] = {};
								data_rka.dataOutput[i].outputteks = d.outputteks;
					            data_rka.dataOutput[i].targetoutput = d.targetoutput;
					            data_rka.dataOutput[i].satuanoutput = d.satuanoutput;
					            data_rka.dataOutput[i].idoutputbl = d.idoutputbl;
					            data_rka.dataOutput[i].targetoutputteks = d.targetoutputteks;
							});
							subkeg.dataHasil.map(function(d, i){
								data_rka.dataHasil[i] = {};
								data_rka.dataHasil[i].hasilteks = d.hasilteks;
								data_rka.dataHasil[i].satuanhasil = d.satuanhasil;
								data_rka.dataHasil[i].targethasil = d.targethasil;
								data_rka.dataHasil[i].targethasilteks = d.targethasilteks;

							});
							subkeg.dataEs3.map(function(d, i){

							});
							subkeg.dataTag.map(function(d, i){
								data_rka.dataTag[i] = {};
					            data_rka.dataTag[i].idlabelgiat = d.idlabelgiat;
					            data_rka.dataTag[i].namalabel = d.namalabel;
					            data_rka.dataTag[i].idtagbl = d.idtagbl;

							});
							subkeg.dataLb7.map(function(d, i){

							});
							subkeg.dataDana.map(function(d, i){
								data_rka.dataDana[i] = {};
					            data_rka.dataDana[i].namadana = d.namadana;
					            data_rka.dataDana[i].kodedana = d.kodedana;
					            data_rka.dataDana[i].iddana = d.iddana;
					            data_rka.dataDana[i].iddanasubbl = d.iddanasubbl;
					            data_rka.dataDana[i].pagudana = d.pagudana;
							});
							subkeg.dataBl.map(function(d, i){
								data_rka.dataBl[i] = {};
								data_rka.dataBl[i].id_sub_skpd = d.id_sub_skpd;
					            data_rka.dataBl[i].id_lokasi = d.id_lokasi;
					            data_rka.dataBl[i].id_label_kokab = d.id_label_kokab;
					            data_rka.dataBl[i].nama_dana = d.nama_dana;
					            data_rka.dataBl[i].no_sub_giat = d.no_sub_giat;
					            data_rka.dataBl[i].kode_giat = d.kode_giat;
					            data_rka.dataBl[i].id_program = d.id_program;
					            data_rka.dataBl[i].nama_lokasi = d.nama_lokasi;
					            data_rka.dataBl[i].waktu_akhir = d.waktu_akhir;
					            data_rka.dataBl[i].pagu_n_lalu = d.pagu_n_lalu;
					            data_rka.dataBl[i].id_urusan = d.id_urusan;
					            data_rka.dataBl[i].id_unik_sub_bl = d.id_unik_sub_bl;
					            data_rka.dataBl[i].id_sub_giat = d.id_sub_giat;
					            data_rka.dataBl[i].label_prov = d.label_prov;
					            data_rka.dataBl[i].kode_program = d.kode_program;
					            data_rka.dataBl[i].kode_sub_giat = d.kode_sub_giat;
					            data_rka.dataBl[i].no_program = d.no_program;
					            data_rka.dataBl[i].kode_urusan = d.kode_urusan;
					            data_rka.dataBl[i].kode_bidang_urusan = d.kode_bidang_urusan;
					            data_rka.dataBl[i].nama_program = d.nama_program;
					            data_rka.dataBl[i].target_4 = d.target_4;
					            data_rka.dataBl[i].target_5 = d.target_5;
					            data_rka.dataBl[i].id_bidang_urusan = d.id_bidang_urusan;
					            data_rka.dataBl[i].nama_bidang_urusan = d.nama_bidang_urusan;
					            data_rka.dataBl[i].target_3 = d.target_3;
					            data_rka.dataBl[i].no_giat = d.no_giat;
					            data_rka.dataBl[i].id_label_prov = d.id_label_prov;
					            data_rka.dataBl[i].waktu_awal = d.waktu_awal;
					            data_rka.dataBl[i].pagumurni = data_sbl.data.pagumurni;
					            data_rka.dataBl[i].pagu = data_sbl.data.pagu;
					            data_rka.dataBl[i].output_sub_giat = d.output_sub_giat;
					            data_rka.dataBl[i].sasaran = d.sasaran;
					            data_rka.dataBl[i].indikator = d.indikator;
					            data_rka.dataBl[i].id_dana = d.id_dana;
					            data_rka.dataBl[i].nama_sub_giat = d.nama_sub_giat;
					            data_rka.dataBl[i].pagu_n_depan = d.pagu_n_depan;
					            data_rka.dataBl[i].satuan = d.satuan;
					            data_rka.dataBl[i].id_rpjmd = d.id_rpjmd;
					            data_rka.dataBl[i].id_giat = d.id_giat;
					            data_rka.dataBl[i].id_label_pusat = d.id_label_pusat;
					            data_rka.dataBl[i].nama_giat = d.nama_giat;
					            data_rka.dataBl[i].id_skpd = d.id_skpd;
					            data_rka.dataBl[i].id_sub_bl = d.id_sub_bl;
					            data_rka.dataBl[i].nama_sub_skpd = d.nama_sub_skpd;
					            data_rka.dataBl[i].target_1 = d.target_1;
					            data_rka.dataBl[i].nama_urusan = d.nama_urusan;
					            data_rka.dataBl[i].target_2 = d.target_2;
					            data_rka.dataBl[i].label_kokab = d.label_kokab;
					            data_rka.dataBl[i].label_pusat = d.label_pusat;
					            data_rka.dataBl[i].id_bl = d.id_bl;
							});
							subkeg.dataCapaian.map(function(d, i){
								data_rka.dataCapaian[i] = {};
					            data_rka.dataCapaian[i].satuancapaian = d.satuancapaian;
					            data_rka.dataCapaian[i].targetcapaianteks = d.targetcapaianteks;
					            data_rka.dataCapaian[i].capaianteks = d.capaianteks;
					            data_rka.dataCapaian[i].targetcapaian = d.targetcapaian;
							});

							var kode_go_hal_rinci = {
								go_rinci: false,
								kode: lru1
							};
							if(opsi && opsi.action){
								var aksi = opsi.action.split("main?");
								if(aksi.length > 2){
									kode_go_hal_rinci.go_rinci = true;
									kode_go_hal_rinci.kode = 'main?'+aksi[1].split("'")[0];
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
							/*
							if(
								subkeg.dataBl[0].pagu == 0
								|| subkeg.dataBl[0].pagu == ''
								|| !subkeg.dataBl[0].pagu
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
							*/

							go_halaman_detail_rincian(kode_go_hal_rinci).then(function(kode_get_rinci_all){
								// subkeg = JSON.parse(subkeg);
								// get rincian belanja
								var kode_get_rinci = kode_get_rinci_all.kode_get_rinci;
								var kode_get_rinci_subtitle = kode_get_rinci_all.kode_get_rinci_subtitle;
								var kode_get_rinci_realisasi = kode_get_rinci_all.kode_get_rinci_realisasi;
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
												substeks_all[substeks] = rka.subs_bl_teks;
											}
										});
										getRealisasiBelanja(kode_get_rinci_realisasi)
										.then(function(realisasi){
											data_rka.realisasi = realisasi;
											getSumberDanaBelanja(substeks_all, kode_get_rinci_subtitle)
											.then(function(substeks_all){
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
													_rka.id_standar_harga = rka.id_standar_harga;
													_rka.is_locked = rka.is_locked;
													_rka.jenis_bl = rka.jenis_bl;
													_rka.ket_bl_teks = rka.ket_bl_teks;
													_rka.id_akun = rka.id_akun;
													_rka.kode_akun = rka.kode_akun;
													_rka.koefisien = rka.koefisien;
													_rka.koefisien_murni = rka.koefisien_murni;
													_rka.lokus_akun_teks = rka.lokus_akun_teks;
													_rka.nama_akun = rka.nama_akun;
													if(rka.nama_standar_harga && rka.nama_standar_harga.nama_komponen){
														_rka.nama_komponen = rka.nama_standar_harga.nama_komponen;
														_rka.spek_komponen = rka.nama_standar_harga.spek_komponen;
													}else{
														_rka.nama_komponen = '';
														_rka.spek_komponen = '';
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
													_rka.subs_bl_teks = substeks_all[rka.subs_bl_teks.substeks];
													_rka.total_harga = rka.rincian;
													_rka.rincian = rka.rincian;
													_rka.rincian_murni = rka.rincian_murni;
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
													_rka.idketerangan = 0;
													_rka.idsubtitle = 0;
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
									                		// console.log('current_data', current_data);
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
									                			}else{
									                				try{
									                					var kode_get_rka = rka.action.split("ubahKomponen('")[1].split("'")[0];
									                				}catch(e){
									                					var kode_get_rka = false;
									                				}
																	return getDetailRin(id_unit, kode_sbl, rka.id_rinci_sub_bl, 0, kode_get_rka).then(function(detail_rin){
																		if(detail_rin){
																			data_rka.rka[i].id_prop_penerima = detail_rin.id_prop_penerima;
																			data_rka.rka[i].id_camat_penerima = detail_rin.id_camat_penerima;
																			data_rka.rka[i].id_kokab_penerima = detail_rin.id_kokab_penerima;
																			data_rka.rka[i].id_lurah_penerima = detail_rin.id_lurah_penerima;
																			data_rka.rka[i].id_penerima = detail_rin.id_penerima;
																			data_rka.rka[i].idkomponen = detail_rin.idkomponen;
																			data_rka.rka[i].idketerangan = detail_rin.idketerangan;
																			data_rka.rka[i].idsubtitle = detail_rin.idsubtitle;
																		}
																		if(!opsi){
																			no_excel++;
																			var tbody_excel = ''
																				+'<tr>'
																					+'<td style="mso-number-format:\@;">'+no_excel+'</td>'
																					+'<td style="mso-number-format:\@;">'+kode_sbl+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].jenis_bl+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].idsubtitle+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].subs_bl_teks+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].idketerangan+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].ket_bl_teks+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].kode_akun+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].nama_akun+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].nama_komponen+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].spek_komponen+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].koefisien+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].satuan+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].harga_satuan+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].totalpajak+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].rincian+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_rinci_sub_bl+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_penerima+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].lokus_akun_teks+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_prop_penerima+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_camat_penerima+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_kokab_penerima+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].id_lurah_penerima+'</td>'
																					+'<td style="mso-number-format:\@;">'+data_rka.rka[i].idkomponen+'</td>'
																				+'</tr>';
																			jQuery('#data_rin_excel').append(tbody_excel);
																			console.log('data_rka.rka[i]', data_rka.rka[i]);
																		}
																	});
																}
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
											});
										});
									}
								});
							});

						}
					});
				});
			});
		}else{
			alert('ID Belanja tidak ditemukan!');
			hide_loading();
		}
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
    			relayAjax({
					url: endog + '?' + current_data.nama_skpd.sParam,
					success: function(html){
						var kode_get = html.split('lru8="')[1].split('"')[0];
						current_data.kode_get = kode_get;
            			singkron_rka_ke_lokal_all(current_data, function(){
            				console.log('next reduce', nextData);
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
			api_key: config.api_key,
			category : 'Semua Perangkat Daerah Tahun Anggaran '+config.tahun_anggaran
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
	      	success: function(belanja){
	      		return resolve(belanja);
	      	}
	    });
    });
}

function sub_bl(idskpd){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/view/16274',                                    
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
	      	success: function(sub_bl){
	      		return resolve(sub_bl);
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

function renja_label(id_sub_bl){    
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
	      	success: function(renja_label){
	      		return resolve(renja_label);
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