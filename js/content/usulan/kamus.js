function singkron_kamus_usulan_pokir(tipe){
	console.log('tipe', tipe);
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		jQuery('#persen-loading').attr('persen', 0);
		jQuery('#persen-loading').html('0%');				
		relayAjax({
			url: config.sipd_url+'api/master/kamus_usulan/listall',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,										
				jenis: tipe,				
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("x-api-key", x_api_key());
				xhr.setRequestHeader("x-access-token", _token.token);
			},			
			success: function(data){			
				pesan_loading('Simpan data Kamus Usulan '+tipe+' ke DB Lokal!');
				var last = data.data.length-1;
				data.data.reduce(function(sequence, nextData){
					return sequence.then(function(current_data){
						return new Promise(function(resolve_reduce, reject_reduce){
							var data_kamus = {};
							data_kamus.anggaran = current_data.anggaran;
							data_kamus.bidang_urusan = current_data.bidang_urusan;
							data_kamus.giat_teks = current_data.giat_teks;
							data_kamus.id_kamus = current_data.id_kamus;
							data_kamus.id_program = current_data.id_program;
							data_kamus.id_jenis_usul = current_data.id_jenis_usul;
							data_kamus.id_unik = current_data.id_unik;
							data_kamus.id_unit = current_data.id_unit;							
							data_kamus.idskpd = current_data.id_unit;
							data_kamus.is_locked = current_data.is_locked;
							data_kamus.namaprogram = current_data.nama_program;
							data_kamus.jenis_profil = current_data.jenis_profil;
							data_kamus.jml = current_data.jml;
							data_kamus.kelompok = current_data.kelompok;
							data_kamus.kode_skpd = current_data.kode_skpd;
							data_kamus.nama_skpd = current_data.nama_skpd;
							data_kamus.outcome_teks = current_data.outcome_teks;
							data_kamus.output_teks = current_data.output_teks;
							data_kamus.pekerjaan = current_data.pekerjaan;
							data_kamus.prioritas_teks = current_data.prioritas_teks;
							data_kamus.satuan = current_data.satuan;
							data_kamus.tahun = current_data.tahun;
							data_kamus.tipe = tipe;

							var iddaerah = current_data.id_daerah;
							var idusulan = current_data.id_kamus;
							var tahun = current_data.tahun;
							get_detail_kamus_pokir(iddaerah, idusulan, tahun).then(function(detail){
								// console.log(detail.data[0]);
								data_kamus.idbidangurusan = detail.data[0].id_bidang_urusan;
								// data_kamus.idskpd = detail.idskpd;								
								data_kamus.id_jenis_usul = detail.data[0].id_jenis_usul;
								data_kamus.kodeprogram = detail.data[0].kodeprogram;								
								var data = {
									message:{
										type: "get-url",
										content: {
											url: config.url_server_lokal,
											type: 'post',
											data: { 
												action: 'singkron_kamus_usulan_pokir',
												type: 'ri',
												tahun_anggaran: _token.tahun,
												api_key: config.api_key,
												data: data_kamus
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
					alert('Berhasil singkron data kamus usulan!');
				})
				.catch(function(e){
					console.log(e);
				});      								
			}
		});
	}
}

function get_detail_kamus_pokir(iddaerah, idusulan, tahun){
    return new Promise(function(resolve, reject){
		relayAjax({	      	
			url: config.sipd_url+'api/master/kamus_usulan/view/'+idusulan+'/'+tahun+'/'+iddaerah,
			type: 'GET',	      				
			processData: false,
			contentType : 'application/json',
	      	success: function(data){
	      		return resolve(data);
	      	}
	    });
    });
}