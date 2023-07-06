function backup_renstra(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		var apiKey = x_api_key();
		var sendData = [];
		jadwal_renstra_aktif(_token.tahun, _token.daerah_id).then(function(renstra_aktif){			
			sendData.push( new Promise(function(resolve, reject){								
				relayAjax({
						// url: 'https://sipd-ri.kemendagri.go.id/api/renstra/renstra_tujuan/list',					
						url: config.sipd_url+'api/renstra/renstra_tujuan/list',
						type: 'POST',
						data: {            
							id_daerah: _token.daerah_id,									
							tahun: _token.tahun,											
							id_tahap: renstra_aktif.data[0].id_tahap,
							length: 100000,
						},
						beforeSend: function (xhr) {			    
							xhr.setRequestHeader("X-API-KEY", apiKey);
							xhr.setRequestHeader("x-access-token", _token.token);
						},
						success: function (data) {
							var data_renstra = { 
								action: 'singkron_renstra_tujuan',
								type: 'ri',
								tahun_anggaran: _token.tahun,
								api_key: config.api_key,
								tujuan: []
							};
							var sendData2 = data.data.map(function(tujuan, i){
								return new Promise(function(resolve2, reject2){								
									relayAjax({									
										url: config.sipd_url+'api/renstra/renstra_tujuan/listDenganCekSasaran',
										type: 'POST',
										data: {            
											id_daerah: _token.daerah_id,									
											tahun: _token.tahun,											
											id_tahap: renstra_aktif.data[0].id_tahap,
											length: 100000,
										},
										beforeSend: function (xhr) {			    
											xhr.setRequestHeader("X-API-KEY", apiKey);
											xhr.setRequestHeader("x-access-token", _token.token);
										},
										success: function (kamus) {											
											data_renstra.tujuan[i] = {};											
											// data_renstra.tujuan[i].bidur_lock = tujuan.bidur_lock;
											data_renstra.tujuan[i].id_bidang_urusan = tujuan.id_bidang_urusan;
											data_renstra.tujuan[i].id_unik = tujuan.id_unik;
											data_renstra.tujuan[i].id_unik_indikator = tujuan.id_unik_indikator;
											data_renstra.tujuan[i].id_unit = tujuan.id_unit;
											data_renstra.tujuan[i].indikator_teks = tujuan.indikator_teks;
											data_renstra.tujuan[i].is_locked = tujuan.is_locked;
											data_renstra.tujuan[i].is_locked_indikator = tujuan.is_locked_indikator;
											// data_renstra.tujuan[i].kode_bidang_urusan = tujuan.kode_bidang_urusan;
											// data_renstra.tujuan[i].nama_bidang_urusan = tujuan.nama_bidang_urusan;
											// data_renstra.tujuan[i].kode_skpd = tujuan.kode_skpd;											
											// data_renstra.tujuan[i].nama_skpd = tujuan.nama_skpd;
											data_renstra.tujuan[i].satuan = tujuan.satuan;
											// data_renstra.tujuan[i].status = tujuan.status;
											data_renstra.tujuan[i].target_1 = tujuan.target_1;
											data_renstra.tujuan[i].target_2 = tujuan.target_2;
											data_renstra.tujuan[i].target_3 = tujuan.target_3;
											data_renstra.tujuan[i].target_4 = tujuan.target_4;
											data_renstra.tujuan[i].target_5 = tujuan.target_5;
											data_renstra.tujuan[i].target_akhir = tujuan.target_akhir;
											data_renstra.tujuan[i].target_awal = tujuan.target_awal;
											data_renstra.tujuan[i].tujuan_teks = tujuan.tujuan_teks;
											data_renstra.tujuan[i].urut_tujuan = tujuan.urut_tujuan;
											data_renstra.tujuan[i].kode_sasaran_rpjm = kamus.kode_sasaran_rpjm;											
											data_renstra.tujuan[i].id_tahap = kamus.id_tahap; //baru			
											data_renstra.tujuan[i].id_tujuan = kamus.id_tujuan; //baru																			
											data_renstra.tujuan[i].perlu_mutakhirkan = kamus.perlu_mutakhirkan; //baru
											data_renstra.tujuan[i].id_visi = kamus.id_visi; //baru
											data_renstra.tujuan[i].id_misi = kamus.id_misi; //baru
											data_renstra.tujuan[i].tahun_awal = kamus.tahun_awal; //baru
											data_renstra.tujuan[i].tahun_akhir = kamus.tahun_akhir; //baru
											var idbidangurusan = tujuan.id_bidang_urusan;											
											var tahun = _token.tahun;
											var idskpd = tujuan.id_unit;                        
                        					var iddaerah = _token.daerah_id;	
											get_bidang_urusan(idbidangurusan, tahun).then(function(bidur){												
												data_renstra.tujuan[i].kode_bidang_urusan = bidur.data[0].kode_bidang_urusan;
												data_renstra.tujuan[i].nama_bidang_urusan = bidur.data[0].nama_bidang_urusan;
												if(tujuan.id_unit != 0){
													get_detil_skpd({
														idskpd: idskpd,
														tahun: tahun,
														iddaerah: iddaerah
													})
													.then(function(data){														
														data_renstra.tujuan[i].kode_skpd = data.data[0].kode_unit;											
														data_renstra.tujuan[i].nama_skpd = data.data[0].nama_skpd;
													})
												}
											})											
											resolve2(true);
										}
									});
								});
							});
							Promise.all(sendData2)
							.then(function(all_data){
								var data = {
									message:{
										type: "get-url",
										content: {
											url: config.url_server_lokal,
											type: 'post',
											data: data_renstra,
											return: false
										}
									}
								};
								chrome.runtime.sendMessage(data, function(response) {
									console.log('responeMessage', response);
								});
								resolve(true);
							});
						}
				});				
			}) );
			sendData.push( new Promise(function(resolve, reject){
				relayAjax({				
					url: config.sipd_url+'api/renstra/renstra_sasaran/list',
					type: 'POST',
					data: {            
							id_daerah: _token.daerah_id,									
							tahun: _token.tahun,											
							id_tahap: renstra_aktif.data[0].id_tahap,
							length: 100000,
						},
					beforeSend: function (xhr) {			    
						xhr.setRequestHeader("X-API-KEY", apiKey);
						xhr.setRequestHeader("x-access-token", _token.token);
					},
					success: function (data) {
						var data_renstra = { 
							action: 'singkron_renstra_sasaran',
							type: 'ri',
							tahun_anggaran: _token.tahun,
							api_key: config.api_key,
							sasaran: []
						};
						data.data.map(function(sasaran, i){
							data_renstra.sasaran[i] = {};
							// data_renstra.sasaran[i].bidur_lock = sasaran.bidur_lock;
							data_renstra.sasaran[i].id_bidang_urusan = sasaran.id_bidang_urusan;
							data_renstra.sasaran[i].id_misi = sasaran.id_misi;
							data_renstra.sasaran[i].id_unik = sasaran.id_unik;
							data_renstra.sasaran[i].id_unik_indikator = sasaran.id_unik_indikator;
							data_renstra.sasaran[i].id_unit = sasaran.id_unit;
							data_renstra.sasaran[i].id_visi = sasaran.id_visi;
							data_renstra.sasaran[i].indikator_teks = sasaran.indikator_teks;
							data_renstra.sasaran[i].is_locked = sasaran.is_locked;
							data_renstra.sasaran[i].is_locked_indikator = sasaran.is_locked_indikator;
							// data_renstra.sasaran[i].kode_bidang_urusan = sasaran.kode_bidang_urusan;
							// data_renstra.sasaran[i].kode_skpd = sasaran.kode_skpd;
							data_renstra.sasaran[i].kode_tujuan = sasaran.kode_tujuan;
							// data_renstra.sasaran[i].nama_bidang_urusan = sasaran.nama_bidang_urusan;
							// data_renstra.sasaran[i].nama_skpd = sasaran.nama_skpd;
							data_renstra.sasaran[i].sasaran_teks = sasaran.sasaran_teks;
							data_renstra.sasaran[i].satuan = sasaran.satuan;
							// data_renstra.sasaran[i].status = sasaran.status;
							data_renstra.sasaran[i].target_1 = sasaran.target_1;
							data_renstra.sasaran[i].target_2 = sasaran.target_2;
							data_renstra.sasaran[i].target_3 = sasaran.target_3;
							data_renstra.sasaran[i].target_4 = sasaran.target_4;
							data_renstra.sasaran[i].target_5 = sasaran.target_5;
							data_renstra.sasaran[i].target_akhir = sasaran.target_akhir;
							data_renstra.sasaran[i].target_awal = sasaran.target_awal;
							// data_renstra.sasaran[i].tujuan_lock = sasaran.tujuan_lock;
							// data_renstra.sasaran[i].tujuan_teks = sasaran.tujuan_teks;
							data_renstra.sasaran[i].urut_sasaran = sasaran.urut_sasaran;
							// data_renstra.sasaran[i].urut_tujuan = sasaran.urut_tujuan;	
							data_renstra.tujuan[i].id_tahap = sasaran.id_tahap; //baru												
							data_renstra.sasaran[i].id_sasaran = sasaran.id_sasaran; //baru
							data_renstra.sasaran[i].id_tujuan_indikator = sasaran.id_tujuan_indikator; //baru
							data_renstra.sasaran[i].kode_sasaran_rpjm = sasaran.kode_sasaran_rpjm; //baru		
							data_renstra.sasaran[i].tahun_awal = sasaran.tahun_awal; //baru
							data_renstra.sasaran[i].tahun_akhir = sasaran.tahun_akhir; //baru
							var idbidangurusan = sasaran.id_bidang_urusan;							
							var tahun = _token.tahun;
							var idskpd = sasaran.id_unit;                        
                        	var iddaerah = _token.daerah_id;	
							get_bidang_urusan(idbidangurusan, tahun).then(function(bidur){
								data_renstra.sasaran[i].kode_bidang_urusan = bidur.data[0].kode_bidang_urusan;
								data_renstra.sasaran[i].nama_bidang_urusan = bidur.data[0].nama_bidang_urusan;
								if(sasaran.id_unit != 0){
									get_detil_skpd({
										idskpd: idskpd,
										tahun: tahun,
										iddaerah: iddaerah
									})
									.then(function(data){
										// console.log('html OPD Renstra', data);
										data_renstra.sasaran[i].kode_skpd = data.data[0].kode_unit;											
										data_renstra.sasaran[i].nama_skpd = data.data[0].nama_skpd;
									})
								}
							})																		
						});
						var data = {
							message:{
								type: "get-url",
								content: {
									url: config.url_server_lokal,
									type: 'post',
									data: data_renstra,
									return: false
								}
							}
						};
						chrome.runtime.sendMessage(data, function(response) {
							console.log('responeMessage', response);
						});
						resolve(true);
					}
				});
			}) );
			sendData.push( new Promise(function(resolve, reject){
				relayAjax({				
					url: config.sipd_url+'api/renstra/renstra_program/list',
					type: 'POST',
					data: {            
							id_daerah: _token.daerah_id,									
							tahun: _token.tahun,											
							id_tahap: renstra_aktif.data[0].id_tahap,
							length: 100000,
						},
					beforeSend: function (xhr) {			    
						xhr.setRequestHeader("X-API-KEY", apiKey);
						xhr.setRequestHeader("x-access-token", _token.token);
					},
					success: function (data) {
						var data_renstra = { 
							action: 'singkron_renstra_program',
							type: 'ri',
							tahun_anggaran: _token.tahun,
							api_key: config.api_key,
							program: []
						};
						var _length = 250;
						var data_all = [];
						var data_temp = [];
						data.data.map(function(program, i){
							var data_program = {};
							// data_program.bidur_lock = program.bidur_lock;
							data_program.id_bidang_urusan = program.id_bidang_urusan;
							data_program.id_misi = program.id_misi;
							data_program.id_program = program.id_program;
							data_program.id_unik = program.id_unik;
							data_program.id_unik_indikator = program.id_unik_indikator;
							data_program.id_unit = program.id_unit;
							data_program.id_visi = program.id_visi;
							data_program.indikator = program.indikator;
							data_program.is_locked = program.is_locked;
							data_program.is_locked_indikator = program.is_locked_indikator;
							
							data_program.kode_sasaran = program.kode_sasaran;
							
							data_program.kode_tujuan = program.kode_tujuan;
									
							data_program.pagu_1 = program.pagu_1;
							data_program.pagu_2 = program.pagu_2;
							data_program.pagu_3 = program.pagu_3;
							data_program.pagu_4 = program.pagu_4;
							data_program.pagu_5 = program.pagu_5;							
							// data_program.program_lock = program.program_lock;
							// data_program.sasaran_lock = program.sasaran_lock;
							// data_program.sasaran_teks = program.sasaran_teks;
							data_program.satuan = program.satuan;
							// data_program.status = program.status;
							data_program.target_1 = program.target_1;
							data_program.target_2 = program.target_2;
							data_program.target_3 = program.target_3;
							data_program.target_4 = program.target_4;
							data_program.target_5 = program.target_5;
							data_program.target_akhir = program.target_akhir;
							data_program.target_awal = program.target_awal;
							// data_program.tujuan_lock = program.tujuan_lock;
							// data_program.tujuan_teks = program.tujuan_teks;
							// data_program.urut_sasaran = program.urut_sasaran;
							// data_program.urut_tujuan = program.urut_tujuan;
							data_program.pagu_awal = program.pagu_awal; //baru
							data_program.pagu_akhir = program.pagu_akhir; //baru
							data_program.id_tahap = program.id_tahap; //baru	
							data_program.kode_sasaran_rpjm = program.kode_sasaran_rpjm; //baru	
							data_program.id_renstra_program = program.id_renstra_program; //baru	
							data_program.id_sasaran_indikator = program.id_sasaran_indikator; //baru
							data_program.tahun_awal = program.tahun_awal; //baru
							data_program.tahun_akhir = program.tahun_akhir; //baru	
							data_program.id_misi_old = program.id_misi_old; //baru	
							data_program.id_sasaran_old = program.id_sasaran_old; //baru	
							data_program.id_tujuan_old = program.id_tujuan_old; //baru	
							data_program.id_urusan = program.id_urusan; //baru	

							var idbidangurusan = program.id_bidang_urusan;
							var idprogram = program.id_program;
							var tahun = _token.tahun;
							var idskpd = program.id_unit;                        
                        	var iddaerah = _token.daerah_id;	
							get_program(idprogram, tahun).then(function(p){									
								data_program.kode_program = p.data[0].kode_program;								
								data_program.nama_program = p.data[0].nama_program;
								get_bidang_urusan(idbidangurusan, tahun).then(function(bidur){
									data_program.kode_bidang_urusan = bidur.data[0].kode_bidang_urusan;
									data_program.nama_bidang_urusan = bidur.data[0].nama_bidang_urusan;
									if(program.id_unit != 0){
										get_detil_skpd({
											idskpd: idskpd,
											tahun: tahun,
											iddaerah: iddaerah
										})
										.then(function(data){
											// console.log('html OPD Renstra', data);
											data_program.kode_skpd = data.data[0].kode_unit;											
											data_program.nama_skpd = data.data[0].nama_skpd;
										})
									}
								})	
							})					
							data_temp.push(data_program);
							if((i+1)%_length == 0){
								data_all.push(data_temp);
								data_temp = [];
							}
						});
						if(data_temp.length >= 1){
							data_all.push(data_temp);
						}
						data_all.map(function(b, i){
							data_renstra.page = i+1;
							data_renstra.program = b;
							var data = {
								message:{
									type: "get-url",
									content: {
										url: config.url_server_lokal,
										type: 'post',
										data: data_renstra,
										return: false
									}
								}
							};
							chrome.runtime.sendMessage(data, function(response) {
								console.log('responeMessage', response);
							});
						})
						resolve(true);
					}
				});
			}) );
			sendData.push( new Promise(function(resolve, reject){
				relayAjax({				
					url: config.sipd_url+'api/renstra/renstra_giat/list',
					type: 'POST',
					data: {            
							id_daerah: _token.daerah_id,									
							tahun: _token.tahun,											
							id_tahap: renstra_aktif.data[0].id_tahap,
							length: 100000,
						},
					beforeSend: function (xhr) {			    
						xhr.setRequestHeader("X-API-KEY", apiKey);
						xhr.setRequestHeader("x-access-token", _token.token);
					},
					success: function (data) {
						var data_renstra = { 
							action: 'singkron_renstra_kegiatan',
							type: 'ri',
							tahun_anggaran: _token.tahun,
							api_key: config.api_key,
							kegiatan: []
						};
						var _length = 250;
						var data_all = [];
						var data_temp = [];
						data.data.map(function(kegiatan, i){
							var data_keg = {};
							// data_keg.bidur_lock = kegiatan.bidur_lock;
							// data_keg.giat_lock = kegiatan.giat_lock;
							data_keg.id_bidang_urusan = kegiatan.id_bidang_urusan;
							data_keg.id_giat = kegiatan.id_giat;
							data_keg.id_misi = kegiatan.id_misi;
							data_keg.id_program = kegiatan.id_program;
							data_keg.id_unik = kegiatan.id_unik;
							data_keg.id_unik_indikator = kegiatan.id_unik_indikator;
							data_keg.id_unit = kegiatan.id_unit;
							data_keg.id_visi = kegiatan.id_visi;
							data_keg.indikator = kegiatan.indikator;
							data_keg.is_locked = kegiatan.is_locked;
							data_keg.is_locked_indikator = kegiatan.is_locked_indikator;
							// data_keg.kode_bidang_urusan = kegiatan.kode_bidang_urusan;
							// data_keg.kode_giat = kegiatan.kode_giat;
							// data_keg.kode_program = kegiatan.kode_program;
							data_keg.kode_sasaran = kegiatan.kode_sasaran;
							// data_keg.kode_skpd = kegiatan.kode_skpd;
							data_keg.kode_tujuan = kegiatan.kode_tujuan;
							// data_keg.kode_unik_program = kegiatan.kode_unik_program;
							// data_keg.nama_bidang_urusan = kegiatan.nama_bidang_urusan;
							// data_keg.nama_giat = kegiatan.nama_giat;
							// data_keg.nama_program = kegiatan.nama_program;
							// data_keg.nama_skpd = kegiatan.nama_skpd;
							
							data_keg.pagu_1 = kegiatan.pagu_1;
							data_keg.pagu_2 = kegiatan.pagu_2;
							data_keg.pagu_3 = kegiatan.pagu_3;
							data_keg.pagu_4 = kegiatan.pagu_4;
							data_keg.pagu_5 = kegiatan.pagu_5;
							
							// data_keg.program_lock = kegiatan.program_lock;
							// data_keg.renstra_prog_lock = kegiatan.renstra_prog_lock;
							// data_keg.sasaran_lock = kegiatan.sasaran_lock;
							// data_keg.sasaran_teks = kegiatan.sasaran_teks;
							data_keg.satuan = kegiatan.satuan;
							// data_keg.status = kegiatan.status;
							data_keg.target_1 = kegiatan.target_1;
							data_keg.target_2 = kegiatan.target_2;
							data_keg.target_3 = kegiatan.target_3;
							data_keg.target_4 = kegiatan.target_4;
							data_keg.target_5 = kegiatan.target_5;
							data_keg.target_akhir = kegiatan.target_akhir;
							data_keg.target_awal = kegiatan.target_awal;
							// data_keg.tujuan_lock = kegiatan.tujuan_lock;
							// data_keg.tujuan_teks = kegiatan.tujuan_teks;
							// data_keg.urut_sasaran = kegiatan.urut_sasaran;
							// data_keg.urut_tujuan = kegiatan.urut_tujuan;
							data_keg.pagu_awal = kegiatan.pagu_awal; //baru
							data_keg.pagu_akhir = kegiatan.pagu_akhir; //baru
							data_keg.id_rpjm_indikator = kegiatan.id_rpjm_indikator; //baru
							data_keg.id_tahap = kegiatan.id_tahap; //baru	
							data_keg.kode_sasaran_rpjm = kegiatan.kode_sasaran_rpjm; //baru
							data_keg.tahun_awal = kegiatan.tahun_awal; //baru
							data_keg.tahun_akhir = kegiatan.tahun_akhir; //baru	

							var idbidangurusan = kegiatan.id_bidang_urusan;
							var idprogram = kegiatan.id_program;
							var idgiat = kegiatan.id_giat;
							var tahun = _token.tahun;
							var idskpd = kegiatan.id_unit;                        
                        	var iddaerah = _token.daerah_id;
							get_giat(idgiat, tahun).then(function(g){
								data_keg.kode_giat = g.data[0].kode_giat;
								data_keg.nama_giat = g.data[0].nama_giat;
								get_program(idprogram, tahun).then(function(p){	
									data_keg.kode_program = p.data[0].kode_program;
									data_keg.nama_program = p.data[0].nama_program;
									get_bidang_urusan(idbidangurusan, tahun).then(function(bidur){
										data_keg.kode_bidang_urusan = bidur.data[0].kode_bidang_urusan;
										data_keg.nama_bidang_urusan = bidur.data[0].nama_bidang_urusan;
										if(kegiatan.id_unit != 0){
											get_detil_skpd({
												idskpd: idskpd,
												tahun: _token.tahun,
												iddaerah: iddaerah
											})
											.then(function(data){
												// console.log('html OPD Renstra', data);
												data_keg.kode_skpd = data.data[0].kode_unit;											
												data_keg.nama_skpd = data.data[0].nama_skpd;
											})
										}
									})	
								})
							})	
							data_temp.push(data_keg);
							if((i+1)%_length == 0){
								data_all.push(data_temp);
								data_temp = [];
							}
						});
						if(data_temp.length >= 1){
							data_all.push(data_temp);
						}
						data_all.map(function(b, i){
							data_renstra.page = i+1;
							data_renstra.kegiatan = b;
							var data = {
								message:{
									type: "get-url",
									content: {
										url: config.url_server_lokal,
										type: 'post',
										data: data_renstra,
										return: false
									}
								}
							};
							chrome.runtime.sendMessage(data, function(response) {
								console.log('responeMessage', response);
							});
						});
						resolve(true);
					}
				});
			}) );

			// sendData.push( new Promise(function(resolve, reject){
			// 	relayAjax({				
			// 		url: config.sipd_url+'api/renstra/renstra_sub_giat/list',
			// 		type: 'POST',
			// 		data: {            
			// 				id_daerah: _token.daerah_id,									
			// 				tahun: _token.tahun,											
			// 				id_tahap: renstra_aktif.data[0].id_tahap,
			// 				length: 100000,
			// 			},
			// 		beforeSend: function (xhr) {			    
			// 			xhr.setRequestHeader("X-API-KEY", apiKey);
			// 			xhr.setRequestHeader("x-access-token", _token.token);
			// 		},
			// 		success: function (data) {
			// 			var data_renstra = { 
			// 				action: 'singkron_renstra_sub_kegiatan',
			// 				type: 'ri',
			// 				tahun_anggaran: _token.tahun,
			// 				api_key: config.api_key,
			// 				sub_giat: []
			// 			};
			// 			var _length = 250;
			// 			var data_all = [];
			// 			var data_temp = [];
			// 			data.data.map(function(sub_giat, i){
			// 				var data_sub_giat = {};
			// 				// data_keg.bidur_lock = kegiatan.bidur_lock;
			// 				// data_keg.giat_lock = kegiatan.giat_lock;
			// 				data_sub_giat.id_bidang_urusan = sub_giat.id_bidang_urusan;
			// 				data_sub_giat.id_giat = sub_giat.id_giat;
			// 				data_sub_giat.id_misi = sub_giat.id_misi;
			// 				data_sub_giat.id_program = sub_giat.id_program;
			// 				data_sub_giat.id_unik = sub_giat.id_unik;
			// 				data_sub_giat.id_unik_indikator = sub_giat.id_unik_indikator;
			// 				data_sub_giat.id_unit = sub_giat.id_unit;
			// 				data_sub_giat.id_visi = sub_giat.id_visi;
			// 				data_sub_giat.indikator = sub_giat.indikator;
			// 				data_sub_giat.is_locked = sub_giat.is_locked;
			// 				data_sub_giat.is_locked_indikator = sub_giat.is_locked_indikator;
			// 				// data_keg.kode_bidang_urusan = kegiatan.kode_bidang_urusan;
			// 				// data_keg.kode_giat = kegiatan.kode_giat;
			// 				// data_keg.kode_program = kegiatan.kode_program;
			// 				data_sub_giat.kode_sasaran = sub_giat.kode_sasaran;
			// 				// data_keg.kode_skpd = kegiatan.kode_skpd;
			// 				data_sub_giat.kode_tujuan = sub_giat.kode_tujuan;
			// 				// data_keg.kode_unik_program = kegiatan.kode_unik_program;
			// 				// data_keg.nama_bidang_urusan = kegiatan.nama_bidang_urusan;
			// 				// data_keg.nama_giat = kegiatan.nama_giat;
			// 				// data_keg.nama_program = kegiatan.nama_program;
			// 				// data_keg.nama_skpd = kegiatan.nama_skpd;
			// 				data_sub_giat.pagu_awal = sub_giat.pagu_awal; //baru
			// 				data_sub_giat.pagu_1 = sub_giat.pagu_1;
			// 				data_sub_giat.pagu_2 = sub_giat.pagu_2;
			// 				data_sub_giat.pagu_3 = sub_giat.pagu_3;
			// 				data_sub_giat.pagu_4 = sub_giat.pagu_4;
			// 				data_sub_giat.pagu_5 = sub_giat.pagu_5;
			// 				data_sub_giat.pagu_akhir = sub_giat.pagu_akhir; //baru
			// 				// data_keg.program_lock = kegiatan.program_lock;
			// 				// data_keg.renstra_prog_lock = kegiatan.renstra_prog_lock;
			// 				// data_keg.sasaran_lock = kegiatan.sasaran_lock;
			// 				// data_keg.sasaran_teks = kegiatan.sasaran_teks;
			// 				data_sub_giat.satuan = sub_giat.satuan;
			// 				// data_keg.status = kegiatan.status;
			// 				data_sub_giat.target_1 = sub_giat.target_1;
			// 				data_sub_giat.target_2 = sub_giat.target_2;
			// 				data_sub_giat.target_3 = sub_giat.target_3;
			// 				data_sub_giat.target_4 = sub_giat.target_4;
			// 				data_sub_giat.target_5 = sub_giat.target_5;
			// 				data_sub_giat.target_akhir = sub_giat.target_akhir;
			// 				data_sub_giat.target_awal = sub_giat.target_awal;
			// 				// data_keg.tujuan_lock = kegiatan.tujuan_lock;
			// 				// data_keg.tujuan_teks = kegiatan.tujuan_teks;
			// 				// data_keg.urut_sasaran = kegiatan.urut_sasaran;
			// 				// data_keg.urut_tujuan = kegiatan.urut_tujuan;
			// 				data_sub_giat.id_rpjm_indikator = sub_giat.id_rpjm_indikator; //baru
			// 				data_sub_giat.id_tahap = sub_giat.id_tahap; //baru	
			// 				data_sub_giat.kode_sasaran_rpjm = sub_giat.kode_sasaran_rpjm; //baru
			// 				data_sub_giat.tahun_awal = sub_giat.tahun_awal; //baru
			// 				data_sub_giat.tahun_akhir = sub_giat.tahun_akhir; //baru	
			// 				data_sub_giat.push(data_sub_giat);
			// 				if((i+1)%_length == 0){
			// 					data_all.push(data_temp);
			// 					data_temp = [];
			// 				}
			// 			});
			// 			if(data_temp.length >= 1){
			// 				data_all.push(data_temp);
			// 			}
			// 			data_all.map(function(b, i){
			// 				data_renstra.page = i+1;
			// 				data_renstra.sub_giat = b;
			// 				var data = {
			// 					message:{
			// 						type: "get-url",
			// 						content: {
			// 							url: config.url_server_lokal,
			// 							type: 'post',
			// 							data: data_renstra,
			// 							return: false
			// 						}
			// 					}
			// 				};
			// 				chrome.runtime.sendMessage(data, function(response) {
			// 					console.log('responeMessage', response);
			// 				});
			// 			});
			// 			resolve(true);
			// 		}
			// 	});
			// }) );
		});
		Promise.all(sendData)
		.then(function(all_data){
			hide_loading();
			alert('Berhasil singkron data RENSTRA!');
		});
	}
}

function get_tahapan_renstra(){
    return new Promise(function(resolve, reject){
		relayAjax({	      	
			url: config.sipd_url+'api/master/tahapan/list/renstra',			
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

function jadwal_renstra_aktif(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/jadwal/renstra_jadwal/cek_aktif',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(jadwal_renstra_aktif){
	      		return resolve(jadwal_renstra_aktif);
	      	}
	    });
    });
}