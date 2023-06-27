function backup_rpjmd(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
		var apiKey = x_api_key();		
		jadwal_rpjmd_aktif(_token.tahun, _token.daerah_id).then(function(rpjmd_aktif){
            relayAjax({
                url: config.sipd_url+'api/rpjm/rpjm_program/list',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,									
					tahun: _token.tahun,					
                    tahun_awal: rpjmd_aktif.data[0].tahun_awal,	
                    tahun_akhir: rpjmd_aktif.data[0].tahun_akhir,						
					id_tahap: rpjmd_aktif.data[0].id_tahap,					
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", apiKey);
					xhr.setRequestHeader("x-access-token", _token.token);
				},
                success: function (data) {
                    var data_rpjmd = {
                        action: 'singkron_data_rpjmd',
                        type: 'ri',
						tahun_anggaran: _token.tahun,
						api_key: config.api_key,
                        program: [],
                        sasaran: [],
                        tujuan: [],
                        misi: [],
                        visi: []
                    };
                    data.data.map(function (program, i) {
                        data_rpjmd.program[i] = {};
                        data_rpjmd.program[i].id_misi = program.id_misi;
                        data_rpjmd.program[i].id_misi_old = program.id_misi_old;
                        data_rpjmd.program[i].id_program = program.id_program;
                        data_rpjmd.program[i].id_unik = program.id_unik;
                        data_rpjmd.program[i].id_unik_indikator = program.id_unik_indikator;
                        data_rpjmd.program[i].id_unit = program.id_unit;
                        data_rpjmd.program[i].id_visi = program.id_visi;
                        data_rpjmd.program[i].indikator = program.indikator;
                        data_rpjmd.program[i].is_locked = program.is_locked;
                        data_rpjmd.program[i].is_locked_indikator = program.is_locked_indikator;
                        data_rpjmd.program[i].kode_sasaran = program.kode_sasaran;
                        // data_rpjmd.program[i].kode_skpd = program.kode_skpd;
                        data_rpjmd.program[i].kode_tujuan = program.kode_tujuan;
                        // data_rpjmd.program[i].misi_teks = program.misi_teks;
                        // data_rpjmd.program[i].nama_program = program.nama_program;
                        // data_rpjmd.program[i].nama_skpd = program.nama_skpd;
                        data_rpjmd.program[i].pagu_1 = program.pagu_1;
                        data_rpjmd.program[i].pagu_2 = program.pagu_2;
                        data_rpjmd.program[i].pagu_3 = program.pagu_3;
                        data_rpjmd.program[i].pagu_4 = program.pagu_4;
                        data_rpjmd.program[i].pagu_5 = program.pagu_5;
                        // data_rpjmd.program[i].program_lock = program.program_lock;
                        // data_rpjmd.program[i].sasaran_lock = program.sasaran_lock;
                        // data_rpjmd.program[i].sasaran_teks = program.sasaran_teks;
                        data_rpjmd.program[i].satuan = program.satuan;
                        // data_rpjmd.program[i].status = program.status;
                        data_rpjmd.program[i].target_1 = program.target_1;
                        data_rpjmd.program[i].target_2 = program.target_2;
                        data_rpjmd.program[i].target_3 = program.target_3;
                        data_rpjmd.program[i].target_4 = program.target_4;
                        data_rpjmd.program[i].target_5 = program.target_5;
                        data_rpjmd.program[i].target_akhir = program.target_akhir;
                        data_rpjmd.program[i].target_awal = program.target_awal;
                        // data_rpjmd.program[i].tujuan_lock = program.tujuan_lock;
                        // data_rpjmd.program[i].tujuan_teks = program.tujuan_teks;
                        // data_rpjmd.program[i].urut_misi = program.urut_misi;
                        // data_rpjmd.program[i].urut_sasaran = program.urut_sasaran;
                        // data_rpjmd.program[i].urut_tujuan = program.urut_tujuan;
                        // data_rpjmd.program[i].visi_teks = program.visi_teks;
                        data_rpjmd.program[i].id_rpjmd = program.id_rpjmd; //baru    
                        data_rpjmd.program[i].pagu_awal = program.pagu_awal; //baru
                        data_rpjmd.program[i].pagu_akhir = program.pagu_akhir; //baru
                        data_rpjmd.program[i].id_sasaran_indikator = program.id_sasaran_indikator; //baru
                        data_rpjmd.program[i].tahun_awal = program.tahun_awal; //baru
                        data_rpjmd.program[i].tahun_akhir = program.tahun_akhir; //baru                        
                        data_rpjmd.program[i].id_tahap = program.id_tahap; //baru
                        data_rpjmd.program[i].id_jadwal = program.id_jadwal; //baru
                        data_rpjmd.program[i].id_tujuan_old = program.id_tujuan_old; //baru
                        data_rpjmd.program[i].id_sasaran_old = program.id_sasaran_old; //baru
                        data_rpjmd.program[i].id_bidang_urusan = program.id_bidang_urusan; //baru
                        
						var idprogram = program.id_program;
                        var tahun = _token.tahun;
                        var idskpd = program.id_unit;                        
                        var iddaerah = _token.daerah_id;	
                        get_program(idprogram, tahun).then(function(p){	                            
                            data_rpjmd.program[i].kode_program = p.data[0].kode_program;
                            data_rpjmd.program[i].nama_program = p.data[0].nama_program;
                                if(program.id_unit != 0){
                                    get_detil_skpd({
                                        idskpd: idskpd,
                                        tahun: tahun,
                                        iddaerah: iddaerah
                                    })
                                    .then(function(data){                                        
                                        data_rpjmd.program[i].nama_skpd = data.data[0].nama_skpd;
                                        data_rpjmd.program[i].kode_skpd = data.data[0].kode_unit;                                        
                                    })
                                }
                            	
                        })                                            
                    })
                    relayAjax({
                        url: config.sipd_url+'api/rpjm/rpjm_sasaran/list',
                        type: 'POST',
                        data: {            
                            id_daerah: _token.daerah_id,									
                            tahun: _token.tahun,					
                            tahun_awal: rpjmd_aktif.data[0].tahun_awal,	
                            tahun_akhir: rpjmd_aktif.data[0].tahun_akhir,						
                            id_tahap: rpjmd_aktif.data[0].id_tahap,					
                        },
                        beforeSend: function (xhr) {			    
                            xhr.setRequestHeader("X-API-KEY", apiKey);
                            xhr.setRequestHeader("x-access-token", _token.token);
                        },
                        success: function (data) {
                            data.data.map(function (sasaran, i) {
                                data_rpjmd.sasaran[i] = {};
                                data_rpjmd.sasaran[i].id_misi = sasaran.id_misi;
                                data_rpjmd.sasaran[i].id_misi_old = sasaran.id_misi_old;
                                data_rpjmd.sasaran[i].id_sasaran = sasaran.id_sasaran;
                                data_rpjmd.sasaran[i].id_unik = sasaran.id_unik;
                                data_rpjmd.sasaran[i].id_unik_indikator = sasaran.id_unik_indikator;
                                data_rpjmd.sasaran[i].id_visi = sasaran.id_visi;
                                data_rpjmd.sasaran[i].indikator_teks = sasaran.indikator_teks;
                                data_rpjmd.sasaran[i].is_locked = sasaran.is_locked;
                                data_rpjmd.sasaran[i].is_locked_indikator = sasaran.is_locked_indikator;
                                data_rpjmd.sasaran[i].kode_tujuan = sasaran.kode_tujuan;
                                // data_rpjmd.sasaran[i].misi_teks = sasaran.misi_teks;
                                data_rpjmd.sasaran[i].sasaran_teks = sasaran.sasaran_teks;
                                data_rpjmd.sasaran[i].satuan = sasaran.satuan;
                                // data_rpjmd.sasaran[i].status = sasaran.status;
                                data_rpjmd.sasaran[i].target_1 = sasaran.target_1;
                                data_rpjmd.sasaran[i].target_2 = sasaran.target_2;
                                data_rpjmd.sasaran[i].target_3 = sasaran.target_3;
                                data_rpjmd.sasaran[i].target_4 = sasaran.target_4;
                                data_rpjmd.sasaran[i].target_5 = sasaran.target_5;
                                data_rpjmd.sasaran[i].target_akhir = sasaran.target_akhir;
                                data_rpjmd.sasaran[i].target_awal = sasaran.target_awal;
                                // data_rpjmd.sasaran[i].tujuan_lock = sasaran.tujuan_lock;
                                // data_rpjmd.sasaran[i].tujuan_teks = sasaran.tujuan_teks;
                                // data_rpjmd.sasaran[i].urut_misi = sasaran.urut_misi;
                                data_rpjmd.sasaran[i].urut_sasaran = sasaran.urut_sasaran;
                                // data_rpjmd.sasaran[i].urut_tujuan = sasaran.urut_tujuan;
                                // data_rpjmd.sasaran[i].visi_teks = sasaran.visi_teks;
                                data_rpjmd.sasaran[i].tahun_awal = sasaran.tahun_awal; //baru
                                data_rpjmd.sasaran[i].tahun_akhir = sasaran.tahun_akhir; //baru
                                data_rpjmd.sasaran[i].id_tahap = sasaran.id_tahap; //baru
                                data_rpjmd.sasaran[i].id_jadwal = sasaran.id_jadwal; //baru
                                data_rpjmd.sasaran[i].id_tujuan_old = sasaran.id_tujuan_old; //baru
                                data_rpjmd.sasaran[i].id_sasaran_old = sasaran.id_sasaran_old; //baru
                                data_rpjmd.sasaran[i].id_tujuan_indikator = sasaran.id_tujuan_indikator; //baru
                            });
                            relayAjax({
                                url: config.sipd_url+'api/rpjm/rpjm_tujuan/list',
                                type: 'POST',
                                data: {            
                                    id_daerah: _token.daerah_id,									
                                    tahun: _token.tahun,					
                                    tahun_awal: rpjmd_aktif.data[0].tahun_awal,	
                                    tahun_akhir: rpjmd_aktif.data[0].tahun_akhir,						
                                    id_tahap: rpjmd_aktif.data[0].id_tahap,					
                                },
                                beforeSend: function (xhr) {			    
                                    xhr.setRequestHeader("X-API-KEY", apiKey);
                                    xhr.setRequestHeader("x-access-token", _token.token);
                                },
                                success: function (data) {
                                    data.data.map(function (tujuan, i) {
                                        data_rpjmd.tujuan[i] = {};
                                        data_rpjmd.tujuan[i].id_misi = tujuan.id_misi;
                                        data_rpjmd.tujuan[i].id_misi_old = tujuan.id_misi_old;
                                        data_rpjmd.tujuan[i].id_tujuan = tujuan.id_tujuan;
                                        data_rpjmd.tujuan[i].id_unik = tujuan.id_unik;
                                        data_rpjmd.tujuan[i].id_unik_indikator = tujuan.id_unik_indikator;
                                        data_rpjmd.tujuan[i].id_visi = tujuan.id_visi;
                                        data_rpjmd.tujuan[i].indikator_teks = tujuan.indikator_teks;
                                        data_rpjmd.tujuan[i].is_locked = tujuan.is_locked;
                                        data_rpjmd.tujuan[i].is_locked_indikator = tujuan.is_locked_indikator;
                                        // data_rpjmd.tujuan[i].misi_lock = tujuan.misi_lock;
                                        // data_rpjmd.tujuan[i].misi_teks = tujuan.misi_teks;
                                        data_rpjmd.tujuan[i].satuan = tujuan.satuan;
                                        // data_rpjmd.tujuan[i].status = tujuan.status;
                                        data_rpjmd.tujuan[i].target_1 = tujuan.target_1;
                                        data_rpjmd.tujuan[i].target_2 = tujuan.target_2;
                                        data_rpjmd.tujuan[i].target_3 = tujuan.target_3;
                                        data_rpjmd.tujuan[i].target_4 = tujuan.target_4;
                                        data_rpjmd.tujuan[i].target_5 = tujuan.target_5;
                                        data_rpjmd.tujuan[i].target_akhir = tujuan.target_akhir;
                                        data_rpjmd.tujuan[i].target_awal = tujuan.target_awal;
                                        data_rpjmd.tujuan[i].tujuan_teks = tujuan.tujuan_teks;
                                        // data_rpjmd.tujuan[i].urut_misi = tujuan.urut_misi;
                                        data_rpjmd.tujuan[i].urut_tujuan = tujuan.urut_tujuan;
                                        // data_rpjmd.tujuan[i].visi_teks = tujuan.visi_teks;
                                        data_rpjmd.tujuan[i].tahun_awal = tujuan.tahun_awal; //baru
                                        data_rpjmd.tujuan[i].tahun_akhir = tujuan.tahun_akhir; //baru
                                        data_rpjmd.tujuan[i].id_tahap = tujuan.id_tahap; //baru
                                        data_rpjmd.tujuan[i].id_jadwal = tujuan.id_jadwal; //baru
                                        data_rpjmd.tujuan[i].id_tujuan_old = tujuan.id_tujuan_old; //baru
                                    });
                                       relayAjax({
                                        url: config.sipd_url+'api/rpjm/rpjm_misi/list',
                                        type: 'POST',
                                        data: {            
                                            id_daerah: _token.daerah_id,									
                                            tahun: _token.tahun,					
                                            tahun_awal: rpjmd_aktif.data[0].tahun_awal,	
                                            tahun_akhir: rpjmd_aktif.data[0].tahun_akhir,						
                                            id_tahap: rpjmd_aktif.data[0].id_tahap,					
                                        },
                                        beforeSend: function (xhr) {			    
                                            xhr.setRequestHeader("X-API-KEY", apiKey);
                                            xhr.setRequestHeader("x-access-token", _token.token);
                                        },
                                        success: function (data) {
                                            data.data.map(function (misi, i) {
                                                data_rpjmd.misi[i] = {};
                                                data_rpjmd.misi[i].id_misi = misi.id_misi;
                                                data_rpjmd.misi[i].id_misi_old = misi.id_misi_old;
                                                data_rpjmd.misi[i].id_visi = misi.id_visi;
                                                data_rpjmd.misi[i].is_locked = misi.is_locked;
                                                data_rpjmd.misi[i].misi_teks = misi.misi_teks;
                                                // data_rpjmd.misi[i].status = misi.status;
                                                data_rpjmd.misi[i].urut_misi = misi.urut_misi;
                                                // data_rpjmd.misi[i].visi_lock = misi.visi_lock;
                                                // data_rpjmd.misi[i].visi_teks = misi.visi_teks;
                                                data_rpjmd.misi[i].id_unik = misi.id_unik; //baru
                                                data_rpjmd.misi[i].tahun_awal = misi.tahun_awal; //baru
                                                data_rpjmd.misi[i].tahun_akhir = misi.tahun_akhir; //baru
                                                data_rpjmd.misi[i].id_tahap = misi.id_tahap; //baru                                                                                              
                                            });
                                               relayAjax({
                                                url: config.sipd_url+'api/rpjm/rpjm_visi/list',
                                                type: 'POST',
                                                data: {            
                                                    id_daerah: _token.daerah_id,									
                                                    tahun: _token.tahun,					
                                                    // tahun_awal: rpjmd_aktif.data[0].tahun_awal,	
                                                    // tahun_akhir: rpjmd_aktif.data[0].tahun_akhir,						
                                                    id_tahap: rpjmd_aktif.data[0].id_tahap,					
                                                },
                                                beforeSend: function (xhr) {			    
                                                    xhr.setRequestHeader("X-API-KEY", apiKey);
                                                    xhr.setRequestHeader("x-access-token", _token.token);
                                                },
                                                success: function (data) {
                                                    data.data.map(function (visi, i) {
                                                        data_rpjmd.visi[i] = {};
                                                        data_rpjmd.visi[i].id_visi = visi.id_visi;
                                                        data_rpjmd.visi[i].is_locked = visi.is_locked;
                                                        // data_rpjmd.visi[i].status = visi.status;
                                                        data_rpjmd.visi[i].visi_teks = visi.visi_teks;
                                                        data_rpjmd.visi[i].id_unik = visi.id_unik; //baru
                                                        data_rpjmd.visi[i].id_tahap = visi.id_tahap; //baru
                                                        data_rpjmd.visi[i].tahun_awal = visi.tahun_awal; //baru
                                                        data_rpjmd.visi[i].tahun_akhir = visi.tahun_akhir; //baru                                                                                                       
                                                    });
                                                    var data = {
                                                        message: {
                                                            type: "get-url",
                                                            content: {
                                                                url: config.url_server_lokal,
                                                                type: 'post',
                                                                data: data_rpjmd,
                                                                return: true
                                                            }
                                                        }
                                                    };
                                                    chrome.runtime.sendMessage(data, function (response) {
                                                        console.log('responeMessage', response);
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            })
        });
    }
}


function jadwal_rpjmd_aktif(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/jadwal/rpjm_jadwal/cekAktif',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(jadwal_rpjmd_aktif){
	      		return resolve(jadwal_rpjmd_aktif);
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