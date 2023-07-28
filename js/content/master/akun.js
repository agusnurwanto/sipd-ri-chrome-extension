function singkron_akun_ke_lokal(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		get_rekening_all()
		.then(function(data){
			pesan_loading('Simpan data Akun Belanja ke DB Lokal!');
			var data_akun = { 
				action: 'singkron_akun_belanja',
				type: 'ri',
				tahun_anggaran: _token.tahun,
				api_key: config.api_key,
				akun : {}
			};
			var _length = 250;
			var data_all = [];
			var data_temp = [];
			data.data.map(function(akun, i){
				var data_akun_temp = {};
				data_akun_temp.belanja = akun.belanja;
				data_akun_temp.id_akun = akun.id_akun;
				data_akun_temp.is_bagi_hasil = akun.is_bagi_hasil;
				data_akun_temp.is_bankeu_khusus = akun.is_bankeu_khusus;
				data_akun_temp.is_bankeu_umum = akun.is_bankeu_umum;
				data_akun_temp.is_barjas = akun.is_barjas;
				data_akun_temp.is_bl = akun.is_bl;
				data_akun_temp.is_bos = akun.is_bos;
				data_akun_temp.is_btt = akun.is_btt;
				data_akun_temp.is_bunga = akun.is_bunga;
				data_akun_temp.is_gaji_asn = akun.is_gaji_asn;
				data_akun_temp.is_hibah_brg = akun.is_hibah_brg;
				data_akun_temp.is_hibah_uang = akun.is_hibah_uang;
				data_akun_temp.is_locked = akun.is_locked;
				data_akun_temp.is_modal_tanah = akun.is_modal_tanah;
				data_akun_temp.is_pembiayaan = akun.is_pembiayaan;
				data_akun_temp.is_pendapatan = akun.is_pendapatan;
				data_akun_temp.is_sosial_brg = akun.is_sosial_brg;
				data_akun_temp.is_sosial_uang = akun.is_sosial_uang;
				data_akun_temp.is_subsidi = akun.is_subsidi;
                data_akun_temp.ket_akun = akun.ket_akun;//baru
				data_akun_temp.kode_akun = akun.kode_akun;
                data_akun_temp.kode_akun_lama = akun.kode_akun_lama;//baru
                data_akun_temp.kode_akun_revisi = akun.kode_akun_revisi;//baru
                data_akun_temp.kunci_tahun = akun.kunci_tahun;//baru
                data_akun_temp.level = akun.level;//baru
                data_akun_temp.mulai_tahun = akun.mulai_tahun;//baru
				data_akun_temp.nama_akun = akun.nama_akun;
                data_akun_temp.pembiayaan = akun.pembiayaan;//baru
                data_akun_temp.pendapatan = akun.pendapatan;//baru
				data_akun_temp.set_input = akun.set_input;
                data_akun_temp.set_kab_kota = akun.set_kab_kota;//baru
				data_akun_temp.set_lokus = akun.set_lokus;
                data_akun_temp.set_prov = akun.set_prov;//baru
				data_akun_temp.status = akun.status;
				data_temp.push(data_akun_temp);
				if((i+1)%_length == 0){
					data_all.push(data_temp);
					data_temp = [];
				}
			});
			if(data_temp.length >= 1){
				data_all.push(data_temp);
			}

			var last = data_all.length - 1;
	        var nomor = 0;
			data_all.reduce(function(sequence, nextData){
				return sequence.then(function(akun){
					return new Promise(function(resolve_reduce, reject_reduce){
						nomor++;
						data_akun.page = nomor;
						data_akun.akun = akun;
						pesan_loading('Simpan ke '+nomor+' data akun/rekening ke DB Lokal!');
						var data = {
						    message:{
						        type: "get-url",
						        content: {
								    url: config.url_server_lokal,
								    type: 'post',
								    data: data_akun,
					    			return: false
								}
						    }
						};
						if(nomor == data_all.length-1){
							data.message.content.return = true;
						}
						chrome.runtime.sendMessage(data, function(response) {
						    console.log('responeMessage', response);
						});

						// dikasih jeda agar lebih aman di server
						setTimeout(function(){
							resolve_reduce(nextData);
						}, 1000);
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
				// selesai kirim data menunggu respon dari background	
			})
			.catch(function(e){
				console.log(e);
			});
		});
	}
}