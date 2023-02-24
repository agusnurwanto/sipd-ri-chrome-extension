function singkron_ssh_ke_lokal(type_data_ssh){
	console.log('type_data_ssh', type_data_ssh);
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		jQuery('#persen-loading').attr('persen', 0);
		jQuery('#persen-loading').html('0%');
		var kelompok;
			if (type_data_ssh =='SSH') {
				kelompok = 1;
			}else if (type_data_ssh =='HSPK') {
				kelompok = 2;
			}else if (type_data_ssh =='ASB') {
				kelompok = 3;
			}else if (type_data_ssh =='SBU') {
				kelompok = 4;
			}		
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/listAll',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,				
				kelompok: kelompok,				
				tipe: type_data_ssh,				
				//search[value]:'',
				length: 100000,
				start: 0,				
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},			
			success: function(data){			
				pesan_loading('Simpan data '+type_data_ssh+' ke DB Lokal!');
				var data_all = [];
				var data_sementara = [];
				data.data.data.map(function(b, i){
					data_sementara.push(b);
					var n = i+1;
					if(n%50 == 0){
						data_all.push(data_sementara);
						data_sementara = [];
					}
				});

				if(data_sementara.length > 0){
					data_all.push(data_sementara);
				}

				var i = 0;
				var last = data_all.length-1;
				data_all.reduce(function(sequence, nextData){
					return sequence.then(function(current_data){
						return new Promise(function(resolve_redurce, reject_redurce){
							var sendData = current_data.map(function(val, n){																
								return new Promise(function(resolve, reject){									
									relayAjax({
										url: config.sipd_url+'api/master/d_komponen/listRekening',
										type: 'POST',
										data: {
											id_standar_harga: val.id_standar_harga,
											tahun: _token.tahun,
											id_daerah: _token.daerah_id,		
										},										
										beforeSend: function (xhr) {			    
											xhr.setRequestHeader("x-api-key", x_api_key());
											xhr.setRequestHeader("x-access-token", _token.token);
										},
										success: function(ret){
											val.rek_belanja = ret.data;
											return resolve(val);
										},
										error: function(e) {
											console.log(e);
											return resolve(val);
										}
									});
								})
								.catch(function(e){
									console.log(e);
									return Promise.resolve(val);
								});
							});

							Promise.all(sendData)
							.then(function(val_all){								
									send_to_lokal(val_all);								
								var c_persen = +jQuery('#persen-loading').attr('persen');
								c_persen++;
								jQuery('#persen-loading').attr('persen', c_persen);
								jQuery('#persen-loading').html(((c_persen/data_all.length)*100).toFixed(2)+'%');
								return resolve_redurce(nextData);
							})
							.catch(function(err){
								console.log('err', err);
								return resolve_redurce(nextData);
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
				}, Promise.resolve(data_all[last]))
				.then(function(data_last){
					console.log(data_last);
					hide_loading();        
					alert('Data berhasil disimpan di database lokal!');
				})
				.catch(function(e){
					console.log(e);
				});							
			}
		});
	}
}

function send_to_lokal(val){
	
	var data_ssh = { 
		action: 'singkron_ssh',
		type: 'ri',		
		tahun_anggaran: _token.tahun,
		api_key: config.api_key,
		ssh : {}
	};
	console.log('ssh', val);
	val.map(function(b, i){		
			var kelompok;
			if (b.tipe_standar_harga == 'SSH') {
				kelompok = 1;
			}else if (b.tipe_standar_harga == 'HSPK') {
				kelompok = 2;
			}else if (b.tipe_standar_harga == 'ASB') {
				kelompok = 3;
			}else if (b.tipe_standar_harga == 'SBU') {
				kelompok = 4;
			}
			data_ssh.ssh[i] = {};
			data_ssh.ssh[i].kode_kel_standar_harga	= b.kode_kel_standar_harga;
			data_ssh.ssh[i].nama_kel_standar_harga	= b.nama_kel_standar_harga;
			data_ssh.ssh[i].id_standar_harga	= b.id_standar_harga;
			data_ssh.ssh[i].kode_standar_harga	= b.kode_standar_harga;
			data_ssh.ssh[i].nama_standar_harga	= b.nama_standar_harga;
			data_ssh.ssh[i].spek	= b.spek;
			data_ssh.ssh[i].satuan	= b.satuan;
			data_ssh.ssh[i].harga	= b.harga;
			data_ssh.ssh[i].harga_2	= b.harga_2;
			data_ssh.ssh[i].harga_3	= b.harga_3;
			data_ssh.ssh[i].is_locked	= b.is_locked;
			data_ssh.ssh[i].is_deleted	= b.is_deleted;
			data_ssh.ssh[i].created_user	= b.created_user;
			data_ssh.ssh[i].created_at	= b.created_at;
			data_ssh.ssh[i].updated_user	= b.updated_user;
			data_ssh.ssh[i].updated_at	= b.updated_at;			
			data_ssh.ssh[i].kelompok	= kelompok;
			data_ssh.ssh[i].tipe_standar_harga	= b.tipe_standar_harga;
			data_ssh.ssh[i].ket_teks	= b.ket_teks;
			data_ssh.ssh[i].nilai_tkdn	= b.nilai_tkdn;
			data_ssh.ssh[i].is_pdn	= b.is_pdn;
			data_ssh.ssh[i].kd_belanja	= {};
			b.rek_belanja.map(function(d, c){
				data_ssh.ssh[i].kd_belanja[c]	= {};
				data_ssh.ssh[i].kd_belanja[c].id_akun	= d.id_akun;
				data_ssh.ssh[i].kd_belanja[c].kode_akun	= d.kode_akun;
				data_ssh.ssh[i].kd_belanja[c].nama_akun	= d.nama_akun;
			});		
	});
	
	var data = {
		message:{
			type: "get-url",
			content: {
				url: config.url_server_lokal,
				type: 'post',								
				data: data_ssh,				
				return: false
			}
		}
	};
	chrome.runtime.sendMessage(data, function(response) {
		console.log('responeMessage', response);
	});
}

// function satuan_kategori_ke_lokal(){
// 	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
// 		show_loading();
// 		new Promise(function(resolve, reject){
// 			window.continue_kategori_ssh = resolve;	
// 			// singkron_kategori_ke_lokal();
// 			singkron_satuan_ke_lokal();
// 		})
// 		.then(function(){			
// 			singkron_kategori_ke_lokal();
// 			// singkron_satuan_ke_lokal();
// 			hide_loading();
// 		});
// 	}
// }

function singkron_satuan_ke_lokal(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){		
			show_loading();
			var apiKey = x_api_key();
			relayAjax({
				url: config.sipd_url+'api/master/satuan/list',
				type: 'POST',
				data: {
					tahun: _token.tahun,
					// id_daerah: _token.daerah_id,				                
					length: 100000
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", apiKey);
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				success: function(data){
					pesan_loading('Simpan data Master Satuan ke DB Lokal!');
					console.log('data', data.data.data);
					var data_ssh = { 
						action: 'singkron_satuan',
						type: 'ri',
						tahun_anggaran: _token.tahun,
						api_key: config.api_key,					
						satuan : {}
					};
					var last =  data.data.data.length-1;
					data.data.data.reduce(function(sequence, nextData){
						return sequence.then(function(option, i){
							return new Promise(function(resolve_reduce, reject_reduce){
								data_ssh.satuan[i] = {};
								data_ssh.satuan[i].satuan = option.nama_satuan;
								data_ssh.satuan[i].id_satuan = option.id_satuan; //baru
								data_ssh.satuan[i].is_locked = option.is_locked; //baru
							
								var data = {
									message:{
										type: "get-url",
										content: {
											url: config.url_server_lokal,
											type: 'post',
											data: data_ssh,
											return: false
										}
									}
								};
								chrome.runtime.sendMessage(data, function (response) {
									console.log('responeMessage', response);
								});
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
					}, Promise.resolve(data.data.data[last]))
						.then(function(data_last){
							hide_loading();
							alert('Berhasil singkron data Master Satuan Standar Harga !');
						})
						.catch(function(e){
							console.log(e);
						}); 
				}		
			})
	}
}

function singkron_kategori_ke_lokal(page=0, per_page=10, options){
	return new Promise(function(resolve, reduce){		
		show_loading();	
		var apiKey = x_api_key();	    
	    // param_encrypt = en(JSON.stringify(data));
	    relayAjax({
			url: config.sipd_url+'api/master/kel_standar_harga/list',
			type: 'post',
			data: {
				tahun: _token.tahun,	        
				length: per_page,
				start: page,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(ret){
				console.log('ret success', ret);
				console.log('data', ret.data.data);
				console.log('Total', ret.data.recordsTotal);
				
				// ret = JSON.parse(de(ret));
				var data_ssh = { 					
					// page: page,
					action: 'singkron_kategori_ssh',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					// tipe_ssh: type_data_ssh,					
					kategori : {}
				};
				var data_all = [];
		        var data_sementara = [];
		        var max = per_page;
		        ret.data.data.map(function(b, i){
		            data_sementara.push(b);
		            if(data_sementara.length%max == 0){
		                data_all.push(data_sementara);
		                data_sementara = [];
		            }
		        });
		        if(data_sementara.length > 0){
		            data_all.push(data_sementara);
		        }
		        var last = data_all.length - 1;
		        data_all.reduce(function(sequence, nextData){
		            return sequence.then(function(current_data){					
		                return new Promise(function(resolve_reduce, reject_reduce){		
							console.log('current_data', current_data);
							current_data.map(function(option, i){
								pesan_loading('kirim data ke lokal Data Start = '+page);
								
								var active = 1;
								if (option.is_locked == 1)
								{
									var active = 0;
								}
								data_ssh.kategori[i] = {};
								data_ssh.kategori[i].id_kategori = option.id_kel_standar_harga;
								data_ssh.kategori[i].kode_kategori = option.kode_kel_standar_harga; 
								data_ssh.kategori[i].uraian_kategori = option.nama_kel_standar_harga;
								data_ssh.kategori[i].kelompok = option.tipe_standar_harga;
								// data_ssh.tipe_ssh = option.tipe_standar_harga;
								data_ssh.kategori[i].active = active;								
								data_ssh.kategori[i].status_aktif = option.status_aktif; //baru
								data_ssh.kategori[i].is_locked = option.is_locked; //baru
								data_ssh.kategori[i].pjg_kode = option.pjg_kode; //baru
								data_ssh.kategori[i].id_daerah = option.id_daerah; //baru
							
								var data = {
									message:{
										type: "get-url",
										content: {
											url: config.url_server_lokal,
											type: 'post',
											data: data_ssh,
											return: false
										}
									}
								};
								chrome.runtime.sendMessage(data, function(response) {
									console.log('responeMessage', response);
								});
							});
							
							window.continue_kategori = resolve_reduce;
							window.continue_kategori_next_data = nextData;
							// return resolve_reduce(nextData);
							Promise.all()
							.then(function(data_last){								
									
								return resolve_redurce(nextData);
							})
							.catch(function(err){
								console.log('err', err);
								return resolve_redurce(nextData);
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
		        }, Promise.resolve(data_all[last]))
		        .then(function(data_last){
					var page_before = per_page*page;
					if(ret.data.recordsTotal > ret.data.data.length+page_before){
						singkron_kategori_ke_lokal(page+10, per_page, options)
							.then(function(){
								resolve();
							});
					}else{
						resolve();
					}					
		        })
		        .catch(function(e){
		            console.log(e);
		            resolve();
		        });				
			}
		});
		
	});
}

function singkron_kategori_ke_lokal_tanpa_page(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){		
		show_loading();
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/kel_standar_harga/list',
			type: 'POST',
			data: {
				tahun: _token.tahun,											                
				length: 100000,
				start: 0
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(data){
				pesan_loading('Simpan data Master Kelompok Standar Harga ke DB Lokal!');
				console.log('data', data.data.data);
				var data_ssh = { 
					action: 'singkron_kategori_ssh',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					// tipe_ssh: type_data_ssh,					
					kategori : {}
				};
				var last =  data.data.data.length-1;
				data.data.data.reduce(function(sequence, nextData){
					return sequence.then(function(option, i){
						return new Promise(function(resolve_reduce, reject_reduce){
							var active = 1;
							if (option.is_locked == 1)
							{
								var active = 0;
							}
							data_ssh.kategori[i] = {};
							data_ssh.kategori[i].id_kategori = option.id_kel_standar_harga;
							data_ssh.kategori[i].kode_kategori = option.kode_kel_standar_harga; 
							data_ssh.kategori[i].uraian_kategori = option.nama_kel_standar_harga;
							data_ssh.kategori[i].kelompok = option.tipe_standar_harga;
							data_ssh.kategori[i].active = active;								
							data_ssh.kategori[i].status_aktif = option.status_aktif; //baru
							data_ssh.kategori[i].is_locked = option.is_locked; //baru
							data_ssh.kategori[i].pjg_kode = option.pjg_kode; //baru
							data_ssh.kategori[i].id_daerah = option.id_daerah; //baru
						
							var data = {
								message:{
									type: "get-url",
									content: {
										url: config.url_server_lokal,
										type: 'post',
										data: data_ssh,
										return: false
									}
								}
							};
							chrome.runtime.sendMessage(data, function (response) {
								console.log('responeMessage', response);
							});
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
				}, Promise.resolve(data.data.data[last]))
					.then(function(data_last){
						// hide_loading();
						alert('Berhasil singkron data Master Kelompok Standar Harga !');
					})
					.catch(function(e){
						console.log(e);
					}); 
			}		
		});
	}
}

function hapus_arsip_ssh(type_data_ssh){
	console.log('type_data_ssh', type_data_ssh);
	if(confirm('Apakah anda yakin melakukan ini? data arsip '+type_data_ssh+' pada sipd-ri akan dihapus.')){
		show_loading();	
		var kelompok;
			if (type_data_ssh =='SSH') {
				kelompok = 1;
			}else if (type_data_ssh =='HSPK') {
				kelompok = 2;
			}else if (type_data_ssh =='ASB') {
				kelompok = 3;
			}else if (type_data_ssh =='SBU') {
				kelompok = 4;
			}		
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/list',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,				
				kelompok: kelompok,				
				tipe: type_data_ssh,				
				is_locked: 3			
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},			
			success: function(data){			
				pesan_loading('Ambil Data Arsip '+type_data_ssh+' ');
				console.log('data',data.data);
				var last = data.data.length-1;
				data.data.reduce(function(sequence, nextData){
					return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){
							pesan_loading('Hapus data komponen '+current_data.nama_standar_harga+' dari Arsip SIPD!');	
							var idstandarharga = current_data.id_standar_harga;
							hapus_komponen(idstandarharga).then(function(hapus){
								chrome.runtime.sendMessage(hapus, function(response) {
									console.log('responeMessage', response);
									resolve_reduce(nextData);
								});													
							})		
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
				}, Promise.resolve(data.data[last]))
				.then(function(data_last){
					hide_loading();        
					alert('Berhasil Kosongkan Data Arsip '+type_data_ssh+' ');
				})
				.catch(function(e){
					console.log(e);
				});      								
			}
		});		
	}
}

function hapus_komponen(idstandarharga){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/deleteArsip',                                    
			type: 'POST',	      				
			data: {            
					tahun: _token.tahun,				
					id_daerah: _token.daerah_id,	
					id_user_log: 1,	
					id_daerah_log: _token.daerah_id,	
					id_standar_harga: idstandarharga
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(hapus){
	      		return resolve(hapus);
	      	}
	    });
    });
}