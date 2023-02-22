function singkron_pengaturan_sipd_lokal(){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var apiKey = x_api_key();	
		relayAjax({
			url: config.sipd_url+'api/renja/setup_anggaran/get_pengaturan_sipd',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,																	
			},			
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			
			success: function(data){      
            pesan_loading('Simpan data Pengaturan SIPD ke DB Lokal!');
                var data = {
                    message:{
                        type: "get-url",
                        content: {
                            url: config.url_server_lokal,
                            type: 'post',
                            data: { 
                                action: 'singkron_pengaturan_sipd',
                                type: 'ri',
                                tahun_anggaran: _token.tahun,
                                api_key: config.api_key,
                                data: {
                                        id_daerah : data.data[0].id_daerah,
                                        // daerah: jQuery('h4.text-white.font-bold').text(),
                                        kepala_daerah : data.data[0].kepala_daerah,
                                        wakil_kepala_daerah : data.data[0].wakil_kepala_daerah,
                                        awal_rpjmd: data.data[0].rpjmd_awal,
                                        akhir_rpjmd: data.data[0].rpjmd_akhir,
                                        set_kpa_sekda: data.data[0].set_kpa_sub_sekda, 
                                        set_kpa_sub_sekda : data.data[0].set_kpa_sub_sekda, //baru
                                        id_setup_anggaran: data.data[0].id_setup_anggaran, //baru
                                        set_rkpd: data.data[0].set_rkpd, //baru
                                        set_kua: data.data[0].set_kua, //baru
                                        set_apbd: data.data[0].set_apbd, //baru
                                        ref_program: data.data[0].ref_program, //baru
                                        ref_giat: data.data[0].ref_giat, //baru
                                        ref_akun: data.data[0].ref_akun, //baru
                                        ref_skpd: data.data[0].ref_skpd, //baru
                                        ref_sumber_dana: data.data[0].ref_sumber_dana, //baru
                                        ref_lokasi: data.data[0].ref_lokasi, //baru
                                        ref_standar_harga: data.data[0].ref_standar_harga, //baru
                                        is_locked: data.data[0].is_locked, //baru
                                        jenis_set_pagu: data.data[0].jenis_set_pagu, //baru
                                        tahun_aksi: data.data[0].tahun_aksi, //baru
                                        status_kd: data.data[0].status_kd, //baru
                                        // pelaksana_rkpd: jQuery('select[name="pelaksana_rkpd"]').val(),
                                        // pelaksana_kua: jQuery('select[name="pelaksana_kua"]').val(),
                                        // pelaksana_apbd: jQuery('select[name="pelaksana_apbd"]').val(),
                                        // set_kpa_sekda: jQuery('select[name="set_kpa_sekda"]').val(),
                                }
                            },
                            return: true
                        }
                    }
                };
                chrome.runtime.sendMessage(data, function(response) {
                    console.log('responeMessage', response);
                });                                                               
			    
			}
		});
	}
}
