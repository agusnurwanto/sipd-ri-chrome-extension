function singkron_asmas_lokal(){	
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		jQuery('#wrap-loading').show();
		// jQuery('#persen-loading').attr('persen', 0);
		// jQuery('#persen-loading').html('0%');				
		relayAjax({
			url: config.sipd_url+'api/usulan/usul_bantuan/monitor',
			type: 'POST',
			data: {
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,														
				id_pengusul: _token.daerah_id,
				level: 2,
				id_jenis_usul: 8,
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
				pesan_loading('Simpan data Usulan ASMAS ke DB Lokal!');
                var last = data.data.data.length-1;
                data.data.data.reduce(function(sequence, nextData){
                    return sequence.then(function(current_data){
                        return new Promise(function(resolve_reduce, reject_reduce){
                            var data_asmas = {};
                            
                            data_asmas.id_usulan = current_data.id_usulan;  
                            data_asmas.id_unik = current_data.id_unik; //baru
                            data_asmas.tahun = current_data.tahun; //baru
                            data_asmas.id_daerah = current_data.id_daerah;
                            data_asmas.id_pengusul = current_data.id_pengusul;
                            data_asmas.id_jenis_usul = current_data.id_jenis_usul;
                            data_asmas.id_bidang_urusan = current_data.id_bidang_urusan;
                            data_asmas.giat_teks = current_data.nama_kamus; //baru
                            data_asmas.masalah = current_data.masalah;
                            data_asmas.alamat_teks = current_data.alamat_teks;
                            data_asmas.id_kab_kota = current_data.id_kab_kota;
                            data_asmas.is_verif = current_data.is_verif; //baru
                            data_asmas.id_kecamatan = current_data.id_kecamatan;
                            data_asmas.id_kelurahan = current_data.id_kelurahan;
                            data_asmas.nama_skpd_awal = current_data.nama_skpd_awal; //baru
                            data_asmas.status_usul = current_data.status_usul;
                            data_asmas.is_batal = current_data.is_batal;
                            data_asmas.is_kembalikan = current_data.is_kembalikan; //baru
                            data_asmas.rekom_teks = current_data.rekom_teks; //baru
                            data_asmas.nama_daerah = current_data.nama_daerah;
                            data_asmas.detail_camatteks = current_data.camat_teks;
                            data_asmas.detail_lurahteks = current_data.lurah_teks;
                            data_asmas.status_usul_teks = current_data.nama_status;
                            data_asmas.pengusul = current_data.nama_pengusul;
                            data_asmas.kembalikan = current_data.kembalikan; //baru
                            data_asmas.created_date = current_data.created_at;
                            data_asmas.created_user = current_data.id_pengusul;
                            data_asmas.jenis_usul_teks = 'Usulan Aspirasi Masyarakat';
                            // data_asmas.anggaran = current_data.anggaran;
                            // data_asmas.batal_teks = current_data.batal_teks;
                            // data_asmas.bidang_urusan = current_data.bidang_urusan;                            
                            // data_asmas.file_foto = current_data.file_foto;
                            // data_asmas.file_pengantar = current_data.file_pengantar;
                            // data_asmas.file_proposal = current_data.file_proposal;
                            // data_asmas.file_rab = current_data.file_rab;                            
                            // data_asmas.id_jenis_profil = current_data.id_jenis_profil;
                            // data_asmas.id_profil = current_data.id_profil;
                            // data_asmas.id_unit = current_data.id_unit;
                            // data_asmas.is_tolak = current_data.is_tolak;
                            // data_asmas.jenis_belanja = current_data.jenis_belanja;
                            // data_asmas.jenis_profil = current_data.jenis_profil;
                            // data_asmas.jenis_usul_teks = current_data.jenis_usul_teks;
                            // data_asmas.kelompok = current_data.kelompok;
                            // data_asmas.kode_skpd = current_data.kode_skpd;
                            // data_asmas.koefisien = current_data.koefisien;
                            // data_asmas.level_pengusul = current_data.level_pengusul;
                            // data_asmas.lokus_usulan = current_data.lokus_usulan;
                            // data_asmas.nama_skpd = current_data.nama_skpd;
                            // data_asmas.nama_user = current_data.nama_user;
                            // data_asmas.nip = current_data.nip;
                            // data_asmas.rekom_camat_anggaran = current_data.rekom_camat.anggaran;
                            // data_asmas.rekom_camat_koefisien = current_data.rekom_camat.koefisien;
                            // data_asmas.rekom_camat_rekomendasi = current_data.rekom_camat.rekomendasi;
                            // data_asmas.rekom_lurah_anggaran = current_data.rekom_lurah.anggaran;
                            // data_asmas.rekom_lurah_koefisien = current_data.rekom_lurah.koefisien;
                            // data_asmas.rekom_lurah_rekomendasi = current_data.rekom_lurah.rekomendasi;
                            // data_asmas.rekom_mitra_anggaran = current_data.rekom_mitra.anggaran;
                            // data_asmas.rekom_mitra_koefisien = current_data.rekom_mitra.koefisien;
                            // data_asmas.rekom_mitra_rekomendasi = current_data.rekom_mitra.rekomendasi;
                            // data_asmas.rekom_skpd_anggaran = current_data.rekom_skpd.anggaran;
                            // data_asmas.rekom_skpd_koefisien = current_data.rekom_skpd.koefisien;
                            // data_asmas.rekom_skpd_rekomendasi = current_data.rekom_skpd.rekomendasi;
                            // data_asmas.rekom_tapd_anggaran = current_data.rekom_tapd.anggaran;
                            // data_asmas.rekom_tapd_koefisien = current_data.rekom_tapd.koefisien;
                            // data_asmas.rekom_tapd_rekomendasi = current_data.rekom_tapd.rekomendasi;
                            // data_asmas.rev_skpd = current_data.rev_skpd;
                            // data_asmas.satuan = current_data.satuan;
                            // data_asmas.tolak_teks = current_data.tolak_teks;
                            // data_asmas.tujuan_usul = current_data.tujuan_usul;

                            
                            var idusulan = current_data.id_usulan;
                            var idstatususulan = current_data.status_usul;                            
                            get_detail_asmas(idusulan, idstatususulan).then(function(detail){
                                data_asmas.detail_idkamus = detail.idkamus;
                                data_asmas.detail_id_isu = detail.id_isu; //baru
                                data_asmas.detail_id_program = detail.id_program; //baru
                                data_asmas.detail_volume = detail.volume;
                                data_asmas.detail_satuan = detail.satuan;

                                data_asmas.satuan = detail.satuan;
                                data_asmas.detail_koefisien = detail.koefisien; //baru
                                data_asmas.koefisien = detail.koefisien;
                                data_asmas.detail_anggaran = detail.anggaran;
                                data_asmas.lokus_usulan = detail.lokus_usulan;

                                data_asmas.detail_alamatteks = detail.alamatteks;                                
                                data_asmas.detail_idkabkota = detail.id_kab_kota;
                                data_asmas.detail_idcamat = detail.id_kecamatan;
                                data_asmas.detail_idlurah = detail.id_kelurahan;
                                data_asmas.detail_is_stat_lahan = detail.is_stat_lahan; //baru
                                data_asmas.detail_is_sertifikat_lahan = detail.is_sertifikat_lahan; //baru
                                data_asmas.detail_is_rincian_teknis = detail.is_rincian_teknis; //baru
                                data_asmas.detail_latbel_teks = detail.latbel_teks; //baru
                                data_asmas.detail_dashuk_teks = detail.dashuk_teks; //baru
                                data_asmas.detail_maksud_teks = detail.maksud_teks; //baru
                                data_asmas.detail_tujuan_teks = detail.tujuan_teks; //baru                                            
                                data_asmas.detail_filepengantar = detail.file_pengantar;
                                data_asmas.detail_fileproposal = detail.file_proposal;
                                data_asmas.detail_filerab = detail.file_rab;
                                data_asmas.detail_filefoto = detail.file_foto;
                                data_asmas.detail_filefoto2 = detail.file_foto_2;
                                data_asmas.detail_filefoto3 = detail.file_foto_3;

                                data_asmas.file_foto = detail.file_foto;
                                data_asmas.file_pengantar = detail.file_pengantar;
                                data_asmas.file_proposal = detail.file_proposal;
                                data_asmas.file_rab = detail.file_rab;

                                data_asmas.detail_id_akun = detail.id_akun; //baru
                                data_asmas.detail_langpeta = detail.map_lng_lokasi;
                                data_asmas.detail_latpeta = detail.map_lat_lokasi;
                                data_asmas.id_prop = detail.id_prop; //baru
                                data_asmas.detail_tujuanusul = detail.tujuan_usul;
                                
                                data_asmas.tujuan_usul = detail.tujuan_usul;

                                data_asmas.detail_jenisbelanja = detail.jenis_belanja;

                                data_asmas.jenis_belanja = detail.jenis_belanja;

                                data_asmas.detail_masalah = detail.masalah;
                                data_asmas.id_bl = detail.id_bl; //baru
                                data_asmas.id_sub_bl = detail.id_sub_bl; //baru
                                data_asmas.sub_giat_baru = detail.sub_giat_baru; //baru
                                data_asmas.rev_skpd = detail.rev_unit;
                                data_asmas.id_skpd_bl = detail.id_skpd_bl; //baru
                                data_asmas.id_sub_skpd_bl = detail.id_sub_skpd_bl; //baru
                                data_asmas.id_program_bl = detail.id_program_bl; //baru
                                data_asmas.id_giat_bl = detail.id_giat_bl; //baru
                                data_asmas.id_sub_giat_bl = detail.id_sub_giat_bl; //baru
                                data_asmas.detail_subgiat = detail.id_sub_giat_bl;
                                data_asmas.detail_gagasan = detail.nama_kamus;
                                data_asmas.detail_namakabkota = detail.nama_kab_kota;
                                data_asmas.detail_camatteks = detail.nama_camat;
                                data_asmas.detail_lurahteks = detail.nama_lurah;
                                data_asmas.detail_bidangurusan = detail.nama_bidang_urusan;
                                data_asmas.bidang_urusan = detail.nama_bidang_urusan;
                                data_asmas.detail_idskpd = detail.id_skpd_awal;                                
                                data_asmas.detail_kodeskpd = detail.kodeskpd;
                                data_asmas.detail_namaskpd = detail.nama_skpd_awal;
                                data_asmas.detail_nama_rev_unit = detail.nama_rev_unit;

                                data_asmas.nama_skpd = detail.nama_rev_unit;

                                data_asmas.detail_kode_bidang_urusan = detail.kode_bidang_urusan;
                                data_asmas.detail_rekomteks = detail.rekom_teks;
                                
                                // data_asmas.detail_setStatusUsul = detail.setStatusUsul;
                                // data_asmas.detail_usulanggaran = detail.usulanggaran;
                                // data_asmas.detail_usulvolume = detail.usulvolume;

                                var data = {
                                    message:{
                                        type: "get-url",
                                        content: {
                                            url: config.url_server_lokal,
                                            type: 'post',
                                            data: { 
                                                action: 'singkron_asmas',
                                                type: 'ri',
												tahun_anggaran: _token.tahun,
												api_key: config.api_key,
                                                data: data_asmas
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
                    jQuery('#wrap-loading').hide();                    
                    alert('Berhasil singkron data ASMAS!');
                })
                .catch(function(e){
                    console.log(e);
                });
            }
        });
    }
}

function get_detail_asmas(idusulan, idstatususulan){
    var form_data = new FormData();
    form_data.append("id_daerah", _token.daerah_id);
    form_data.append("tahun", _token.tahun);
    form_data.append("id_usulan", idusulan);
    form_data.append("id_status_usulan", idstatususulan);
    // form_data.append("id_jenis_usulan", 8);
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/usulan/usul_bantuan/view',
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