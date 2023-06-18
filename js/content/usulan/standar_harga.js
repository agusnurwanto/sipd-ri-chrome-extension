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
									console.log('rekening', val);							
									relayAjax({
										url: config.sipd_url+'api/master/d_komponen/listRekening',
										type: 'POST',
										data: {
											id_standar_harga: val.id_standar_harga,
											kode_standar_harga: val.kode_standar_harga,
											kelompok: kelompok,
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

function hapus_komponen(idstandarharga){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/delete',                                    
			type: 'POST',	      				
			data: {            
					tahun: _token.tahun,				
					id_daerah: _token.daerah_id,	
					id_user_log: 1,	
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
			for(var i in data_all_ssh){
				window.ssh_duplikat = {};
				var id = [];
				var url_hapus = [];
				var ssh = duplikat_ssh[i].detail;
				ssh.map(function(b, n){
					id.push(b.id_standar_harga+' ( '+b.kode_standar_harga+' )');
					// var url = b.action.split("hapusKomp('")[1].split("'")[0];
					// url_hapus.push(url);
					var keyword = b.id_standar_harga;
					//ssh_duplikat[keyword] = b;
				
					no++;
					html_duplikat += ''
						+'<tr>'
							+'<td>'+no+'</td>'
							//+'<td><input type="checkbox" class="list-ssh-duplikat" data-nama="'+ssh[0].nama_standar_harga +'('+id.join(', ')+')'+'"><br>'+id.join('<br>')+'</td>'
							+'<td class="text-center"><input type="checkbox" value="'+keyword+'"></td>'
							+'<td>'+id.join('<br>')+'</td>'
							//+'<td>'+ssh[0].id_standar_harga+' ( '+ssh[0].kode_standar_harga+' )</td>'
							+'<td>'+ssh[0].kode_kel_standar_harga+'</td>'
							+'<td>'+ssh[0].nama_standar_harga+'</td>'
							+'<td>'+ssh[0].spek+'</td>'
							+'<td>'+ssh[0].satuan+'</td>'
							+'<td>'+ssh[0].harga+'</td>'
						+'</tr>';
				});
			}
			console.log('data_all_ssh = '+l1, 'duplikat_ssh = '+l2);
			jQuery('#duplikat-komponen-akun .modal-title .info-title').html('( Jumlah Semua Data: '+l1+', Jumlah Duplikat: '+l2+' )');
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

function find_rekening(){
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

function set_mulit_rek(){
	var toolbar = jQuery('.card-header .card-toolbar.text-end .ng-star-inserted.dropdown');
	if(toolbar.find('.checkall-ssh').length == 0){
		toolbar.prepend('<label style="margin-right: 20px;"><input type="checkbox" class="checkall-ssh"> Ceklist All</label>');
	}
	jQuery('.sipd-table tbody > tr').map(function(){
		var td = jQuery(this).find('>td');
		var uraian = td.eq(1).text().trim();
		if(uraian){
			var span = td.eq(0).find('span');
			if(span.find('input[type="checkbox"]').length == 0){
				span.prepend('<input class="checkbox_ssh" type="checkbox" value="'+span.text()+'"> ');
			}
		}
	});
	var data_ssh = [];
	jQuery('.sipd-table tbody > tr > td input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_ssh.push([id]);
			console.log(id);
		}
	});
	
	if(data_ssh.length == 0){
		alert('Pilih dulu item Standar Harga!');
	}else{
		get_rekening_all()
		.then(function(akun){
			var akun_all = {};			
			var body = '';
			akun.data.map(function(b, i){				
				var keyword = data_ssh+'='+b.id_akun;
				akun_all[keyword] = b;							
				var existing = data_ssh;
				
				body += ''
					+'<tr>'								
						+'<td class="text-center"><input type="checkbox" value="'+keyword+'">'+existing+'</td>'
						+'<td>'+b.id_akun+'</td>'
						+'<td>'+b.kode_akun+'</td>'
						+'<td>'+b.nama_akun+'</td>'						
					+'</tr>';
			});
			jQuery('#table-extension-rekening tbody').html(body);
			run_script('show_modal', {
				id: 'modal-extension-rekening'
			});
			hide_loading();			
		});
	} 
}

function proses_simpan_multirek(){
	var data_multirek_selected = [];	
	jQuery('#table-extension-rekening tbody tr input[type="checkbox"]').map(function(i, b){
		var cek = jQuery(b).is(':checked');
		if(cek){
			var id = jQuery(b).val();
			data_multirek_selected.push([id]);
		}
	});
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
					console.log(current_data[0]);
					var data = current_data[0].split('=');					
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
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen_akun/add',                                    
			type: 'POST',	      				
			data: {            
					tahun: _token.tahun,				
					id_daerah: _token.daerah_id,	
					id_user_log: 1,	
					id_daerah_log: 1,					
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
	pesan_loading("Get master Rekening");
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/master/akun/listNew',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,				
                // deleted_data: true,
                // order[0][column]: 0,
                // order[0][dir]: asc,
                // search[value]: '',
                length: 21307,
                start: 0,
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
		body += ''
			+'<tr>'
				+'<td><input type="checkbox" value="'+b.id+'"></td>'
				+'<td>'+kode_standar_harga+'</td>'
				+'<td>'+b.status_jenis_usulan+'</td>'
				+'<td>'+b.nama_standar_harga+'</td>'
				+'<td>'+b.spek+'</td>'
				+'<td>'+b.satuan+' (Jenis Produk: '+b.jenis_produk+') (TKDN: '+b.tkdn+')</td>'
				+'<td>'+formatMoney(b.harga)+'</td>'
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
			// simpan_usulan_ssh(list_usulan_selected);
		}
	}
}