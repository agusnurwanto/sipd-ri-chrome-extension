function singkron_pokir_lokal(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		relayAjax({
			url: config.sipd_url+'api/usulan/usul_bantuan/listMonitor',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,														
				id_pengusul: _token.daerah_id,
				level: 2,
				id_jenis_usul: 13,
				page: 0,
				pageSize: 1000000,
				pencarian:'',
				order: 'id_usulan',
				order_dir: 'asc',					
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},	
			success: function(data){
				pesan_loading('Simpan data Usulan POKIR ke DB Lokal!');				
				var last = data.data.length-1;
				data.data.reduce(function(sequence, nextData){
					return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){
							// if(
							// 	current_data.id_kecamatan == 0
							// 	&& current_data.id_kelurahan == 0
							// )
							// {
							// 	var data_pokir = {};
							// 	data_pokir.alamat_teks = current_data.alamat_teks;
							// 	data_pokir.camat_teks = current_data.camat_teks; //baru
							// 	// data_pokir.anggaran = current_data.anggaran;
							// 	// data_pokir.batal_teks = current_data.batal_teks;
							// 	data_pokir.bidang_urusan = current_data.bidang_urusan;
							// 	data_pokir.created_date = current_data.created_at;                        
							// 	// data_pokir.created_user = current_data.created_user;
							// 	// data_pokir.file_foto = current_data.file_foto;
							// 	// data_pokir.file_pengantar = current_data.file_pengantar;
							// 	// data_pokir.file_proposal = current_data.file_proposal;
							// 	// data_pokir.file_rab = current_data.file_rab;
							// 	// data_pokir.fraksi_dewan = current_data.fraksi_dewan;
							// 	data_pokir.giat_teks = current_data.nama_kamus;
							// 	data_pokir.id_bidang_urusan = current_data.id_bidang_urusan;
							// 	data_pokir.id_jenis_usul = current_data.id_jenis_usul;
							// 	data_pokir.id_kab_kota = current_data.id_kab_kota;
							// 	data_pokir.id_kecamatan = current_data.id_kecamatan;
							// 	data_pokir.id_kelurahan = current_data.id_kelurahan;
							// 	data_pokir.id_pengusul = current_data.id_pengusul;
							// 	// data_pokir.id_reses = current_data.id_reses;
							// 	// data_pokir.id_unit = current_data.id_unit;
							// 	data_pokir.id_usulan = current_data.id_usulan;
							// 	data_pokir.is_batal = current_data.is_batal;
							// 	data_pokir.is_tolak = current_data.is_tolak;							 
							// 	data_pokir.is_kembalikan = current_data.is_kembalikan; //baru                       
							// 	data_pokir.is_verif = current_data.is_verif; //baru
							// 	data_pokir.tolak_teks = current_data.tolak_teks;
							// 	data_pokir.kembalikan = current_data.kembalikan; //baru
							// 	data_pokir.jenis_belanja = current_data.jenis_belanja;
							// 	// data_pokir.jenis_usul_teks = current_data.jenis_usul_teks;
							// 	// data_pokir.kelompok = current_data.kelompok;
							// 	// data_pokir.kode_skpd = current_data.kode_skpd;
							// 	// data_pokir.koefisien = current_data.koefisien;
							// 	// data_pokir.lokus_usulan = current_data.lokus_usulan;
							// 	data_pokir.masalah = current_data.masalah;
							// 	data_pokir.nama_daerah = current_data.nama_daerah;
							// 	data_pokir.nama_skpd = current_data.nama_skpd_awal;
							// 	// data_pokir.nama_user = current_data.nama_user;
							// 	data_pokir.pengusul = current_data.nama_pengusul;
							// 	// data_pokir.rekom_mitra_anggaran = current_data.rekom_mitra.anggaran;
							// 	// data_pokir.rekom_mitra_koefisien = current_data.rekom_mitra.koefisien;
							// 	// data_pokir.rekom_mitra_rekomendasi = current_data.rekom_mitra.rekomendasi;
							// 	// data_pokir.rekom_setwan_anggaran = current_data.rekom_setwan.anggaran;
							// 	// data_pokir.rekom_setwan_koefisien = current_data.rekom_setwan.koefisien;
							// 	// data_pokir.rekom_setwan_rekomendasi = current_data.rekom_setwan.rekomendasi;
							// 	// data_pokir.rekom_skpd_anggaran = current_data.rekom_skpd.anggaran;
							// 	// data_pokir.rekom_skpd_koefisien = current_data.rekom_skpd.koefisien;
							// 	// data_pokir.rekom_skpd_rekomendasi = current_data.rekom_skpd.rekomendasi;
							// 	// data_pokir.rekom_tapd_anggaran = current_data.rekom_tapd.anggaran;
							// 	// data_pokir.rekom_tapd_koefisien = current_data.rekom_tapd.koefisien;
							// 	// data_pokir.rekom_tapd_rekomendasi = current_data.rekom_tapd.rekomendasi;
							// 	// data_pokir.satuan = current_data.satuan;
							// 	data_pokir.rekom_tapd_rekomendasi = current_data.rekom_teks;                        
							// 	data_pokir.status_usul = current_data.status_usul;
							// 	data_pokir.status_usul_teks = current_data.nama_status;
							// 	//Detail
							// 	data_pokir.detail_alamatteks = null;
							// 	data_pokir.detail_anggaran = null;
							// 		data_pokir.created_user = null;
							// 		data_pokir.dashuk_teks = null; //baru
							// 		data_pokir.detail_bidangurusan = null;
									
							// 		data_pokir.detail_filefoto = null;
							// 		data_pokir.detail_filefoto2 = null;
							// 		data_pokir.detail_filefoto3 = null;
							// 		data_pokir.detail_filepengantar = null;
							// 		data_pokir.detail_fileproposal = null;
							// 		data_pokir.detail_filerab = null;
							// 		data_pokir.id_akun = null; //baru
							// 		data_pokir.id_bidang_urusan = null; //baru
							// 		data_pokir.id_bl = null; //baru
							// 		data_pokir.id_giat_bl = null; //baru
							// 		data_pokir.id_isu = null; //baru
							// 		data_pokir.id_jenis_usul = null; //baru
							// 		data_pokir.id_jenis_usul_reses = null; //baru
							// 		data_pokir.detail_idkabkota = null;
							// 		data_pokir.detail_idkamus = null;
							// 		data_pokir.detail_idcamat = null;
							// 		data_pokir.detail_idlurah = null;
							// 		data_pokir.id_program = null; //baru
							// 		data_pokir.id_program_bl = null; //baru
							// 		data_pokir.id_reses = null;
							// 		data_pokir.id_unit = null;
							// 		data_pokir.detail_idskpd = null;
							// 		data_pokir.id_sub_bl = null; //baru
							// 		data_pokir.id_sub_giat_bl = null; //baru
							// 		data_pokir.id_sub_skpd_bl = null; //baru
							// 		data_pokir.indikasi = null; //baru
							// 		data_pokir.is_rincian_teknis = null; //baru
							// 		data_pokir.is_sertifikat_lahan = null; //baru
							// 		data_pokir.is_stat_lahan = null; //baru
							// 		data_pokir.detail_jenisbelanja = null;
							// 		data_pokir.kode_bidang_urusan = null; //baru
							// 		data_pokir.koefisien = null;
							// 		data_pokir.latbel_teks = null; //baru
							// 		data_pokir.lokus_usulan = null;
							// 		data_pokir.maksud_teks = null; //baru							
							// 		data_pokir.detail_langpeta = null;
							// 		data_pokir.detail_latpeta = null;
							// 		data_pokir.detail_masalah = null;
							// 		data_pokir.detail_camatteks = null;
							// 		data_pokir.detail_namakabkota = null;
							// 		data_pokir.detail_gagasan = null;
							// 		data_pokir.detail_lurahteks = null;
							// 		data_pokir.nama_rev_unit = null; //baru
							// 		data_pokir.rev_unit = null; //baru
							// 		data_pokir.detail_namaskpd = null;
							// 		data_pokir.detail_rekomteks = null;
							// 		data_pokir.detail_satuan = null;
							// 		data_pokir.satuan = null;
							// 		// data_pokir.detail_setStatusUsul = detail.setStatusUsul;
							// 		data_pokir.detail_subgiat = null;
							// 		data_pokir.detail_volume = null;

							// 		var data = {
							// 			message:{
							// 				type: "get-url",
							// 				content: {
							// 					url: config.url_server_lokal,
							// 					type: 'post',
							// 					data: { 
							// 						action: 'singkron_pokir',
							// 						type: 'ri',
							// 						tahun_anggaran: _token.tahun,
							// 						api_key: config.api_key,
							// 						data: data_pokir
							// 					},
							// 					return: false
							// 				}
							// 			}
							// 		};
							// 		chrome.runtime.sendMessage(data, function(response) {
							// 			console.log('responeMessage', response);
							// 		});
							// 		return resolve_reduce(nextData);
							// }
							// else
							// {
								var data_pokir = {};
								data_pokir.alamat_teks = current_data.alamat_teks;
								data_pokir.camat_teks = current_data.camat_teks; //baru
								// data_pokir.anggaran = current_data.anggaran;
								// data_pokir.batal_teks = current_data.batal_teks;
								data_pokir.bidang_urusan = current_data.bidang_urusan;
								data_pokir.created_date = current_data.created_at;                        
								// data_pokir.created_user = current_data.created_user;
								// data_pokir.file_foto = current_data.file_foto;
								// data_pokir.file_pengantar = current_data.file_pengantar;
								// data_pokir.file_proposal = current_data.file_proposal;
								// data_pokir.file_rab = current_data.file_rab;
								// data_pokir.fraksi_dewan = current_data.fraksi_dewan;
								data_pokir.giat_teks = current_data.nama_kamus;
								data_pokir.id_bidang_urusan = current_data.id_bidang_urusan;
								data_pokir.id_jenis_usul = current_data.id_jenis_usul;
								data_pokir.id_kab_kota = current_data.id_kab_kota;
								data_pokir.id_kecamatan = current_data.id_kecamatan;
								data_pokir.id_kelurahan = current_data.id_kelurahan;
								data_pokir.id_pengusul = current_data.id_pengusul;
								// data_pokir.id_reses = current_data.id_reses;
								// data_pokir.id_unit = current_data.id_unit;
								data_pokir.id_usulan = current_data.id_usulan;
								data_pokir.is_batal = current_data.is_batal;
								data_pokir.is_tolak = current_data.is_tolak;
								data_pokir.is_kembalikan = current_data.is_kembalikan; //baru                       
								data_pokir.is_verif = current_data.is_verif; //baru
								data_pokir.tolak_teks = current_data.tolak_teks;
								data_pokir.kembalikan = current_data.kembalikan; //baru
								data_pokir.jenis_belanja = current_data.jenis_belanja;
								// data_pokir.jenis_usul_teks = current_data.jenis_usul_teks;
								// data_pokir.kelompok = current_data.kelompok;
								// data_pokir.kode_skpd = current_data.kode_skpd;
								// data_pokir.koefisien = current_data.koefisien;
								// data_pokir.lokus_usulan = current_data.lokus_usulan;
								data_pokir.masalah = current_data.masalah;
								data_pokir.nama_daerah = current_data.nama_daerah;
								data_pokir.nama_skpd = current_data.nama_skpd_awal;
								// data_pokir.nama_user = current_data.nama_user;
								data_pokir.pengusul = current_data.nama_pengusul;
								// data_pokir.rekom_mitra_anggaran = current_data.rekom_mitra.anggaran;
								// data_pokir.rekom_mitra_koefisien = current_data.rekom_mitra.koefisien;
								data_pokir.rekom_mitra_rekomendasi = current_data.rekomendasi_mitra;
								// data_pokir.rekom_setwan_anggaran = current_data.rekom_setwan.anggaran;
								// data_pokir.rekom_setwan_koefisien = current_data.rekom_setwan.koefisien;
								data_pokir.rekom_setwan_rekomendasi = current_data.rekomendasi_sekwan;
								// data_pokir.rekom_skpd_anggaran = current_data.rekom_skpd.anggaran;
								// data_pokir.rekom_skpd_koefisien = current_data.rekom_skpd.koefisien;
								data_pokir.rekom_skpd_rekomendasi = current_data.rekomendasi_skpd;
								// data_pokir.rekom_tapd_anggaran = current_data.rekom_tapd.anggaran;
								// data_pokir.rekom_tapd_koefisien = current_data.rekom_tapd.koefisien;
								//data_pokir.rekom_tapd_rekomendasi = current_data.rekom_tapd.rekomendasi;
								// data_pokir.satuan = current_data.satuan;
								data_pokir.rekom_teks = current_data.rekom_teks;               
								data_pokir.rekom_tapd_rekomendasi = current_data.rekomendasi_tapd;                        
								data_pokir.status_usul = current_data.status_usul;
								data_pokir.status_usul_teks = current_data.nama_status;
								

								var idusulan = current_data.id_usulan;
								var idstatususulan = current_data.status_usul;
								get_detail_pokir(idusulan, idstatususulan).then(function(detail){            			
									data_pokir.detail_alamatteks = detail.data[0].alamatteks;
									data_pokir.detail_anggaran = detail.data[0].anggaran;
									data_pokir.created_user = detail.data[0].created_user;
									data_pokir.dashuk_teks = detail.data[0].dashuk_teks; //baru
									data_pokir.detail_bidangurusan = detail.data[0].nama_bidang_urusan;
									
									data_pokir.detail_filefoto = detail.data[0].file_foto;
									data_pokir.detail_filefoto2 = detail.data[0].file_foto_2;
									data_pokir.detail_filefoto3 = detail.data[0].file_foto_3;
									data_pokir.detail_filepengantar = detail.data[0].file_pengantar;
									data_pokir.detail_fileproposal = detail.data[0].file_proposal;
									data_pokir.detail_filerab = detail.data[0].file_rab;
									data_pokir.id_akun = detail.data[0].id_akun; //baru
									data_pokir.id_bidang_urusan = detail.data[0].id_bidang_urusan; //baru
									data_pokir.id_bl = detail.data[0].id_bl; //baru
									data_pokir.id_giat_bl = detail.data[0].id_giat_bl; //baru
									data_pokir.id_isu = detail.data[0].id_isu; //baru
									data_pokir.id_jenis_usul = detail.data[0].id_jenis_usul; //baru
									data_pokir.id_jenis_usul_reses = detail.data[0].id_jenis_usul_reses; //baru
									data_pokir.detail_idkabkota = detail.data[0].id_kab_kota;
									data_pokir.detail_idkamus = detail.data[0].id_kamus;
									data_pokir.detail_idcamat = detail.data[0].id_kecamatan;
									data_pokir.detail_idlurah = detail.data[0].id_kelurahan;
									data_pokir.id_program = detail.data[0].id_program; //baru
									data_pokir.id_program_bl = detail.data[0].id_program_bl; //baru
									data_pokir.id_reses = detail.data[0].id_reses;
									data_pokir.id_unit = detail.data[0].id_skpd_awal;
									data_pokir.detail_idskpd = detail.data[0].id_skpd_bl;
									data_pokir.id_sub_bl = detail.data[0].id_sub_bl; //baru
									data_pokir.id_sub_giat_bl = detail.data[0].id_sub_giat_bl; //baru
									data_pokir.id_sub_skpd_bl = detail.data[0].id_sub_skpd_bl; //baru
									data_pokir.indikasi = detail.data[0].indikasi; //baru
									data_pokir.is_rincian_teknis = detail.data[0].is_rincian_teknis; //baru
									data_pokir.is_sertifikat_lahan = detail.data[0].is_sertifikat_lahan; //baru
									data_pokir.is_stat_lahan = detail.data[0].is_stat_lahan; //baru
									data_pokir.detail_jenisbelanja = detail.data[0].jenis_belanja;
									data_pokir.kode_bidang_urusan = detail.data[0].kode_bidang_urusan; //baru
									data_pokir.koefisien = detail.data[0].koefisien;
									data_pokir.latbel_teks = detail.data[0].latbel_teks; //baru
									data_pokir.lokus_usulan = detail.data[0].lokus_usulan;
									data_pokir.maksud_teks = detail.data[0].maksud_teks; //baru							
									data_pokir.detail_langpeta = detail.data[0].map_lng_lokasi;
									data_pokir.detail_latpeta = detail.data[0].map_lat_lokasi;
									data_pokir.detail_masalah = detail.data[0].masalah;
									data_pokir.detail_camatteks = detail.data[0].nama_camat;
									data_pokir.detail_namakabkota = detail.data[0].nama_kab_kota;
									data_pokir.detail_gagasan = detail.data[0].nama_kamus;
									data_pokir.detail_lurahteks = detail.data[0].nama_lurah;
									data_pokir.nama_rev_unit = detail.data[0].nama_rev_unit; //baru
									data_pokir.rev_unit = detail.data[0].rev_unit; //baru
									data_pokir.detail_namaskpd = detail.data[0].nama_skpd_awal;
									data_pokir.detail_rekomteks = detail.data[0].rekomteks;
									data_pokir.detail_satuan = detail.data[0].satuan;
									data_pokir.satuan = detail.data[0].satuan;
									// data_pokir.detail_setStatusUsul = detail.data[0].setStatusUsul;
									data_pokir.detail_subgiat = detail.data[0].sub_giat_baru;							
									data_pokir.detail_volume = detail.data[0].volume;

									var data = {
										message:{
											type: "get-url",
											content: {
												url: config.url_server_lokal,
												type: 'post',
												data: { 
													action: 'singkron_pokir',
													type: 'ri',
													tahun_anggaran: _token.tahun,
													api_key: config.api_key,
													data: data_pokir
												},
												return: false
											}
										}
									};
									chrome.runtime.sendMessage(data, function(response) {
										console.log('responeMessage', response);
									});
									return resolve_reduce(nextData);
								});
							// }
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
					alert('Berhasil singkron data POKIR!');
				})
				.catch(function(e){
					console.log(e);
				});
			}
		});
	}
}

function get_detail_pokir(idusulan, idstatususulan){
    var form_data = new FormData();
    form_data.append("id_daerah", _token.daerah_id);
    form_data.append("tahun", _token.tahun);
    form_data.append("id_usulan", idusulan);
    form_data.append("id_status_usulan", idstatususulan);
    // form_data.append("id_jenis_usulan", 13);
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/usulan/usul_pokir/view',
			type: 'POST',
            data: form_data,
			processData : false,
            contentType : false,
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