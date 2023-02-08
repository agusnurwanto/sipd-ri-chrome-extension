function get_arsip_ssh(opsi){
	//console.log(opsi, request.message.content);
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/list',
			type: 'post',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				kelompok: 1,
				tipe: 'SSH',
				is_locked: 3,
			},
			beforeSend: function (xhr) {
			    //xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(ret){
				//localStorage.setItem(auth_key, JSON.stringify(ret));
				resolve(ret);
			}
		})
	});
}


function singkron_ssh_ke_lokal(type_data_ssh){
	console.log('type_data_ssh', type_data_ssh);
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		jQuery('#wrap-loading').show();
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
				pesan_loading('Simpan data SSH ke Lokal!');
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
					jQuery('#wrap-loading').hide();
					jQuery('#persen-loading').html('');
					jQuery('#persen-loading').attr('persen', '');
					jQuery('#persen-loading').attr('total', '');
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
			if (b.tipe_standar_harga ='SSH') {
				kelompok = 1;
			}else if (b.tipe_standar_harga ='HSPK') {
				kelompok = 2;
			}else if (b.tipe_standar_harga ='ASB') {
				kelompok = 3;
			} else {
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
			// data_ssh.ssh[i].kelompok	= b.kelompok;
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
				// return: true
				return: false
			}
		}
	};
	chrome.runtime.sendMessage(data, function(response) {
		console.log('responeMessage', response);
	});
}

function hapus_arsip_ssh(opsi){
	return new Promise(function(resolve, reduce){
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/d_komponen/deleteArsip',
			type: 'post',
			data: {
				tahun: opsi.tahun,
				id_daerah: _token.daerah_id,				
				id_standar_harga: _token.id_standar_harga,
				id_user_log: _token.user_id,
				id_daerah_log: _token.daerah_id,
			},
			beforeSend: function (xhr) {
			    xhr.setRequestHeader("X-API-KEY", apiKey);
			},
			success: function(ret){
				resolve();
				if(ret.status_code == 403){
					console.log('Session user habis!');
				}else{
					console.log('success simpan visi!');
				}
			}
		})
	});
}