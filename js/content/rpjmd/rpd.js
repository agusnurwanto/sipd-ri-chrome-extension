function backup_rpd(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		jadwal_rpd_aktif(_token.tahun, _token.daerah_id).then(function(rpd_aktif){
            relayAjax({
                url: config.sipd_url+'api/rpjm/rpd_program/list',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,									
					tahun: _token.tahun,					
                    tahun_awal: rpd_aktif.data[0].tahun_awal,	
                    tahun_akhir: rpd_aktif.data[0].tahun_akhir,						
					id_tahap: rpd_aktif.data[0].id_tahap,					
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				},
                success: function (data) {
                    var data_rpd = {
                        action: 'singkron_data_rpd',
                        type: 'ri',
						tahun_anggaran: _token.tahun,
						api_key: config.api_key,
                        program: [],
                        sasaran: [],
                        tujuan: []
                    };
                    data.data.map(function (program, i) {
                        data_rpd.program[i] = {};
                        data_rpd.program[i].id_misi = program.id_misi;
                        data_rpd.program[i].id_misi_old = program.id_misi_old;
                        data_rpd.program[i].id_program = program.id_program;
                        data_rpd.program[i].id_unik = program.id_unik;
                        data_rpd.program[i].id_unik_indikator = program.id_unik_indikator;
                        data_rpd.program[i].id_unit = program.id_unit;
                        data_rpd.program[i].id_visi = program.id_visi;
                        data_rpd.program[i].indikator = program.indikator;
                        data_rpd.program[i].is_locked = program.is_locked;
                        data_rpd.program[i].is_locked_indikator = program.is_locked_indikator;
                        data_rpd.program[i].kode_sasaran = program.kode_sasaran;
                        // data_rpd.program[i].kode_skpd = program.kode_skpd;
                        data_rpd.program[i].kode_tujuan = program.kode_tujuan;
                        // data_rpd.program[i].misi_teks = program.misi_teks;
                        // data_rpd.program[i].nama_program = program.nama_program;
                        // data_rpd.program[i].nama_skpd = program.nama_skpd;
                        data_rpd.program[i].pagu_1 = program.pagu_1;
                        data_rpd.program[i].pagu_2 = program.pagu_2;
                        data_rpd.program[i].pagu_3 = program.pagu_3;
                        data_rpd.program[i].pagu_4 = program.pagu_4;
                        data_rpd.program[i].pagu_5 = program.pagu_5;
                        // data_rpd.program[i].program_lock = program.program_lock;
                        // data_rpd.program[i].sasaran_lock = program.sasaran_lock;
                        // data_rpd.program[i].sasaran_teks = program.sasaran_teks;
                        data_rpd.program[i].satuan = program.satuan;
                        // data_rpd.program[i].status = program.status;
                        data_rpd.program[i].target_1 = program.target_1;
                        data_rpd.program[i].target_2 = program.target_2;
                        data_rpd.program[i].target_3 = program.target_3;
                        data_rpd.program[i].target_4 = program.target_4;
                        data_rpd.program[i].target_5 = program.target_5;
                        data_rpd.program[i].target_akhir = program.target_akhir;
                        data_rpd.program[i].target_awal = program.target_awal;
                        // data_rpd.program[i].tujuan_lock = program.tujuan_lock;
                        // data_rpd.program[i].tujuan_teks = program.tujuan_teks;
                        // data_rpd.program[i].urut_misi = program.urut_misi;
                        // data_rpd.program[i].urut_sasaran = program.urut_sasaran;
                        // data_rpd.program[i].urut_tujuan = program.urut_tujuan;
                        // data_rpd.program[i].visi_teks = program.visi_teks;
                        data_rpd.program[i].id_rpd = program.id_rpd; //baru    
                        data_rpd.program[i].pagu_awal = program.pagu_awal; //baru
                        data_rpd.program[i].pagu_akhir = program.pagu_akhir; //baru
                        data_rpd.program[i].id_sasaran_indikator = program.id_sasaran_indikator; //baru
                        data_rpd.program[i].tahun_awal = program.tahun_awal; //baru
                        data_rpd.program[i].tahun_akhir = program.tahun_akhir; //baru                        
                        data_rpd.program[i].id_tahap = program.id_tahap; //baru
                        data_rpd.program[i].id_jadwal = program.id_jadwal; //baru
                        data_rpd.program[i].id_tujuan_old = program.id_tujuan_old; //baru
                        data_rpd.program[i].id_sasaran_old = program.id_sasaran_old; //baru
                        data_rpd.program[i].id_bidang_urusan = program.id_bidang_urusan; //baru
                        
						var idprogram = program.id_program;
                        var tahun = _token.tahun;
                        var idskpd = program.id_unit;                        
                        var iddaerah = _token.daerah_id;	
                        get_program(idprogram, tahun).then(function(p){	                            
                            data_rpd.program[i].kode_program = p.data[0].kode_program;
                            data_rpd.program[i].nama_program = p.data[0].nama_program;
                                if(program.id_unit != 0){
                                    get_detil_skpd({
                                        idskpd: idskpd,
                                        tahun: tahun,
                                        iddaerah: iddaerah
                                    })
                                    .then(function(data){                                        
                                        data_rpd.program[i].nama_skpd = data.data[0].nama_skpd;
                                        data_rpd.program[i].kode_skpd = data.data[0].kode_unit;                                        
                                    })
                                }
                            	
                        })                                            
                    })
                    relayAjax({
                        url: config.sipd_url+'api/rpjm/rpd_sasaran/list',
                        type: 'POST',
                        data: {            
                            id_daerah: _token.daerah_id,									
                            tahun: _token.tahun,					
                            tahun_awal: rpd_aktif.data[0].tahun_awal,	
                            tahun_akhir: rpd_aktif.data[0].tahun_akhir,						
                            id_tahap: rpd_aktif.data[0].id_tahap,					
                        },
                        beforeSend: function (xhr) {			    
                            xhr.setRequestHeader("X-API-KEY", x_api_key());
                            xhr.setRequestHeader("x-access-token", _token.token);
                        },
                        success: function (data) {
                            data.data.map(function (sasaran, i) {
                                data_rpd.sasaran[i] = {};
                                data_rpd.sasaran[i].id_misi = sasaran.id_misi;
                                data_rpd.sasaran[i].id_misi_old = sasaran.id_misi_old;
                                data_rpd.sasaran[i].id_sasaran = sasaran.id_sasaran;
                                data_rpd.sasaran[i].id_unik = sasaran.id_unik;
                                data_rpd.sasaran[i].id_unik_indikator = sasaran.id_unik_indikator;
                                data_rpd.sasaran[i].id_visi = sasaran.id_visi;
                                data_rpd.sasaran[i].indikator_teks = sasaran.indikator_teks;
                                data_rpd.sasaran[i].is_locked = sasaran.is_locked;
                                data_rpd.sasaran[i].is_locked_indikator = sasaran.is_locked_indikator;
                                data_rpd.sasaran[i].kode_tujuan = sasaran.kode_tujuan;
                                // data_rpd.sasaran[i].misi_teks = sasaran.misi_teks;
                                data_rpd.sasaran[i].sasaran_teks = sasaran.sasaran_teks;
                                data_rpd.sasaran[i].satuan = sasaran.satuan;
                                // data_rpd.sasaran[i].status = sasaran.status;
                                data_rpd.sasaran[i].target_1 = sasaran.target_1;
                                data_rpd.sasaran[i].target_2 = sasaran.target_2;
                                data_rpd.sasaran[i].target_3 = sasaran.target_3;
                                data_rpd.sasaran[i].target_4 = sasaran.target_4;
                                data_rpd.sasaran[i].target_5 = sasaran.target_5;
                                data_rpd.sasaran[i].target_akhir = sasaran.target_akhir;
                                data_rpd.sasaran[i].target_awal = sasaran.target_awal;
                                // data_rpd.sasaran[i].tujuan_lock = sasaran.tujuan_lock;
                                // data_rpd.sasaran[i].tujuan_teks = sasaran.tujuan_teks;
                                // data_rpd.sasaran[i].urut_misi = sasaran.urut_misi;
                                data_rpd.sasaran[i].urut_sasaran = sasaran.urut_sasaran;
                                // data_rpd.sasaran[i].urut_tujuan = sasaran.urut_tujuan;
                                // data_rpd.sasaran[i].visi_teks = sasaran.visi_teks;
                                data_rpd.sasaran[i].tahun_awal = sasaran.tahun_awal; //baru
                                data_rpd.sasaran[i].tahun_akhir = sasaran.tahun_akhir; //baru
                                data_rpd.sasaran[i].id_tahap = sasaran.id_tahap; //baru
                                data_rpd.sasaran[i].id_jadwal = sasaran.id_jadwal; //baru
                                data_rpd.sasaran[i].id_tujuan_old = sasaran.id_tujuan_old; //baru
                                data_rpd.sasaran[i].id_sasaran_old = sasaran.id_sasaran_old; //baru
                                data_rpd.sasaran[i].id_tujuan_indikator = sasaran.id_tujuan_indikator; //baru
                            });
                            relayAjax({
                                url: config.sipd_url+'api/rpjm/rpd_tujuan/list',
                                type: 'POST',
                                data: {            
                                    id_daerah: _token.daerah_id,									
                                    tahun: _token.tahun,					
                                    // tahun_awal: rpd_aktif.data[0].tahun_awal,	
                                    // tahun_akhir: rpd_aktif.data[0].tahun_akhir,						
                                    // id_tahap: rpd_aktif.data[0].id_tahap,					
                                },
                                beforeSend: function (xhr) {			    
                                    xhr.setRequestHeader("X-API-KEY", x_api_key());
                                    xhr.setRequestHeader("x-access-token", _token.token);
                                },
                                success: function (data) {
                                    data.data.map(function (tujuan, i) {
                                        data_rpd.tujuan[i] = {};
                                        data_rpd.tujuan[i].id_misi = tujuan.id_misi;
                                        data_rpd.tujuan[i].id_misi_old = tujuan.id_misi_old;
                                        data_rpd.tujuan[i].id_tujuan = tujuan.id_tujuan;
                                        data_rpd.tujuan[i].id_unik = tujuan.id_unik;
                                        data_rpd.tujuan[i].id_unik_indikator = tujuan.id_unik_indikator;
                                        data_rpd.tujuan[i].id_visi = tujuan.id_visi;
                                        data_rpd.tujuan[i].indikator_teks = tujuan.indikator_teks;
                                        data_rpd.tujuan[i].is_locked = tujuan.is_locked;
                                        data_rpd.tujuan[i].is_locked_indikator = tujuan.is_locked_indikator;
                                        // data_rpd.tujuan[i].misi_lock = tujuan.misi_lock;
                                        // data_rpd.tujuan[i].misi_teks = tujuan.misi_teks;
                                        data_rpd.tujuan[i].satuan = tujuan.satuan;
                                        // data_rpd.tujuan[i].status = tujuan.status;
                                        data_rpd.tujuan[i].target_1 = tujuan.target_1;
                                        data_rpd.tujuan[i].target_2 = tujuan.target_2;
                                        data_rpd.tujuan[i].target_3 = tujuan.target_3;
                                        data_rpd.tujuan[i].target_4 = tujuan.target_4;
                                        data_rpd.tujuan[i].target_5 = tujuan.target_5;
                                        data_rpd.tujuan[i].target_akhir = tujuan.target_akhir;
                                        data_rpd.tujuan[i].target_awal = tujuan.target_awal;
                                        data_rpd.tujuan[i].tujuan_teks = tujuan.tujuan_teks;
                                        // data_rpd.tujuan[i].urut_misi = tujuan.urut_misi;
                                        data_rpd.tujuan[i].urut_tujuan = tujuan.urut_tujuan;
                                        // data_rpd.tujuan[i].visi_teks = tujuan.visi_teks;
                                        data_rpd.tujuan[i].tahun_awal = tujuan.tahun_awal; //baru
                                        data_rpd.tujuan[i].tahun_akhir = tujuan.tahun_akhir; //baru
                                        data_rpd.tujuan[i].id_tahap = tujuan.id_tahap; //baru
                                        data_rpd.tujuan[i].id_jadwal = tujuan.id_jadwal; //baru
                                        data_rpd.tujuan[i].id_tujuan_old = tujuan.id_tujuan_old; //baru
                                    });
                                    //    relayAjax({
                                    //     url: config.sipd_url+'api/rpjm/rpjm_misi/list',
                                    //     type: 'POST',
                                    //     data: {            
                                    //         id_daerah: _token.daerah_id,									
                                    //         tahun: _token.tahun,					
                                    //         tahun_awal: rpd_aktif.data[0].tahun_awal,	
                                    //         tahun_akhir: rpd_aktif.data[0].tahun_akhir,						
                                    //         id_tahap: rpd_aktif.data[0].id_tahap,					
                                    //     },
                                    //     beforeSend: function (xhr) {			    
                                    //         xhr.setRequestHeader("X-API-KEY", x_api_key());
                                    //         xhr.setRequestHeader("x-access-token", _token.token);
                                    //     },
                                    //     success: function (data) {
                                    //         data.data.map(function (misi, i) {
                                    //             data_rpd.misi[i] = {};
                                    //             data_rpd.misi[i].id_misi = misi.id_misi;
                                    //             data_rpd.misi[i].id_misi_old = misi.id_misi_old;
                                    //             data_rpd.misi[i].id_visi = misi.id_visi;
                                    //             data_rpd.misi[i].is_locked = misi.is_locked;
                                    //             data_rpd.misi[i].misi_teks = misi.misi_teks;
                                    //             // data_rpd.misi[i].status = misi.status;
                                    //             data_rpd.misi[i].urut_misi = misi.urut_misi;
                                    //             // data_rpd.misi[i].visi_lock = misi.visi_lock;
                                    //             // data_rpd.misi[i].visi_teks = misi.visi_teks;
                                    //             data_rpd.misi[i].id_unik = misi.id_unik; //baru
                                    //             data_rpd.misi[i].tahun_awal = misi.tahun_awal; //baru
                                    //             data_rpd.misi[i].tahun_akhir = misi.tahun_akhir; //baru
                                    //             data_rpd.misi[i].id_tahap = misi.id_tahap; //baru                                                                                              
                                    //         });
                                    //            relayAjax({
                                    //             url: config.sipd_url+'api/rpjm/rpjm_visi/list',
                                    //             type: 'POST',
                                    //             data: {            
                                    //                 id_daerah: _token.daerah_id,									
                                    //                 tahun: _token.tahun,					
                                    //                 // tahun_awal: rpjmd_aktif.data[0].tahun_awal,	
                                    //                 // tahun_akhir: rpjmd_aktif.data[0].tahun_akhir,						
                                    //                 id_tahap: rpjmd_aktif.data[0].id_tahap,					
                                    //             },
                                    //             beforeSend: function (xhr) {			    
                                    //                 xhr.setRequestHeader("X-API-KEY", x_api_key());
                                    //                 xhr.setRequestHeader("x-access-token", _token.token);
                                    //             },
                                    //             success: function (data) {
                                    //                 data.data.map(function (visi, i) {
                                    //                     data_rpd.visi[i] = {};
                                    //                     data_rpd.visi[i].id_visi = visi.id_visi;
                                    //                     data_rpd.visi[i].is_locked = visi.is_locked;
                                    //                     // data_rpd.visi[i].status = visi.status;
                                    //                     data_rpd.visi[i].visi_teks = visi.visi_teks;
                                    //                     data_rpd.visi[i].id_unik = visi.id_unik; //baru
                                    //                     data_rpd.visi[i].id_tahap = visi.id_tahap; //baru
                                    //                     data_rpd.visi[i].tahun_awal = visi.tahun_awal; //baru
                                    //                     data_rpd.visi[i].tahun_akhir = visi.tahun_akhir; //baru                                                                                                       
                                    //                 });
                                    //                 var data = {
                                    //                     message: {
                                    //                         type: "get-url",
                                    //                         content: {
                                    //                             url: config.url_server_lokal,
                                    //                             type: 'post',
                                    //                             data: data_rpd,
                                    //                             return: true
                                    //                         }
                                    //                     }
                                    //                 };
                                    //                 chrome.runtime.sendMessage(data, function (response) {
                                    //                     console.log('responeMessage', response);
                                    //                 });
                                    //             }
                                    //         });
                                    //     }
                                    // });
                                }
                            });
                        }
                    });
                }
            })
        });
    }
}


function jadwal_rpd_aktif(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/jadwal/rpjm_jadwal/cekAktif',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
                isRpd: 1
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(jadwal_rpd_aktif){
	      		return resolve(jadwal_rpd_aktif);
	      	}
	    });
    });
}

function cekRpjmPerubahan(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/rpjm/rpjm_visi/cekRpjmPerubahan',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(cekRpjmPerubahan){
	      		return resolve(cekRpjmPerubahan);
	      	}
	    });
    });
}