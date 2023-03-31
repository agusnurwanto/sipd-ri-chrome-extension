function singkron_asmas_lokal(){	
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
                var last = data.data.length-1;
                data.data.reduce(function(sequence, nextData){
                    return sequence.then(function(current_data){
                        return new Promise(function(resolve_reduce, reject_reduce){                                                        
                            if(
                                current_data.id_kecamatan == 0
                                && current_data.id_kelurahan == 0
                            )
                            {                                 
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
                                data_asmas.rekom_camat_rekomendasi = current_data.rekomendasi_kecamatan;
                                // data_asmas.rekom_lurah_anggaran = current_data.rekom_lurah.anggaran;
                                // data_asmas.rekom_lurah_koefisien = current_data.rekom_lurah.koefisien;
                                data_asmas.rekom_lurah_rekomendasi = current_data.rekomendasi_kelurahan;
                                // data_asmas.rekom_mitra_anggaran = current_data.rekom_mitra.anggaran;
                                // data_asmas.rekom_mitra_koefisien = current_data.rekom_mitra.koefisien;
                                data_asmas.rekom_mitra_rekomendasi = current_data.rekomendasi_mitra;
                                // data_asmas.rekom_skpd_anggaran = current_data.rekom_skpd.anggaran;
                                // data_asmas.rekom_skpd_koefisien = current_data.rekom_skpd.koefisien;
                                data_asmas.rekom_skpd_rekomendasi = current_data.rekomendasi_skpd;
                                // data_asmas.rekom_tapd_anggaran = current_data.rekom_tapd.anggaran;
                                // data_asmas.rekom_tapd_koefisien = current_data.rekom_tapd.koefisien;
                                data_asmas.rekom_tapd_rekomendasi = current_data.rekomendasi_tapd;
                                data_asmas.rekom_teks = current_data.rekom_teks;   
                                data_asmas.status_usul = current_data.status_usul;
								data_asmas.status_usul_teks = current_data.nama_status;
                                // data_asmas.rev_skpd = current_data.rev_skpd;
                                // data_asmas.satuan = current_data.satuan;
                                // data_asmas.tolak_teks = current_data.tolak_teks;
                                // data_asmas.tujuan_usul = current_data.tujuan_usul;

                                data_asmas.detail_idkamus = null;
                                data_asmas.detail_id_isu = null; //baru
                                data_asmas.detail_id_program = null; //baru
                                data_asmas.detail_volume = null;
                                data_asmas.detail_satuan = null;

                                data_asmas.satuan = null;
                                data_asmas.detail_koefisien = null; //baru
                                data_asmas.koefisien = null;
                                data_asmas.detail_anggaran = null;
                                data_asmas.lokus_usulan = null;

                                data_asmas.detail_alamatteks = null;
                                data_asmas.detail_idkabkota = null;
                                data_asmas.detail_idcamat = null;
                                data_asmas.detail_idlurah = null;
                                data_asmas.detail_is_stat_lahan = null; //baru
                                data_asmas.detail_is_sertifikat_lahan = null; //baru
                                data_asmas.detail_is_rincian_teknis = null; //baru
                                data_asmas.detail_latbel_teks = null; //baru
                                data_asmas.detail_dashuk_teks = null; //baru
                                data_asmas.detail_maksud_teks = null; //baru
                                data_asmas.detail_tujuan_teks = null; //baru                                            
                                data_asmas.detail_filepengantar = null;
                                data_asmas.detail_fileproposal = null;
                                data_asmas.detail_filerab = null;
                                data_asmas.detail_filefoto = null;
                                data_asmas.detail_filefoto2 = null;
                                data_asmas.detail_filefoto3 = null;

                                data_asmas.file_foto = null;
                                data_asmas.file_pengantar = null;
                                data_asmas.file_proposal = null;
                                data_asmas.file_rab = null;

                                data_asmas.detail_id_akun = null; //baru
                                data_asmas.detail_langpeta = null;
                                data_asmas.detail_latpeta = null;
                                data_asmas.id_prop = null; //baru
                                data_asmas.detail_tujuanusul = null;
                                    
                                data_asmas.tujuan_usul = null;

                                data_asmas.detail_jenisbelanja = null;

                                data_asmas.jenis_belanja = null;

                                data_asmas.detail_masalah = null;
                                data_asmas.id_bl = null; //baru
                                data_asmas.id_sub_bl = null; //baru
                                data_asmas.sub_giat_baru = null; //baru
                                data_asmas.rev_skpd = null;
                                data_asmas.id_skpd_bl = null; //baru
                                data_asmas.id_sub_skpd_bl = null; //baru
                                data_asmas.id_program_bl = null; //baru
                                data_asmas.id_giat_bl = null; //baru
                                data_asmas.id_sub_giat_bl = null; //baru
                                data_asmas.detail_subgiat = null;
                                data_asmas.detail_gagasan = null;
                                data_asmas.detail_namakabkota = null;
                                data_asmas.detail_camatteks = null;
                                data_asmas.detail_lurahteks = null;
                                data_asmas.detail_bidangurusan = null;
                                data_asmas.bidang_urusan = null;
                                data_asmas.detail_idskpd = null;
                                data_asmas.detail_kodeskpd = null;
                                data_asmas.detail_namaskpd = null;
                                data_asmas.detail_nama_rev_unit = null;

                                data_asmas.nama_skpd = null;

                                data_asmas.detail_kode_bidang_urusan = null;
                                data_asmas.detail_rekomteks = null;                                    
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
                            }
                            else
                            {
                                var data_asmas = {};
                                data_asmas.id_usulan = current_data.id_usulan;  
                                data_asmas.id_unik = current_data.id_unik; //baru
                                data_asmas.tahun = current_data.tahun; //baru
                                data_asmas.id_daerah = current_data.id_daerah;
                                data_asmas.id_pengusul = current_data.id_pengusul;
                                data_asmas.id_jenis_usul = current_data.id_jenis_usul;
                                data_asmas.id_bidang_urusan = current_data.id_bidang_urusan;
                                data_asmas.giat_teks = current_data.nama_kamus; 
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

                                var idusulan = current_data.id_usulan;
                                var idstatususulan = current_data.status_usul;                                                       
                                get_detail_asmas(idusulan, idstatususulan).then(function(detail){
                                    // console.log(detail.data[0]);                                    
                                    data_asmas.detail_idkamus = detail.data[0].idkamus;
                                    data_asmas.detail_id_isu = detail.data[0].id_isu; //baru
                                    data_asmas.detail_id_program = detail.data[0].id_program; //baru
                                    data_asmas.detail_volume = detail.data[0].volume;
                                    data_asmas.detail_satuan = detail.data[0].satuan;

                                    data_asmas.satuan = detail.data[0].satuan;
                                    data_asmas.detail_koefisien = detail.data[0].koefisien; //baru
                                    data_asmas.koefisien = detail.data[0].koefisien;
                                    data_asmas.detail_anggaran = detail.data[0].anggaran;
                                    data_asmas.lokus_usulan = detail.data[0].lokus_usulan;

                                    data_asmas.detail_alamatteks = detail.data[0].alamatteks;                                
                                    data_asmas.detail_idkabkota = detail.data[0].id_kab_kota;
                                    data_asmas.detail_idcamat = detail.data[0].id_kecamatan;
                                    data_asmas.detail_idlurah = detail.data[0].id_kelurahan;
                                    data_asmas.detail_is_stat_lahan = detail.data[0].is_stat_lahan; //baru
                                    data_asmas.detail_is_sertifikat_lahan = detail.data[0].is_sertifikat_lahan; //baru
                                    data_asmas.detail_is_rincian_teknis = detail.data[0].is_rincian_teknis; //baru
                                    data_asmas.detail_latbel_teks = detail.data[0].latbel_teks; //baru
                                    data_asmas.detail_dashuk_teks = detail.data[0].dashuk_teks; //baru
                                    data_asmas.detail_maksud_teks = detail.data[0].maksud_teks; //baru
                                    data_asmas.detail_tujuan_teks = detail.data[0].tujuan_teks; //baru                                            
                                    data_asmas.detail_filepengantar = detail.data[0].file_pengantar;
                                    data_asmas.detail_fileproposal = detail.data[0].file_proposal;
                                    data_asmas.detail_filerab = detail.data[0].file_rab;
                                    data_asmas.detail_filefoto = detail.data[0].file_foto;
                                    data_asmas.detail_filefoto2 = detail.data[0].file_foto_2;
                                    data_asmas.detail_filefoto3 = detail.data[0].file_foto_3;

                                    data_asmas.file_foto = detail.data[0].file_foto;
                                    data_asmas.file_pengantar = detail.data[0].file_pengantar;
                                    data_asmas.file_proposal = detail.data[0].file_proposal;
                                    data_asmas.file_rab = detail.data[0].file_rab;

                                    data_asmas.detail_id_akun = detail.data[0].id_akun; //baru
                                    data_asmas.detail_langpeta = detail.data[0].map_lng_lokasi;
                                    data_asmas.detail_latpeta = detail.data[0].map_lat_lokasi;
                                    data_asmas.id_prop = detail.data[0].id_prop; //baru
                                    data_asmas.detail_tujuanusul = detail.data[0].tujuan_usul;
                                    
                                    data_asmas.tujuan_usul = detail.data[0].tujuan_usul;

                                    data_asmas.detail_jenisbelanja = detail.data[0].jenis_belanja;

                                    data_asmas.jenis_belanja = detail.data[0].jenis_belanja;

                                    data_asmas.detail_masalah = detail.data[0].masalah;
                                    data_asmas.id_bl = detail.data[0].id_bl; //baru
                                    data_asmas.id_sub_bl = detail.data[0].id_sub_bl; //baru
                                    data_asmas.sub_giat_baru = detail.data[0].sub_giat_baru; //baru
                                    data_asmas.rev_skpd = detail.data[0].rev_unit;
                                    data_asmas.rev_unit = detail.data[0].rev_unit; //baru
                                    data_asmas.id_skpd_bl = detail.data[0].id_skpd_bl; //baru
                                    data_asmas.id_sub_skpd_bl = detail.data[0].id_sub_skpd_bl; //baru
                                    data_asmas.id_program_bl = detail.data[0].id_program_bl; //baru
                                    data_asmas.id_giat_bl = detail.data[0].id_giat_bl; //baru
                                    data_asmas.id_sub_giat_bl = detail.data[0].id_sub_giat_bl; //baru
                                    data_asmas.detail_subgiat = detail.data[0].id_sub_giat_bl;
                                    data_asmas.detail_gagasan = detail.data[0].nama_kamus;
                                    data_asmas.detail_namakabkota = detail.data[0].nama_kab_kota;
                                    data_asmas.detail_camatteks = detail.data[0].nama_camat;
                                    data_asmas.detail_lurahteks = detail.data[0].nama_lurah;
                                    data_asmas.detail_bidangurusan = detail.data[0].nama_bidang_urusan;
                                    data_asmas.bidang_urusan = detail.data[0].nama_bidang_urusan;
                                    data_asmas.detail_idskpd = detail.data[0].id_skpd_awal;
                                    data_asmas.detail_id_skpd_awal = detail.data[0].id_skpd_awal;                                
                                    data_asmas.detail_kodeskpd = detail.data[0].kodeskpd;
                                    data_asmas.detail_namaskpd = detail.data[0].nama_skpd_awal;
                                    data_asmas.detail_nama_rev_unit = detail.data[0].nama_rev_unit;
                                    data_asmas.nama_skpd = detail.data[0].nama_rev_unit;
                                    data_asmas.detail_kode_bidang_urusan = detail.data[0].kode_bidang_urusan;
                                    data_asmas.detail_rekomteks = detail.data[0].rekom_teks;
                                    
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
                }, Promise.resolve(data.data[last]))
                .then(function(data_last){
                    hide_loading();                 
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
	      	success: function(detail){
	      		return resolve(detail);
	      	}
	    });
    });
}