function singkron_user_dewan_lokal(level){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/user/listuserbylevelid',
			type: 'POST',
			data: {            
				id_daerah: _token.daerah_id,				
				id_level: level,
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(dewan){
				pesan_loading('Simpan data Master User ke DB Lokal!');			
				var last = dewan.data.length-1;
				var first = true;
				dewan.data.reduce(function(sequence, nextData){
					return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){
							var active = 1;
							if (current_data.is_locked == 1)
							{
								var active = 0;
							}
							var iduser = current_data.id_user;						 
							var kunci = current_data.is_locked;
							if(level == 16 || level == 20)
							{								
								get_view_user(iduser).then(function(detil){
									var data_dewan = { 
										action: 'singkron_user_dewan',
										type: 'ri',
										tahun_anggaran: _token.tahun,
										api_key: config.api_key,
										data: {}
									};
									data_dewan.data.is_locked = current_data.is_locked; //baru int
									data_dewan.data.active = active;
									data_dewan.data.accasmas = detil.data.accAsmas;
									data_dewan.data.accbankeu = detil.data.accBankeu;
									data_dewan.data.accdisposisi = detil.data.accDisposisi;
									data_dewan.data.accgiat = detil.data.accGiat;
									data_dewan.data.acchibah = detil.data.accHibban;
									data_dewan.data.accinput = detil.data.accInput;
									data_dewan.data.accjadwal = detil.data.accJadwal;
									data_dewan.data.acckunci = detil.data.accKunci;
									data_dewan.data.accmaster = detil.data.accMaster;
									data_dewan.data.accmonitor = detil.data.accMonitor; //baru
									data_dewan.data.accspv = detil.data.accSpv;
									data_dewan.data.accunit = detil.data.accUnit;
									data_dewan.data.accusulan = detil.data.accUsulan;
									data_dewan.data.akses_user = detil.data.akses_user; //baru
									data_dewan.data.idlevel = detil.data.id_level;
									data_dewan.data.idprofil = detil.data.id_profil;
									data_dewan.data.iduser = detil.data.id_user;
									data_dewan.data.jabatan = detil.data.jabatan;
									data_dewan.data.loginname = detil.data.login_name;
									data_dewan.data.nama = detil.data.nama_user;
									data_dewan.data.nip = detil.data.nip;								

									var idusers = detil.data.id_user;
									var idprofil = detil.data.id_profil;										
									get_view_profil(idusers, idprofil).then(function(profil){										
										data_dewan.data.akta_kumham = profil.data[0].akta_kumham; //baru teks
										data_dewan.data.alamatteks = profil.data[0].alamat_teks;
										data_dewan.data.dapil = profil.data[0].dapil;
										data_dewan.data.emailteks = profil.data[0].email_teks;
										data_dewan.data.fraksi = profil.data[0].fraksi_dewan;
										data_dewan.data.iddaerahpengusul = profil.data[0].id_daerah;
										data_dewan.data.id_jenis_profil = profil.data[0].id_jenis_profil; // baru int
										data_dewan.data.idkabkota = profil.data[0].id_kab_kota;									
										data_dewan.data.idcamat = profil.data[0].id_kecamatan;									
										data_dewan.data.idlurah = profil.data[0].id_kelurahan;
										data_dewan.data.idlokasidesa = profil.data[0].id_kelurahan;
										data_dewan.data.idlurahpengusul = profil.data[0].id_kelurahan;
										data_dewan.data.ijin_op = profil.data[0].ijin_op; //baru teks										
										data_dewan.data.is_profil_ok = profil.data[0].is_profil_ok; //baru int
										data_dewan.data.is_vertikal = profil.data[0].is_vertikal; //baru int									
										data_dewan.data.map_lat_lokasi = profil.data[0].map_lat_lokasi; //baru teks
										data_dewan.data.map_lng_lokasi = profil.data[0].map_lng_lokasi; //baru teks
										data_dewan.data.namapengusul = profil.data[0].nama_teks;
										data_dewan.data.nik = profil.data[0].nik;
										data_dewan.data.no_sertifikat = profil.data[0].no_sertifikat; //baru teks
										data_dewan.data.notelp = profil.data[0].no_telp;
										data_dewan.data.npwp = profil.data[0].npwp;
										data_dewan.data.path_foto = profil.data[0].path_foto; //baru teks
										data_dewan.data.surat_dom = profil.data[0].surat_dom; //baru teks

										var iddaerah = profil.data[0].id_kab_kota;
										var idkecamatan = profil.data[0].id_kecamatan;
										var idkelurahan = profil.data[0].id_kelurahan;
										get_view_daerah(iddaerah).then(function(daerah){
											data_dewan.data.daerahpengusul = daerah.data[0].nama_daerah;										
											get_view_kecamatan(idkecamatan).then(function(kecamatan){
												data_dewan.data.camatteks = kecamatan.data[0].camat_teks;
												data_dewan.data.kode_camat = kecamatan.data[0].kode_camat; //baru teks
												// data_dewan.data.kode_ddn = kecamatan.data[0].kode_ddn; //baru teks
												// data_dewan.data.kode_ddn_2 = kecamatan.data[0].kode_ddn_2; //baru teks
												
												get_view_desa_kel(idkelurahan).then(function(kelurahan){
													data_dewan.data.lokasidesateks = kelurahan.data[0].lurah_teks;
													data_dewan.data.lurahteks = kelurahan.data[0].lurah_teks;
													data_dewan.data.kode_lurah = kelurahan.data[0].kode_lurah; //baru teks
													data_dewan.data.kode_ddn = kelurahan.data[0].kode_ddn; //baru teks
													data_dewan.data.kode_ddn_2 = kelurahan.data[0].kode_ddn_2; //baru teks
													data_dewan.data.is_desa = kelurahan.data[0].is_desa; //baru int

														var data = {
															message:{
																type: "get-url",
																content: {
																	url: config.url_server_lokal,
																	type: 'post',
																	data: data_dewan,
																	return: false
																}
															}
														};
														chrome.runtime.sendMessage(data, function(response) {
															console.log('responeMessage', response);
															resolve_reduce(nextData);
														});
												});
											});
										});
									})
								})
							}
							else
							{
								get_view_user(iduser).then(function(detil){										
										var data_dewan = { 
											action: 'singkron_user_dewan',
											type: 'ri',
											tahun_anggaran: _token.tahun,
											api_key: config.api_key,
											data: {}
										};
										data_dewan.data.is_locked = current_data.is_locked; //baru int
										data_dewan.data.active = active;
										data_dewan.data.accasmas = detil.data.accAsmas;
										data_dewan.data.accbankeu = detil.data.accBankeu;
										data_dewan.data.accdisposisi = detil.data.accDisposisi;
										data_dewan.data.accgiat = detil.data.accGiat;
										data_dewan.data.acchibah = detil.data.accHibban;
										data_dewan.data.accinput = detil.data.accInput;
										data_dewan.data.accjadwal = detil.data.accJadwal;
										data_dewan.data.acckunci = detil.data.accKunci;
										data_dewan.data.accmaster = detil.data.accMaster;
										data_dewan.data.accmonitor = detil.data.accMonitor; //baru
										data_dewan.data.accspv = detil.data.accSpv;
										data_dewan.data.accunit = detil.data.accUnit;
										data_dewan.data.accusulan = detil.data.accUsulan;
										data_dewan.data.akses_user = detil.data.akses_user; //baru
										data_dewan.data.idlevel = detil.data.id_level;
										data_dewan.data.idprofil = detil.data.id_profil;
										data_dewan.data.iduser = detil.data.id_user;
										data_dewan.data.jabatan = detil.data.jabatan;
										data_dewan.data.loginname = detil.data.login_name;
										data_dewan.data.nama = detil.data.nama_user;
										data_dewan.data.nip = detil.data.nip;
										
											var data = {
												message:{
													type: "get-url",
													content: {
														url: config.url_server_lokal,
														type: 'post',
														data: data_dewan,
														return: false
													}
												}
											};
											chrome.runtime.sendMessage(data, function(response) {
												console.log('responeMessage', response);
												resolve_reduce(nextData);
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
				}, Promise.resolve(dewan.data[last]))
				.then(function(data_last){
					alert('Berhasil singkron data User!');
					hide_loading();
				});
			}
		});
	}
}

function singkron_user_masyarakat_lokal(level){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();		
		
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/user/list_user_masyarakat',
			type: 'POST',
			data: {            
				id_daerah: _token.daerah_id,				
				// id_level: level,
				tahun: _token.tahun,
				// deleted_data: true,
				// order[0][column]: 0,
				// order[0][dir]: asc,
				// search[value]: '',
				length: 200000,
				start: 0,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(dewan){				
				pesan_loading('Simpan data Master User Individu / Lembaga ke DB Lokal!');			
				var last = dewan.data.data.length-1;
				var first = true;
				dewan.data.data.reduce(function(sequence, nextData){
				    return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){							
							var active = 1;
							if (current_data.is_profil_ok != 1)
							{
								var active = 0;
							}
							var iduser = current_data.id_user;						 															
								get_view_user(iduser).then(function(detil){
									var data_dewan = { 
										action: 'singkron_user_dewan',
										type: 'ri',
						                tahun_anggaran: _token.tahun,
										api_key: config.api_key,
										data: {}
									};
									
									data_dewan.data.status = current_data.status; //baru teks
									data_dewan.data.active = active;
									data_dewan.data.accasmas = detil.data.accAsmas;
									data_dewan.data.accbankeu = detil.data.accBankeu;
									data_dewan.data.accdisposisi = detil.data.accDisposisi;
									data_dewan.data.accgiat = detil.data.accGiat;
									data_dewan.data.acchibah = detil.data.accHibban;
									data_dewan.data.accinput = detil.data.accInput;
									data_dewan.data.accjadwal = detil.data.accJadwal;
									data_dewan.data.acckunci = detil.data.accKunci;
									data_dewan.data.accmaster = detil.data.accMaster;
									data_dewan.data.accmonitor = detil.data.accMonitor; //baru
									data_dewan.data.accspv = detil.data.accSpv;
									data_dewan.data.accunit = detil.data.accUnit;
									data_dewan.data.accusulan = detil.data.accUsulan;
									data_dewan.data.akses_user = detil.data.akses_user; //baru
									data_dewan.data.idlevel = detil.data.id_level;
									data_dewan.data.idprofil = detil.data.id_profil;
									data_dewan.data.iduser = detil.data.id_user;
									data_dewan.data.jabatan = detil.data.jabatan;
									data_dewan.data.loginname = detil.data.login_name;
									data_dewan.data.nama = detil.data.nama_user;
									data_dewan.data.nip = detil.data.nip;								

									var idusers = detil.data.id_user;
									var idprofil = detil.data.id_profil;										
									get_view_profil_asmas(idusers, idprofil).then(function(profil){										
										data_dewan.data.akta_kumham = profil.data[0].akta_kumham; //baru teks
										data_dewan.data.alamatteks = profil.data[0].alamat_teks;
										data_dewan.data.dapil = profil.data[0].dapil;
										data_dewan.data.emailteks = profil.data[0].email_teks;
										data_dewan.data.fraksi = profil.data[0].fraksi_dewan;
										data_dewan.data.iddaerahpengusul = profil.data[0].id_daerah;
										data_dewan.data.id_jenis_profil = profil.data[0].id_jenis_profil; // baru int
										data_dewan.data.idkabkota = profil.data[0].id_kab_kota;									
										data_dewan.data.idcamat = profil.data[0].id_kecamatan;									
										data_dewan.data.idlurah = profil.data[0].id_kelurahan;
										data_dewan.data.idlokasidesa = profil.data[0].id_kelurahan;
										data_dewan.data.idlurahpengusul = profil.data[0].id_kelurahan;
										data_dewan.data.ijin_op = profil.data[0].ijin_op; //baru teks										
										data_dewan.data.is_profil_ok = profil.data[0].is_profil_ok; //baru int
										data_dewan.data.is_vertikal = profil.data[0].is_vertikal; //baru int									
										data_dewan.data.map_lat_lokasi = profil.data[0].map_lat_lokasi; //baru teks
										data_dewan.data.map_lng_lokasi = profil.data[0].map_lng_lokasi; //baru teks
										data_dewan.data.namapengusul = profil.data[0].nama_teks;
										data_dewan.data.nik = profil.data[0].nik;
										data_dewan.data.no_sertifikat = profil.data[0].no_sertifikat; //baru teks
										data_dewan.data.notelp = profil.data[0].no_telp;
										data_dewan.data.npwp = profil.data[0].npwp;
										data_dewan.data.path_foto = profil.data[0].path_foto; //baru teks
										data_dewan.data.surat_dom = profil.data[0].surat_dom; //baru teks

										var iddaerah = profil.data[0].id_kab_kota;
										var idkecamatan = profil.data[0].id_kecamatan;
										var idkelurahan = profil.data[0].id_kelurahan;
										get_view_daerah(iddaerah).then(function(daerah){
											data_dewan.data.daerahpengusul = daerah.data[0].nama_daerah;										
											get_view_kecamatan(idkecamatan).then(function(kecamatan){
												data_dewan.data.camatteks = kecamatan.data[0].camat_teks;
												data_dewan.data.kode_camat = kecamatan.data[0].kode_camat; //baru teks
												// data_dewan.data.kode_ddn = kecamatan.data[0].kode_ddn; //baru teks
												// data_dewan.data.kode_ddn_2 = kecamatan.data[0].kode_ddn_2; //baru teks											
												get_view_desa_kel(idkelurahan).then(function(kelurahan){
													data_dewan.data.lokasidesateks = kelurahan.data[0].lurah_teks;
													data_dewan.data.lurahteks = kelurahan.data[0].lurah_teks;
													data_dewan.data.kode_lurah = kelurahan.data[0].kode_lurah; //baru teks
													data_dewan.data.kode_ddn = kelurahan.data[0].kode_ddn; //baru teks
													data_dewan.data.kode_ddn_2 = kelurahan.data[0].kode_ddn_2; //baru teks
													data_dewan.data.is_desa = kelurahan.data[0].is_desa; //baru int	
													
													var data = {
														message:{
															type: "get-url",
															content: {
																url: config.url_server_lokal,
																type: 'post',
																data: data_dewan,
																return: false
															}
														}
													};
													chrome.runtime.sendMessage(data, function(response) {
														console.log('responeMessage', response);
														resolve_reduce(nextData);
													});
												});
											});
										});
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
				}, Promise.resolve(dewan.data.data[last]))
				.then(function(data_last){
					alert('Berhasil singkron data User!');
					hide_loading();
				});
			}
		});
	}
}

function singkron_user_mitra_lokal(level, model){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();			
		var apiKey = x_api_key();
		relayAjax({
			url: config.sipd_url+'api/master/user/listuserbylevelid',
			type: 'POST',
			data: {            
				id_daerah: _token.daerah_id,				
				id_level: level,
				tahun: _token.tahun,
				// deleted_data: true,
				// order[0][column]: 0,
				// order[0][dir]: asc,
				// search[value]: '',
				// length: 200000,
				// start: 0,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(dewan){				
				pesan_loading('Simpan data Master User Mitra / Penyelia ke DB Lokal!');		
				
				var last = dewan.data.length-1;
				var first = true;
				dewan.data.reduce(function(sequence, nextData){
				    return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){							
							var active = 1;
							if (current_data.is_locked == 1)
							{
								var active = 0;
							}
							var iduser = current_data.id_user;						 															
								get_view_user(iduser).then(function(detil){
									var data_dewan = { 
										action: 'singkron_user_dewan',
										type: 'ri',
						                tahun_anggaran: _token.tahun,
										api_key: config.api_key,
										data: {}
									};
									
									data_dewan.data.is_locked = current_data.is_locked; //baru int
									data_dewan.data.active = active;
									data_dewan.data.accasmas = detil.data.accAsmas;
									data_dewan.data.accbankeu = detil.data.accBankeu;
									data_dewan.data.accdisposisi = detil.data.accDisposisi;
									data_dewan.data.accgiat = detil.data.accGiat;
									data_dewan.data.acchibah = detil.data.accHibban;
									data_dewan.data.accinput = detil.data.accInput;
									data_dewan.data.accjadwal = detil.data.accJadwal;
									data_dewan.data.acckunci = detil.data.accKunci;
									data_dewan.data.accmaster = detil.data.accMaster;
									data_dewan.data.accmonitor = detil.data.accMonitor; //baru
									data_dewan.data.accspv = detil.data.accSpv;
									data_dewan.data.accunit = detil.data.accUnit;
									data_dewan.data.accusulan = detil.data.accUsulan;
									data_dewan.data.akses_user = detil.data.akses_user; //baru
									data_dewan.data.idlevel = detil.data.id_level;
									data_dewan.data.idprofil = detil.data.id_profil;
									data_dewan.data.iduser = detil.data.id_user;
									data_dewan.data.jabatan = detil.data.jabatan;
									data_dewan.data.loginname = detil.data.login_name;
									data_dewan.data.nama = detil.data.nama_user;
									data_dewan.data.nip = detil.data.nip;								

									var idusers = detil.data.id_user;
									get_skpd_pemangku(idusers, model).then(function(skpd){
											
										if(skpd.data.length >= 1){
											var data_skpd = { 
												action: 'singkron_skpd_mitra_bappeda',
												type: 'ri',
												tahun_anggaran: _token.tahun,
												api_key: config.api_key,
												id_user: current_data.id_user,
												data: []
											};
											skpd.data.map(function(b, i){
												var current_user_skpd = {};
												current_user_skpd.akses_user = b.akses_user;
												current_user_skpd.id_level = b.id_level;
												current_user_skpd.id_unit = b.id_unit;
												current_user_skpd.id_user = b.id_user;
												current_user_skpd.is_locked = b.is_locked;
												current_user_skpd.kode_skpd = b.kode_skpd;
												current_user_skpd.login_name = b.login_name;
												current_user_skpd.nama_skpd = b.nama_skpd;
												current_user_skpd.nama_user = b.nama_user;
												current_user_skpd.nip = b.nip;
												data_skpd.data.push(current_user_skpd);
											});
									
											var data = {
												message:{
													type: "get-url",
													content: {
														url: config.url_server_lokal,
														type: 'post',
														data: data_skpd,
														return: false
													}
												}
											};
											chrome.runtime.sendMessage(data, function(response) {
												console.log('responeMessage', response);
												resolve_reduce(nextData);
											});
										}

										var data = {
											message:{
												type: "get-url",
												content: {
													url: config.url_server_lokal,
													type: 'post',
													data: data_dewan,
													return: false
												}
											}
										};
										chrome.runtime.sendMessage(data, function(response) {
											console.log('responeMessage', response);
											resolve_reduce(nextData);
										});
										
									})
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
				}, Promise.resolve(dewan.data[last]))
				.then(function(data_last){
					alert('Berhasil singkron data User!');
					hide_loading();
				});
			}
		});
	}
}

function singkron_user_skpd_lokal(level, model, idunit){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();		
		var apiKey = x_api_key();
		if (idunit >= 1)
		{
			relayAjax({
				url: config.sipd_url+'api/master/user/listuserbylevelid',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,				
					id_level: level,
					tahun: _token.tahun,
					model: model,
					id_unit: idunit
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", apiKey);
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				success: function(dewan){				
					pesan_loading('Simpan data Master User SKPD ke DB Lokal!');							
					var last = dewan.data.length-1;
					var first = true;
					dewan.data.reduce(function(sequence, nextData){
						return sequence.then(function(current_data){
							return new Promise(function(resolve_reduce, reject_reduce){
								var active = 1;
								if (current_data.is_locked == 1)
								{
									var active = 0;
								}
								var iduser = current_data.id_user;		
								get_view_user(iduser).then(function(detil){
									var data_dewan = { 
										action: 'singkron_user_dewan',
										type: 'ri',
										tahun_anggaran: _token.tahun,
										api_key: config.api_key,
										data: {}
									};
									data_dewan.data.is_locked = current_data.is_locked; //baru int
									data_dewan.data.active = active;
									data_dewan.data.accasmas = detil.data.accAsmas;
									data_dewan.data.accbankeu = detil.data.accBankeu;
									data_dewan.data.accdisposisi = detil.data.accDisposisi;
									data_dewan.data.accgiat = detil.data.accGiat;
									data_dewan.data.acchibah = detil.data.accHibban;
									data_dewan.data.accinput = detil.data.accInput;
									data_dewan.data.accjadwal = detil.data.accJadwal;
									data_dewan.data.acckunci = detil.data.accKunci;
									data_dewan.data.accmaster = detil.data.accMaster;
									data_dewan.data.accmonitor = detil.data.accMonitor; //baru
									data_dewan.data.accspv = detil.data.accSpv;
									data_dewan.data.accunit = detil.data.accUnit;
									data_dewan.data.accusulan = detil.data.accUsulan;
									data_dewan.data.akses_user = detil.data.akses_user; //baru
									data_dewan.data.idlevel = detil.data.id_level;
									data_dewan.data.idprofil = detil.data.id_profil;
									data_dewan.data.iduser = detil.data.id_user;
									data_dewan.data.jabatan = detil.data.jabatan;
									data_dewan.data.loginname = detil.data.login_name;
									data_dewan.data.nama = detil.data.nama_user;
									data_dewan.data.nip = detil.data.nip;								
												
									var data = {
										message:{
											type: "get-url",
											content: {
												url: config.url_server_lokal,
												type: 'post',
												data: data_dewan,
												return: false
											}
										}
									};
									chrome.runtime.sendMessage(data, function(response) {
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
					}, Promise.resolve(dewan.data[last]))
					.then(function(data_last){
						alert('Berhasil singkron data User!');
						hide_loading();
					});			
				}
			})
		}
		else
		{
			relayAjax({
				url: config.sipd_url+'api/master/skpd/listNew',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,									
					tahun: _token.tahun,
					length: 100000,
					start: 0
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", apiKey);
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				success: function(opd){				
					pesan_loading('Get data Master SKPD');							
					var last = opd.data.data.length-1;
					opd.data.data.reduce(function(sequence, nextData){
						return sequence.then(function(opd_data){
							return new Promise(function(resolve_reduce, reject_reduce){
								var idunit = opd_data.id_skpd;
								get_listuserbylevelid(level, model, idunit).then(function(dewan){
									console.log('nama_skpd', opd_data.nama_skpd);
                                    pesan_loading('Simpan data User SKPD '+opd_data.nama_skpd+' ke DB Lokal!');											
									var lastopd = dewan.data.length-1;
									var first = true;
									dewan.data.reduce(function(sequence2, nextData2){
										return sequence2.then(function(current_data){
											return new Promise(function(resolve_reduce2, reject_reduce){
												var active = 1;
												if (current_data.is_locked == 1)
												{
													var active = 0;
												}
												var iduser = current_data.id_user;	
												
												get_view_user(iduser).then(function(detil){
													var data_dewan = { 
														action: 'singkron_user_dewan',
														type: 'ri',
														tahun_anggaran: _token.tahun,
														api_key: config.api_key,
														data: {}
													};													
													data_dewan.data.id_sub_skpd = current_data.id_unit;
													data_dewan.data.is_locked = current_data.is_locked; //baru int
													data_dewan.data.active = active;
													data_dewan.data.accasmas = detil.data.accAsmas;
													data_dewan.data.accbankeu = detil.data.accBankeu;
													data_dewan.data.accdisposisi = detil.data.accDisposisi;
													data_dewan.data.accgiat = detil.data.accGiat;
													data_dewan.data.acchibah = detil.data.accHibban;
													data_dewan.data.accinput = detil.data.accInput;
													data_dewan.data.accjadwal = detil.data.accJadwal;
													data_dewan.data.acckunci = detil.data.accKunci;
													data_dewan.data.accmaster = detil.data.accMaster;
													data_dewan.data.accmonitor = detil.data.accMonitor; //baru
													data_dewan.data.accspv = detil.data.accSpv;
													data_dewan.data.accunit = detil.data.accUnit;
													data_dewan.data.accusulan = detil.data.accUsulan;
													data_dewan.data.akses_user = detil.data.akses_user; //baru
													data_dewan.data.idlevel = detil.data.id_level;
													data_dewan.data.idprofil = detil.data.id_profil;
													data_dewan.data.iduser = detil.data.id_user;
													data_dewan.data.jabatan = detil.data.jabatan;
													data_dewan.data.loginname = detil.data.login_name;
													data_dewan.data.nama = detil.data.nama_user;
													data_dewan.data.nip = detil.data.nip;								
																
													var data = {
														message:{
															type: "get-url",
															content: {
																url: config.url_server_lokal,
																type: 'post',
																data: data_dewan,
																return: false
															}
														}
													};
													chrome.runtime.sendMessage(data, function(response) {
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
									// })
									}, Promise.resolve(dewan.data[lastopd]))
									.then(function(lastopd){										
										jQuery('#wrap-loading').show();
										pesan_loading('Selanjutnya data Master User SKPD ke DB Lokal!');	
										return resolve_reduce(nextData);
									}).catch(function(err){
										console.log('err', err);
										return resolve_redurce(nextData);
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
					}, Promise.resolve(opd.data.data[last]))
					.then(function(data_last){
						alert('Berhasil singkron data User!');
						hide_loading();
					});			
				}
			})
		}
	}		
}

function get_view_user(iduser){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/user/view',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					id_user: iduser
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(detil){
	      		return resolve(detil);
	      	}
	    });
    });
}

function get_view_profil_asmas(iduser, idprofil){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/profil_user/view_profil',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					id_user: iduser,
					id_profil: idprofil,					
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(profil){
	      		return resolve(profil);
	      	}
	    });
    });
}

function get_view_profil(iduser, idprofil){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/profil_user/view_profil',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					id_user: iduser,
					id_profil: idprofil,
					tahun: _token.tahun,
				},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(profil){
	      		return resolve(profil);
	      	}
	    });
    });
}

function get_opd(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/skpd/find_for_set_input',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					tahun: _token.tahun
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

function get_listuserbylevelid(level, model, idunit){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/user/listuserbylevelid',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				id_level: level,
				tahun: _token.tahun,
				model: model,
				id_unit: idunit
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(user_opd){
	      		return resolve(user_opd);
	      	}
	    });
    });
}

function get_skpd_pemangku(iduser, model){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/user/view_user_skpd_pemangku',                                    
			type: 'POST',	      				
			data: {            
					id_daerah: _token.daerah_id,				
					id_user: iduser,					
					tahun: _token.tahun,
					model: model,
				},
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

function get_view_daerah(iddaerah){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/daerah/view/'+iddaerah,                                    
			type: 'GET',	      				
			processData: false,
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(daerah){
	      		return resolve(daerah);
	      	}
	    });
    });
}

function get_view_kecamatan(idkecamatan){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/kecamatan/view/'+_token.daerah_id+'/'+idkecamatan,                                    
			type: 'GET',	      				
			processData: false,
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(kecamatan){
	      		return resolve(kecamatan);
	      	}
	    });
    });
}

function get_view_desa_kel(idkelurahan){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/master/kelurahan/view/'+_token.daerah_id+'/'+idkelurahan,                                    
			type: 'GET',	      				
			processData: false,
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(kelurahan){
	      		return resolve(kelurahan);
	      	}
	    });
    });
}