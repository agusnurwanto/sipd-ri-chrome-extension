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
				limit: 10000
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
		var url_get_unit = config.sipd_url+'api/renja/sub_bl/list_belanja_by_tahun_daerah_unit';
		// if(opsi_unit && opsi_unit.id_unit){
		// 	url_get_unit = opsi_unit.kode_get;
		// }
		// relayAjax({
		// 	url: url_get_unit,
		// 	type: 'POST',
		// 	data: formData,
		// 	processData: false,
		// 	contentType: false,
		// 	success: function(subkeg){
		// 		// ubah status sub_keg_bl jadi tidak aktif semua agar jika ada sub keg yang dihapus, sipd lokal bisa ikut terupdate
		// 		new Promise(function(resolve_reduce_nonactive, reject_reduce_nonactive){
		// 			promise_nonactive[id_unit] = resolve_reduce_nonactive;
		// 			var subkeg_aktif = [];
		// 			subkeg.data.map(function(b, i){
		// 				if(
		// 					b.nama_sub_giat.mst_lock == 0
		// 					&& b.kode_sub_skpd
		// 				){
		// 					subkeg_aktif.push({kode_sbl: b.kode_sbl});
		// 				}
		// 			});
		// 			var data = {
		// 			    message:{
		// 			        type: "get-url",
		// 			        content: {
		// 					    url: config.url_server_lokal,
		// 					    type: 'post',
		// 					    data: {
		// 					    	action: 'update_nonactive_sub_bl',
		// 							api_key: config.api_key,
		// 							tahun_anggaran: config.tahun_anggaran,
		// 							id_unit: id_unit,
		// 							subkeg_aktif: subkeg_aktif
		// 					    },
		// 		    			return: true
		// 					}
		// 			    }
		// 			};
		// 			chrome.runtime.sendMessage(data, function(response) {
		// 			    console.log('responeMessage', response);
		// 			});
		// 		}).then(function(){
		// 			if(opsi_unit && opsi_unit.id_skpd){
		// 				var cat_wp = '';
		// 				var last = subkeg.data.length-1;
		// 				subkeg.data.reduce(function(sequence, nextData){
		//                     return sequence.then(function(current_data){
		//                 		return new Promise(function(resolve_reduce, reject_reduce){
		//                         	if(
		//                         		current_data.nama_sub_giat.mst_lock == 0 
		//                         		&& current_data.kode_sub_skpd
		//                         	){
		//                         		cat_wp = current_data.kode_sub_skpd+' '+current_data.nama_sub_skpd;
		//                         		var nama_skpd = current_data.nama_skpd.split(' ');
		//                         		nama_skpd.shift();
		//                         		nama_skpd = nama_skpd.join(' ');
		// 								singkron_rka_ke_lokal({
		// 									id_unit: id_unit,
		// 									action: current_data.action,
		// 									kode_bl: current_data.kode_bl,
		// 									kode_sbl: current_data.kode_sbl,
		// 									idbl: current_data.id_bl,
		// 									idsubbl: current_data.id_sub_bl,
		// 									kode_skpd: current_data.kode_skpd,
		// 									nama_skpd: nama_skpd,
		// 									kode_sub_skpd: current_data.kode_sub_skpd,
		// 									nama_sub_skpd: current_data.nama_sub_skpd,
		// 									pagumurni: current_data.pagumurni,
		// 									pagu: current_data.pagu,
		// 									no_return: true
		// 								}, function(){
		// 									console.log('next reduce', nextData);
		// 									resolve_reduce(nextData);
		// 								});
		// 							}else{
		// 								resolve_reduce(nextData);
		// 							}
		// 		                })
		//                         .catch(function(e){
		//                             console.log(e);
		//                             return Promise.resolve(nextData);
		//                         });
		//                     })
		//                     .catch(function(e){
		//                         console.log(e);
		//                         return Promise.resolve(nextData);
		//                     });
		//                 }, Promise.resolve(subkeg.data[last]))
		//                 .then(function(data_last){
		// 					if(callback){
		// 						return callback();
		// 					}else{
		// 	                	var opsi = { 
		// 							action: 'get_cat_url',
		// 							api_key: config.api_key,
		// 							category : cat_wp
		// 						};
		// 						var data = {
		// 						    message:{
		// 						        type: "get-url",
		// 						        content: {
		// 								    url: config.url_server_lokal,
		// 								    type: 'post',
		// 								    data: opsi,
		// 					    			return: true
		// 								}
		// 						    }
		// 						};
		// 						chrome.runtime.sendMessage(data, function(response) {
		// 						    console.log('responeMessage', response);
		// 						});
		// 					}
		//                 })
		//                 .catch(function(e){
		//                     console.log(e);
		//                 });
		//             }else{
		//             	window.sub_keg_skpd = subkeg.data;
		// 				var html = '';
		// 				subkeg.data.map(function(b, i){
		// 					if(
		// 						b.nama_sub_giat.mst_lock == 0
		// 						&& b.kode_sub_skpd
		// 					){
		// 						html += ''
		// 							+'<tr>'
		// 								+'<td><input type="checkbox" class="cek_sub_keg_modal" data-id="'+b.kode_sbl+'"></td>'
		// 								+'<td>'+b.nama_sub_giat.nama_sub_giat+'</td>'
		// 								+'<td>-</td>'
		// 							+'</tr>';
		// 					}
		// 				});
		// 				run_script('jQuery("#table_sub_keg_modal").DataTable().destroy();');
		// 				jQuery('#table_sub_keg_modal tbody').html(html);
		// 				run_script('jQuery("#table_sub_keg_modal").DataTable({lengthMenu: [[20, 50, 100, -1], [20, 50, 100, "All"]]});');
		// 				run_script('jQuery("#mod-konfirmasi-sub-keg").modal("show");');
		// 				jQuery('#wrap-loading').hide();
		//             }
		// 		});
		// 	}
		// });
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