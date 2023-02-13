function singkron_akun_ke_lokal(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		jQuery('#wrap-loading').show();
        var apiKey = x_api_key();
		relayAjax({
            url: config.sipd_url+'api/master/akun/listNew',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,				
                deleted_data: true,
                // order[0][column]: 0,
                // order[0][dir]: asc,
                // search[value]: '',
                length: 1000000,
                start: 0,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(data){
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
				data.data.data.map(function(akun, i){
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
				data_all.map(function(b, i){
					data_akun.akun = b;
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
					if(i == data_all.length-1){
						data.message.content.return = true;
					}
					chrome.runtime.sendMessage(data, function(response) {
					    console.log('responeMessage', response);
					});
				});
			}
		});
	}
}