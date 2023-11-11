function singkron_pengaturan_sipd_lokal(){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		relayAjax({
			url: config.sipd_url+'api/renja/setup_anggaran/get_pengaturan_sipd',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,																	
			},			
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
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
                                    id_kab : _token.daerah_id,
                                    id_prop : _token.id_prop,
                                    is_prop : _token.is_prop,
                                    id_daerah : data.data[0].id_daerah,
                                    daerah: _token.daerah_nama,
                                    kepala_daerah : data.data[0].kepala_daerah,
                                    wakil_kepala_daerah : data.data[0].wakil_kepala_daerah,
                                    awal_rpjmd: data.data[0].rpjmd_awal,
                                    akhir_rpjmd: data.data[0].rpjmd_akhir,
                                    set_kpa_sekda: data.data[0].set_kpa_sub_sekda, 
                                    set_kpa_sub_sekda : data.data[0].set_kpa_sub_sekda,
                                    id_setup_anggaran: data.data[0].id_setup_anggaran,
                                    set_rkpd: data.data[0].set_rkpd,
                                    set_kua: data.data[0].set_kua,
                                    set_apbd: data.data[0].set_apbd,
                                    ref_program: data.data[0].ref_program,
                                    ref_giat: data.data[0].ref_giat,
                                    ref_akun: data.data[0].ref_akun,
                                    ref_skpd: data.data[0].ref_skpd,
                                    ref_sumber_dana: data.data[0].ref_sumber_dana,
                                    ref_lokasi: data.data[0].ref_lokasi,
                                    ref_standar_harga: data.data[0].ref_standar_harga,
                                    is_locked: data.data[0].is_locked,
                                    jenis_set_pagu: data.data[0].jenis_set_pagu,
                                    tahun_aksi: data.data[0].tahun_aksi,
                                    status_kd: data.data[0].status_kd,
                                    pelaksana_rkpd: jQuery('#set_rkpd option:selected').text(),
                                    pelaksana_kua: jQuery('#set_kua option:selected').text(),
                                    pelaksana_apbd: jQuery('#set_apbd option:selected').text()
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
