function get_all_ssh_sipd(type_data_ssh, search_value=false){
	return new Promise(function(resolve, reject){
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
		console.log('Get data All SSH!');
		var param = {
			tahun: _token.tahun,
			id_daerah: _token.daerah_id,
			kelompok: kelompok,
			tipe: type_data_ssh,
			length: 100000,
			start: 0
		};
		if(search_value){
			param['search[value]'] = search_value;
		}
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/listAll',
			type: 'POST',
			data: param,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(data){
				resolve(data);
			}
		});
	})
}

function get_rekening_ssh(opsi) {
	return new Promise(function(resolve, reject){
		pesan_loading('Get rekening dari standar harga kode = '+opsi.kode_standar_harga);
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/listRekening',
			type: 'POST',
			data: {
				id_standar_harga: opsi.id_standar_harga,
				kode_standar_harga: opsi.kode_standar_harga,
				kelompok: opsi.kelompok,
				tahun: _token.tahun,
				id_daerah: _token.daerah_id
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(ret){
				return resolve(ret);
			},
			error: function(e) {
				console.log(e);
				return resolve({});
			}
		});
	})
}

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
		get_all_ssh_sipd(type_data_ssh)
		.then(function(data){
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
								get_rekening_ssh({
									id_standar_harga: val.id_standar_harga,
									kode_standar_harga: val.kode_standar_harga,
									kelompok: kelompok
								}).then(function(ret){
									val.rek_belanja = ret.data;
									return resolve(val);
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
							setTimeout(function(){
								return resolve_redurce(nextData);
							}, 1000);
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
				var data_ssh = { 
					action: 'singkron_satuan',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					satuan : {}
				};
				var last =  data.data.data.length-1;
				data.data.data.map(function(option, i){
					data_ssh.satuan[i] = {};
					data_ssh.satuan[i].satuan = option.nama_satuan;
					data_ssh.satuan[i].id_satuan = option.id_satuan; //baru
					data_ssh.satuan[i].is_locked = option.is_locked; //baru
				});
				var data = {
					message:{
						type: "get-url",
						content: {
							url: config.url_server_lokal,
							type: 'post',
							data: data_ssh,
							return: true
						}
					}
				};
				chrome.runtime.sendMessage(data, function (response) {
					console.log('responeMessage', response);
				});
			}
		});
	}
}

function singkron_kategori_ke_lokal(page=0, per_page=500){
	if(typeof global_kategory_ssh == 'undefined'){
		global_kategory_ssh = {};
	}
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
	    relayAjax({
			url: config.sipd_url+'api/master/kel_standar_harga/list',
			type: 'post',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				length: per_page,
				start: (page*per_page)
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(ret){
				var data_ssh = { 					
					page: page,
					action: 'singkron_kategori_ssh',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					kategori : {}
				};
				console.log('current_data', ret.data.data);
				var cek_exist = false;
				ret.data.data.map(function(option, i){
					if(option.tahun != _token.tahun){
						return;
					}
					if(global_kategory_ssh[option.id_kel_standar_harga]){
						return;
					}
					cek_exist = true;
					var active = 1;
					if (option.is_locked == 1){
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
					global_kategory_ssh[option.id_kel_standar_harga] = data_ssh.kategori[i];
				});

				new Promise(function(resolve_reduce, reject_reduce){
					if(cek_exist){
						var data = {
							message:{
								type: "get-url",
								content: {
									url: config.url_server_lokal,
									type: 'post',
									data: data_ssh,
									return: true
								}
							}
						};
						chrome.runtime.sendMessage(data, function(response) {
							pesan_loading('kirim data ke lokal Data Start = '+(per_page*page));
							console.log('responeMessage', response);
						});
						window.continue_kategori = resolve_reduce;
					}else{
						resolve_reduce();
					}
				})
				.then(function(){
					var page_before = per_page*page;
					if(ret.data.recordsTotal > ret.data.data.length+page_before){
						singkron_kategori_ke_lokal(page+1, per_page)
						.then(function(){
							resolve();
						});
					}else{
						console.log('global_kategory_ssh', global_kategory_ssh);
						resolve();
					}
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
				// id_daerah: _token.daerah_id,								                
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
					tipe_ssh: type_data_ssh,					
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
				var last = data.data.length-1;
				data.data.reduce(function(sequence, nextData){
					return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){
							pesan_loading('Hapus data komponen '+current_data.nama_standar_harga+' dari Arsip SIPD!');	
							var idstandarharga = current_data.id_standar_harga;
							hapus_komponen_arsip(idstandarharga).then(function(hapus){
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

function hapus_komponen_arsip(idstandarharga){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/deleteArsip',                                    
			type: 'POST',	      				
			data: {            
					tahun: _token.tahun,				
					id_daerah: _token.daerah_id,	
					id_user_log: _token.user_id,
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

function hapus_komponen(idstandarharga){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/delete',                                    
			type: 'POST',	      				
			data: {            
					tahun: _token.tahun,				
					id_daerah: _token.daerah_id,	
					id_user_log: _token.user_id,
					id_daerah_log: _token.daerah_id,
					is_locked: 3,	
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

function cek_duplikat_ssh(){
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
		success: function(data_ssh){
			window.data_all_ssh = {};
			window.duplikat_ssh = {};
			var l1=0;
			var l2=0;
			var html_duplikat = '';
			data_ssh.data.data.map(function(b, i){
				var id_duplikat = b.kode_kel_standar_harga+''+b.nama_standar_harga+''+b.spek+''+b.satuan+''+b.harga;
				if(typeof data_all_ssh[id_duplikat] == 'undefined'){
					data_all_ssh[id_duplikat] = {
						detail: []
					};
				}else{
					if(typeof duplikat_ssh[id_duplikat] == 'undefined'){
						duplikat_ssh[id_duplikat] = {
							detail: []
						};
					}
					duplikat_ssh[id_duplikat].detail.push(b);
					l2++;
				}
				data_all_ssh[id_duplikat].detail.push(b);
				l1++;
			});
			var no = 0;
			for(var i in duplikat_ssh){
				window.ssh_duplikat = {};
				var id = [];
				var url_hapus = [];
				var ssh = duplikat_ssh[i].detail;
				ssh.map(function(b, n){
					no++;
					html_duplikat += ''
						+'<tr>'
							+'<td class="text-center">'+no+'</td>'
							+'<td class="text-center"><input type="checkbox" value="'+b.id_standar_harga+'"></td>'
							+'<td>'+b.id_standar_harga+'</td>'
							+'<td>'+b.kode_standar_harga+'</td>'
							+'<td>'+b.nama_standar_harga+'</td>'
							+'<td>'+b.spek+'</td>'
							+'<td>'+b.satuan+'</td>'
							+'<td>'+b.harga+'</td>'
						+'</tr>';
				});
			}
			pesan_loading('data_all_ssh = '+l1, 'duplikat_ssh = '+l2);
			jQuery('#modal-extension .modal-title .info-title').html('( Jumlah Semua Data: '+l1+', Jumlah Duplikat: '+l2+' )');
			jQuery('#table_duplikat tbody').html(html_duplikat);
			run_script('show_modal_sm', {order: [[1, "asc"]]});			
			hide_loading();
		}
	});
}

function hapus_duplikat_ssh(){
	var data_komponen_selected = [];
	jQuery('#table_duplikat tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_komponen_selected.push([id]);
			// console.log(id);
		}
	});
	if(data_komponen_selected.length == 0){
		alert('Pilih dulu item SSH yang akan dihapus!');
	}else if (confirm('Apakah anda yakin menghapus data ini? '+data_komponen_selected.join(','))) {
		show_loading();
		console.log('data_komponen_selected', data_komponen_selected);
		var last = data_komponen_selected.length-1;
		data_komponen_selected.reduce(function(sequence, nextData){
			return sequence.then(function(current_data){
				console.log('current_data data_komponen_selected', current_data);
				return new Promise(function(resolve_reduce, reject_reduce){
					console.log(current_data[0]);
					var idstandarharga = current_data[0];
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
		}, Promise.resolve(data_komponen_selected[last]))
		.then(function(last){
			hide_loading();        
			alert('Berhasil hapus data !');
		})
		.catch(function(e){
			console.log(e);
		});
	}
}

function find_rekening(opsi){
	pesan_loading("Get master Rekening");
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/master/akun/find_akun_for_standar_harga',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
				search: opsi.nama_rekening
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

function hapus_rek_all(type_data_ssh){
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
	var data_ssh = [];
	jQuery('.sipd-table tbody > tr > td input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_ssh.push(id);
		}
	});
	if(data_ssh.length == 0){
		alert('Pilih dulu item Standar Harga!');
	}else{
		if(confirm('Apakah anda yakin untuk menghapus rekening dari item '+type_data_ssh+' ini? ID = ( '+data_ssh.join(', ')+' )')){
			show_loading();
			var last = data_ssh.length-1;				
			data_ssh.reduce(function(sequence, nextData){
				return sequence.then(function(id_standar_harga){
					return new Promise(function(resolve_reduce, reject_reduce){
						var kode_standar_harga = jQuery('input[value="'+id_standar_harga+'"]').closest('tr').find('td').eq(1).text();
						get_rekening_ssh({
							id_standar_harga: id_standar_harga,
							kode_standar_harga: kode_standar_harga,
							kelompok: kelompok
						}).then(function(ret){
							ret.data.map(function(b, i){
								hapus_rekening(id_standar_harga, b.id_akun);
							})
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
			}, Promise.resolve(data_ssh[last]))
			.then(function(last){
				hide_loading();        
				alert('Berhasil hapus Rekening!');
			})
			.catch(function(e){
				console.log(e);
			});
		}
	}
}

function set_mulit_rek(){
	var data_ssh = [];
	jQuery('.sipd-table tbody > tr > td input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_ssh.push(id);
		}
	});
	
	if(data_ssh.length == 0){
		alert('Pilih dulu item Standar Harga!');
	}else{
		show_loading();
		get_rekening_all()
		.then(function(akun){
			run_script('show_modal', {
				id: 'modal-extension-rekening'
			});

			var akun_all = {};
			var option_items = [];
			data_ssh = data_ssh.join(',');
			akun.data.map(function(b, i){
				if(b.kode_akun.split('.').length >= 6){
					var keyword = data_ssh+'='+b.id_akun;
					akun_all[keyword] = b;
					option_items.push({ id: keyword, text: b.kode_akun+' '+b.nama_akun });
				}
			});
			var body = 'ID Standar Harga = '+data_ssh.replace(/,/g, ', ')
				+'<select id="table-extension-rekening" name="states[]" multiple="multiple"></select>';
			jQuery('#table-extension-rekening-ket').html(body);
			jQuery('#table-extension-rekening').select2({
				width: '100%',
				placeholder: 'Cari rekening',
			    minimumInputLength: 4,
			    allowClear: true,
				dropdownParent: jQuery('#modal-extension-rekening'),
				ajax: {
					delay: 100,
		            transport: function(params, success, failure) {
		                let pageSize = 25;
		                let term = (params.data.term || '').toLowerCase();
		                let page = (params.data.page || 1);

		                if(
		                	typeof global_timer != 'undefined' 
		                	&& global_timer != null
		                ){
		                    clearTimeout(global_timer);
		                }

		                window.global_timer = setTimeout(function(){
		                    global_timer = null;
		                    let results = option_items.filter(function(f){
		                        return f.text.toLowerCase().includes(term);
		                    });
		                    let paged = results.slice((page -1) * pageSize, page * pageSize);
		                    let options = {
		                        results: paged,
		                        pagination: {
		                            more: results.length >= page * pageSize
		                        }
		                    };
		                    success(options);
		                }, params.delay);
		            }
		        }
			});
			hide_loading();			
		});
	} 
}

function proses_simpan_multirek(){
	var data_multirek_selected = jQuery('#table-extension-rekening').val();
	if(data_multirek_selected.length == 0){
		alert('Pilih dulu item Rekening yang akan ditambahkan!');
	}else if (confirm('Apakah anda yakin menambahkan rekening ini ke item ? '+data_multirek_selected.join(','))) {
		show_loading();
		console.log('data_multirek_selected', data_multirek_selected);					
		var last = data_multirek_selected.length-1;				
		data_multirek_selected.reduce(function(sequence, nextData){
			return sequence.then(function(current_data){
				console.log('current_data data_multirek_selected', current_data);
				return new Promise(function(resolve_reduce, reject_reduce){
					console.log(current_data);
					var data = current_data.split('=');					
					var ssh = data[0].split(',');										
					var rek = data[1];					
					var lastssh = ssh.length-1;
					ssh.reduce(function(sequence2, nextData2){
						return sequence2.then(function(datassh){
							console.log('simpan data_ssh', datassh);
							return new Promise(function(resolve_reduce2, reject_reduce){
								simpan_rekening(datassh, rek).then(function(simpanrekening){
									chrome.runtime.sendMessage(simpanrekening, function(response) {
										console.log('responeMessage', response);
										resolve_reduce2(nextData2);
									});																					
								})
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
					}, Promise.resolve(ssh[lastssh]))
					.then(function(lastopd){										
						jQuery('#wrap-loading').show();
						pesan_loading('Data Selanjutnya!');	
						return resolve_reduce(nextData);
					}).catch(function(err){
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
		}, Promise.resolve(data_multirek_selected[last]))
		.then(function(last){
			hide_loading();        
			alert('Berhasil Tampah Rekening data !');
		})
		.catch(function(e){
			console.log(e);
		});
	}
}

function simpan_rekening(idstandarharga, idakun){    
    return new Promise(function(resolve, reject){
    	pesan_loading('SIMPAN Rekening');
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen_akun/add',                                    
			type: 'POST',	      				
			data: {            
					tahun: _token.tahun,				
					id_daerah: _token.daerah_id,	
					id_user_log: _token.user_id,
					id_daerah_log: _token.daerah_id,
					id_standar_harga: idstandarharga,
					id_akun: idakun
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(simpanrekening){
	      		return resolve(simpanrekening);
	      	}
	    });
    });
}

function hapus_rekening(idstandarharga, idakun){    
    return new Promise(function(resolve, reject){
    	pesan_loading('HAPUS Rekening idstandarharga = '+idstandarharga+' , idakun = '+idakun);
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen_akun/delete',                                    
			type: 'POST',	      				
			data: {            
					tahun: _token.tahun,				
					id_daerah: _token.daerah_id,	
					id_user_log: _token.user_id,
					id_daerah_log: _token.daerah_id,
					id_standar_harga: idstandarharga,
					id_akun: idakun
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(){
	      		return resolve();
	      	}
	    });
    });
}

function show_id_ssh(){
	show_loading();	
	jQuery('#kt_content_container tbody tr').map(function(i, b){
		 var id = jQuery(b).find('input[type="checkbox"].set_lockKomponen').attr('value');
		 if(id){
			 var nama = jQuery(b).find('td').eq(2);
			 if(nama.find('.link-detail-ssh').length == 0){
				 nama.html('( <span class="link-detail-ssh">'+id+'</span> ) '+nama.html());
			 }
		}
	});
	hide_loading();
}

function show_akun_ssh(){
	show_loading();
	jQuery('#kt_content_container tbody tr').map(function(i, b){
		if(document.getElementsByClassName('tambah-komponen').length){ 
			 var id = jQuery(b).find('td').eq(7).find('a').attr('onclick');
			 if(id){
				 id = id.split("'")[1];
				 var nama = jQuery(b).find('td').eq(2);
				 if(nama.find('.link-detail-akun-ssh').length == 0){
					 nama.html('( <span class="link-detail-akun-ssh"><textarea>'+id+'</textarea></span> ) '+nama.html());
				 }
			 }
		}else{
			 var id = jQuery(b).find('td').eq(6).find('a').attr('onclick');
			 if(id){
				 id = id.split("'")[1];
				 var nama = jQuery(b).find('td').eq(1);
				 if(nama.find('.link-detail-akun-ssh').length == 0){
					 nama.html('( <span class="link-detail-akun-ssh"><textarea>'+id+'</textarea></span> ) '+nama.html());
				 }
			 }
		}
	});
	hide_loading();
}

function get_rekening_all(){
	return new Promise(function(resolve, reject){
		if(typeof global_all_rekening == 'undefined'){
			pesan_loading("Get master Rekening");
			relayAjax({
				url: config.sipd_url+'api/master/akun/listNew',
				type: 'POST',
				data: {
					tahun: _token.tahun,
					id_daerah: _token.daerah_id,
                	deleted_data: true,
	                length: 1213070,
	                start: 0,
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},
				success: function(res){
					window.global_all_rekening = res.data;
					return resolve(res.data);
				}
			});
		}else{
			resolve(global_all_rekening);
		}
	});
}

function get_usulan_ssh_dari_lokal(){
	show_loading();
	var data_post = { 
		action: 'get_usulan_ssh_sipd',
		tahun_anggaran: _token.tahun,
		api_key: config.api_key,
		tipe: type_data_ssh
	};
	var data = {
	    message:{
	        type: "get-url",
	        content: {
			    url: config.url_server_lokal,
			    type: 'post',
			    data: data_post,
			    return: true
			}
	    }
	};
	chrome.runtime.sendMessage(data, function(response) {
	    console.log('responeMessage', response);
	});
}

function singkron_ssh_dari_lokal(usulan){
	var body = '';
	window.data_usulan_ssh = {};
	usulan.data.map(function(b, i){
		data_usulan_ssh[b.id] = b;
		var akun_all = [];
		b.akun.map(function(bb, ii){
			akun_all.push(bb.nama_akun);
		});
		var kode_standar_harga = b.kode_standar_harga;
		if(b.kode_standar_harga_sipd){
			kode_standar_harga += '<br>(Kode SIPD : '+b.kode_standar_harga_sipd+')';
		}
		var jenis_produk = '';
		if(b.jenis_produk == 0){
			jenis_produk = 'Produk Luar Negri';
		}else if(b.jenis_produk == 1){
			jenis_produk = 'Produk Dalam Negri';
		}
		body += ''
			+'<tr>'
				+'<td><input type="checkbox" value="'+b.id+'"></td>'
				+'<td class="text-center">'+kode_standar_harga+'</td>'
				+'<td class="text-center">'+b.status_jenis_usulan+'</td>'
				+'<td>'+b.nama_standar_harga+'</td>'
				+'<td>'+b.spek+'</td>'
				+'<td class="text-center">'+b.satuan+'</td>'
				+'<td class="text-right">'+formatMoney(b.harga)+'</td>'
				+'<td class="text-center">'+jenis_produk+'<br>'+b.tkdn+'%</td>'
				+'<td>'+akun_all.join('<br>')+'</td>'
			+'</tr>';
	});
	jQuery('#usulan-ssh tbody').html(body);
	run_script("show_modal_usulan_ssh");
	hide_loading();
}

function singkron_usulan_ssh_dari_lokal_modal() {
	var list_usulan_selected = [];
	var nama_usulan = [];
	jQuery('#usulan-ssh-table tbody input[type="checkbox"]').map(function(i, b){
		if(jQuery(b).is(':checked')){
			var data = data_usulan_ssh[jQuery(b).val()];
			list_usulan_selected.push(data);
			nama_usulan.push(data.nama_standar_harga);
		}
	});
	if(list_usulan_selected.length == 0){
		alert('Pilih dulu item SSH yang akan disimpan!');
	}else{
		console.log('list_usulan_selected', list_usulan_selected);
		if (confirm('Apakah anda yakin menyimpan data ini? '+nama_usulan.join(','))) {
			simpan_usulan_ssh(list_usulan_selected);
		}
	}
}

function get_ssh_unik(){
	return new Promise(function(resolve, reject){
		get_all_ssh_sipd(type_data_ssh)
		.then(function(data_ssh){
			var data_all_ssh = {};
			data_ssh.data.data.map(function(b, i){
				var id_duplikat = b.kode_kel_standar_harga+''+b.nama_standar_harga+''+b.spek+''+b.satuan+''+b.harga;
				data_all_ssh[id_duplikat] = b;
			});
			resolve(data_all_ssh);
		});
	});
}

function simpan_usulan_ssh(list_usulan_selected){
	show_loading();
	get_rekening_all()
	.then(function(akun){
		var akun_all = {};
		akun.data.map(function(b, i){
			akun_all[b.kode_akun] = b;
		});
		get_ssh_unik()
		.then(function(ssh_unik){
			var kelompok_id = {};
			jQuery('select[name="kategori_komponen"] option').map(function(i, b){
				var opsi = jQuery(b);
				var kode = opsi.html().trim().split('&nbsp;')[0];
				var val = opsi.val();
				kelompok_id[kode] = val;
			});
			var id_all = [];
			var last = list_usulan_selected.length - 1;
			list_usulan_selected.reduce(function(sequence, nextData){
		        return sequence.then(function(current_data){
		    		return new Promise(function(resolve_reduce, reject_reduce){
		    			if(current_data.akun.length == 0){
		    				console.log('Data akun tidak boleh kosong!', current_data);
		    				return resolve_reduce();
		    			}
	    				var id_duplikat = current_data.kode_kel_standar_harga+''+current_data.nama_standar_harga+''+current_data.spek+''+current_data.satuan+''+current_data.harga;
	    				if(!ssh_unik[id_duplikat]){
	    					if(kelompok_id[current_data.kode_kel_standar_harga]){
	    						var param_ssh = {
	    							tahun: _token.tahun,
									id_daerah: _token.daerah_id,
									id_kel_standar_harga: kelompok_id[current_data.kode_kel_standar_harga],
									kode_kel_standar_harga: current_data.kelompok,
									nama_standar_harga: current_data.nama_standar_harga,
									spek: current_data.spek,
									satuan: current_data.satuan,
									id_satuan: '',
									harga: current_data.harga,
									is_pdn: current_data.jenis_produk,
									nilai_tkdn: current_data.tkdn,
									kelompok: current_data.kelompok,
									tipe_standar_harga: type_data_ssh,
									id_user_log: _token.user_id,
									id_daerah_log: _token.daerah_id,
									created_user: _token.user_id,
									id_akun: ''
	    						};
					    		if(current_data.akun.length >= 1){
					    			var lokal_akun = current_data.akun.shift();
					    			if(akun_all[lokal_akun.kode_akun]){
					    				param_ssh['id_akun'] = akun_all[lokal_akun.kode_akun].id_akun;
					    			}else{
					    				console.log('Data akun tidak ditemukan di SIPD!', lokal_akun);
					    			}
					    		}
								console.log('SIMPAN SSH', current_data);
					    		relayAjax({
									url: config.sipd_url+'api/master/d_komponen/add',
									type: 'post',
									data: param_ssh,
									beforeSend: function (xhr) {			    
										xhr.setRequestHeader("X-API-KEY", x_api_key());
										xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
									},
									success: function(html){
										id_all.push(current_data.id);
										get_all_ssh_sipd(type_data_ssh, current_data.nama_standar_harga)
										.then(function(data_ssh){
				    						var promise_all = [];
											if(current_data.akun.length >= 1){
												var cek_id = false;
												data_ssh.data.data.map(function(b, i){
													var id_sipd = b.kode_kel_standar_harga+''+b.nama_standar_harga+''+b.spek+''+b.satuan+''+b.harga;
													if(id_sipd == id_duplikat){
														cek_id = b.id_standar_harga;
													}
												});
												if(cek_id){
									    			promise_all = current_data.akun.map(function(b, i){
									    				return new Promise(function(resolve2, reject2){
									    					simpan_rekening(cek_id, b.id_akun)
									    					.then(function(){
									    						resolve2();
									    					});
									    				});
									    			});
												}else{
													console.log('Id standar harga SIPD tidak ditemukan!', current_data, data_ssh);
												}
								    		}
								    		Promise.all(promise_all)
					    					.then(function(){
												resolve_reduce(nextData);
											});
										});
				            		}
				            	});
			    			}else{
			    				console.log('Kelompok SSH tidak ditemukan!', current_data);
			    				resolve_reduce(nextData);
			    			}
	    				}else if(current_data.status_jenis_usulan == 'tambah_akun'){
	    					var id_standar_harga = ssh_unik[id_duplikat].id_standar_harga;
			    			var promise_all = [];
				    		if(current_data.akun.length >= 1){
				    			promise_all = current_data.akun.map(function(lokal_akun, i){
				    				return new Promise(function(resolve2, reject2){
				    					if(akun_all[lokal_akun.kode_akun]){
						    				simpan_rekening(id_standar_harga, akun_all[lokal_akun.kode_akun].id_akun)
						    				.then(function(){
						    					resolve2();
						    				});
				    					}else{
				    						console.log('Data akun tidak ditemukan di SIPD!', lokal_akun);
				    						resolve2();
				    					}
				    				})
				    			});
				    		}
				    		Promise.all(promise_all)
				    		.then(function(){
								id_all.push(current_data.id);
				    			resolve_reduce(nextData);
				    		});
				    	}else{
		    				console.log('Item SSH sudah ada!', current_data, ssh_unik[id_duplikat]);
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
		    }, Promise.resolve(list_usulan_selected[last]))
		    .then(function(data_last){
				run_script('hide_modal', 'usulan-ssh');
		    	var opsi = { 
					action: 'update_usulan_ssh_sipd',
					api_key: config.api_key,
					data_id : id_all,
					tahun_anggaran : config.tahun_anggaran
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
		});
	});
}