function singkron_pembiayaan_lokal(tipe){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var idunit = _token.unit;
		var apiKey = x_api_key();
        if (idunit >= 1)
		{
			relayAjax({
				url: config.sipd_url+'api/renja/pembiayaan/list_unit',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,				
					tipe_pembiayaan: tipe,
					tahun: _token.tahun,
					model: 'skpd',
					id_unit: idunit,
                    length: 100000,
				    start: 0,
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", apiKey);
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				success: function(skpd){
                    pesan_loading('Get data Pembiayaan '+tipe+'  SKPD');	
                    console.log(skpd.data);
                    // var last = skpd.data.length-1;
                    // var nomor = 0;
                    var last = skpd.data.length-1;
                    var nomor = 0;
                    skpd.data.reduce(function(sequence, nextData){
                        return sequence.then(function(current_data){
                            return new Promise(function(resolve_reduce, reject_reduce){
                                if(current_data.nilai == 0){
                                    resolve_reduce(nextData);
                                }else{
                                    console.log('nama_skpd', current_data.nama_skpd);
                                    pesan_loading('Simpan data Pembiayaan '+tipe+'  '+current_data.nama_skpd+' ke DB Lokal!');
                                    var idskpd = current_data.id_skpd;
                                    relayAjax({
                                        url: config.sipd_url+'api/renja/pembiayaan/listByIdUnit',                                    
                                        type: 'POST',
                                        data: {            
                                            id_daerah: _token.daerah_id,				                                            
                                            tahun: _token.tahun,					
                                            id_unit: idskpd,
                                            tipe_pembiayaan: tipe,                                         
                                        },
                                        beforeSend: function (xhr) {			    
                                            xhr.setRequestHeader("X-API-KEY", apiKey);
                                            xhr.setRequestHeader("x-access-token", _token.token);
                                        },				          	
                                        success: function(data){
                                            console.log(data.length);
                                            if(!data.length){
                                                resolve_reduce(nextData);
                                            }
                                            else
                                            {
                                                var data_pembiayaan = [];                                            
                                                data.data.map(function(b, i){                                                
                                                    const bulan = ["01","02","03","04","05","06","07","08","09","10","11","12"];                                                
                                                    const cd = new Date(b.created_at);
                                                    var todayDate = new Date().toLocaleDateString("es-CL");
                                                    let todayTime = new Date().toLocaleString('id-ID', {hour: '2-digit', hour12: false, minute:'2-digit', second:'2-digit'});
                                                    let ctgl = cd.getDate();
                                                    let cbln = bulan[cd.getMonth()];
                                                    let cthn = cd.getFullYear();
                                                    let cjam = cd.getHours();
                                                    let cmenit = cd.getMinutes();
                                                    let cdetik = cd.getSeconds();
                                                    const rekArray = b.rekening.split(" ");
                                                    let kode_akun = rekArray[0];
                                                    let nama_akun = rekArray[1];
                                                    data_pembiayaan[i] = {};
                                                    data_pembiayaan[i].createdtime = todayTime;
                                                    data_pembiayaan[i].createddate = todayDate;
                                                    //   data_pembiayaan[i].createddate = b.created_at;
                                                    data_pembiayaan[i].created_user = b.created_user;                                              
                                                    data_pembiayaan[i].id_akun = b.id_akun; //baru int
                                                    data_pembiayaan[i].id_jadwal_murni = b.id_jadwal_murni; //baru int
                                                    data_pembiayaan[i].id_pembiayaan = b.id_pembiayaan;
                                                    data_pembiayaan[i].is_locked = b.is_locked; //baru
                                                    data_pembiayaan[i].keterangan = b.keterangan;
                                                    data_pembiayaan[i].kode_akun = kode_akun;
                                                    data_pembiayaan[i].koefisien = b.koefisien; //baru var
                                                    data_pembiayaan[i].kua_murni = b.kua_murni; //baru var
                                                    data_pembiayaan[i].kua_pak = b.kua_pak; //baru var
                                                    data_pembiayaan[i].nama_akun = nama_akun;
                                                    data_pembiayaan[i].program_koordinator = b.program_koordinator;
                                                    data_pembiayaan[i].rkpd_murni = b.rkpd_murni; //baru int
                                                    data_pembiayaan[i].rkpd_pak = b.rkpd_pak; //baru int
                                                    //   data_pembiayaan[i].nilaimurni = b.nilaimurni; //?                                              
                                                    //   data_pembiayaan[i].rekening = b.rekening; //?
                                                    data_pembiayaan[i].rekening = b.rekening;
                                                    data_pembiayaan[i].satuan = b.satuan; //baru var
                                                    data_pembiayaan[i].skpd_koordinator = b.skpd_koordinator;
                                                    data_pembiayaan[i].total = b.total;
                                                    data_pembiayaan[i].updated_user = b.updated_user;
                                                    data_pembiayaan[i].updatedtime = todayTime;
                                                    data_pembiayaan[i].updateddate = todayDate;
                                                    //   data_pembiayaan[i].updateddate = b.updated_at;
                                                    //   data_pembiayaan[i].updatedtime = b.updatedtime;
                                                    data_pembiayaan[i].uraian = b.uraian;
                                                    data_pembiayaan[i].urusan_koordinator = b.urusan_koordinator;
                                                    data_pembiayaan[i].volume = b.volume; //baru int
                                                    data_pembiayaan[i].type = tipe;
                                                    //   data_pembiayaan[i].user1 = b.user1;
                                                    //   data_pembiayaan[i].user2 = b.user2;
                                                });
                                                var data = {
                                                    message:{
                                                        type: "get-url",
                                                        content: {
                                                            url: config.url_server_lokal,
                                                            type: 'post',
                                                            data: { 
                                                                action: 'singkron_pembiayaan',
                                                                type: 'ri',
                                                                tahun_anggaran: _token.tahun,
                                                                api_key: config.api_key,
                                                                data: data_pembiayaan,
                                                                id_skpd: idskpd
                                                            },
                                                            return: false
                                                        }
                                                    }
                                                };                                          
                                                if(nomor == skpd.data.length-1){
                                                    data.message.content.return = true;
                                                }                                          
                                                chrome.runtime.sendMessage(data, function(response) {
                                                    console.log('responeMessage', response);
                                                });
    
                                                // dikasih jeda agar lebih aman di server
                                                setTimeout(function(){
                                                    resolve_reduce(nextData);
                                                }, 1000);
                                            }
                                        },
                                        error: function(e) {
                                            console.log(e);
                                            return resolve({});
                                        }
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
                    }, Promise.resolve(skpd.data[last]))
                    .then(function(data_last){
                        hide_loading();
                        alert('Sukses singkronisasi data Pembiayaan '+tipe+' !');
                    });
                }
            })
        }
        else
        {
            relayAjax({
				url: config.sipd_url+'api/renja/pembiayaan/list_unit',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,									
					tahun: _token.tahun,		
                    tipe_pembiayaan: tipe,			
                    length: 100000,
				    start: 0,
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", apiKey);
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				success: function(skpd){
                    pesan_loading('Get data Pembiayaan '+tipe+'  SKPD');
                    console.log(skpd.data);
                    // var last = skpd.data.length-1;
                    var last = skpd.data.length-1;
                    var nomor = 0;
                    skpd.data.reduce(function(sequence, nextData){
                        return sequence.then(function(current_data){
                            return new Promise(function(resolve_reduce, reject_reduce){
                                if(current_data.nilai == 0){
                                    resolve_reduce(nextData);
                                }else{
                                    console.log('nama_skpd', current_data.nama_skpd);
                                    pesan_loading('Simpan data Pembiayaan '+tipe+'  '+current_data.nama_skpd+' ke DB Lokal!');
                                    var idskpd = current_data.id_skpd;
                                    relayAjax({
                                        url: config.sipd_url+'api/renja/pembiayaan/listByIdUnit',                                    
                                        type: 'POST',
                                        data: {            
                                            id_daerah: _token.daerah_id,				                                            
                                            tahun: _token.tahun,					
                                            id_unit: idskpd,
                                            tipe_pembiayaan: tipe,                                          
                                        },
                                        beforeSend: function (xhr) {			    
                                            xhr.setRequestHeader("X-API-KEY", apiKey);
                                            xhr.setRequestHeader("x-access-token", _token.token);
                                        },				          	
                                        success: function(data){
                                            console.log('data', data);
                                            if(data.data.length > 0){
                                                var data_pembiayaan = [];                                                                                        
                                                data.data.map(function(b, i){                                                
                                                    const bulan = ["01","02","03","04","05","06","07","08","09","10","11","12"];                                                
                                                    const cd = new Date(b.created_at);
                                                    var todayDate = new Date().toLocaleDateString("es-CL");
                                                    let todayTime = new Date().toLocaleString('id-ID', {hour: '2-digit', hour12: false, minute:'2-digit', second:'2-digit'});
                                                    let ctgl = cd.getDate();
                                                    let cbln = bulan[cd.getMonth()];
                                                    let cthn = cd.getFullYear();
                                                    let cjam = cd.getHours();
                                                    let cmenit = cd.getMinutes();
                                                    let cdetik = cd.getSeconds();
                                                    const rekArray = b.rekening.split(" ");
                                                    let kode_akun = rekArray[0];
                                                    let nama_akun = rekArray[1];
                                                    data_pembiayaan[i] = {};
                                                    data_pembiayaan[i].createdtime = todayTime;
                                                    data_pembiayaan[i].createddate = todayDate;
                                                    //   data_pembiayaan[i].createddate = b.created_at;
                                                    data_pembiayaan[i].created_user = b.created_user;                                              
                                                    data_pembiayaan[i].id_akun = b.id_akun; //baru int
                                                    data_pembiayaan[i].id_jadwal_murni = b.id_jadwal_murni; //baru int
                                                    data_pembiayaan[i].id_pembiayaan = b.id_pembiayaan;
                                                    data_pembiayaan[i].is_locked = b.is_locked; //baru
                                                    data_pembiayaan[i].keterangan = b.keterangan;
                                                    data_pembiayaan[i].kode_akun = kode_akun;
                                                    data_pembiayaan[i].koefisien = b.koefisien; //baru var
                                                    data_pembiayaan[i].kua_murni = b.kua_murni; //baru var
                                                    data_pembiayaan[i].kua_pak = b.kua_pak; //baru var
                                                    data_pembiayaan[i].nama_akun = nama_akun;
                                                    data_pembiayaan[i].program_koordinator = b.program_koordinator;
                                                    data_pembiayaan[i].rkpd_murni = b.rkpd_murni; //baru int
                                                    data_pembiayaan[i].rkpd_pak = b.rkpd_pak; //baru int
                                                    //   data_pembiayaan[i].nilaimurni = b.nilaimurni; //?                                              
                                                    //   data_pembiayaan[i].rekening = b.rekening; //?
                                                    data_pembiayaan[i].rekening = b.rekening;
                                                    data_pembiayaan[i].satuan = b.satuan; //baru var
                                                    data_pembiayaan[i].skpd_koordinator = b.skpd_koordinator;
                                                    data_pembiayaan[i].total = b.total;
                                                    data_pembiayaan[i].updated_user = b.updated_user;
                                                    data_pembiayaan[i].updatedtime = todayTime;
                                                    data_pembiayaan[i].updateddate = todayDate;
                                                    //   data_pembiayaan[i].updateddate = b.updated_at;
                                                    //   data_pembiayaan[i].updatedtime = b.updatedtime;
                                                    data_pembiayaan[i].uraian = b.uraian;
                                                    data_pembiayaan[i].urusan_koordinator = b.urusan_koordinator;
                                                    data_pembiayaan[i].volume = b.volume; //baru int
                                                    data_pembiayaan[i].type = tipe;
                                                    //   data_pembiayaan[i].user1 = b.user1;
                                                    //   data_pembiayaan[i].user2 = b.user2;
                                                });
                                                var data = {
                                                    message:{
                                                        type: "get-url",
                                                        content: {
                                                            url: config.url_server_lokal,
                                                            type: 'post',
                                                            data: { 
                                                                action: 'singkron_pembiayaan',
                                                                type: 'ri',
                                                                tahun_anggaran: _token.tahun,
                                                                api_key: config.api_key,
                                                                data: data_pembiayaan,
                                                                id_skpd: idskpd
                                                            },
                                                            return: false
                                                        }
                                                    }
                                                };

                                                if(nomor == skpd.data.length-1){
                                                    data.message.content.return = true;
                                                }                                          
                                                chrome.runtime.sendMessage(data, function(response) {
                                                    console.log('responeMessage', response);
                                                });

                                                // dikasih jeda agar lebih aman di server
                                                setTimeout(function(){
                                                    resolve_reduce(nextData);
                                                }, 1000);
                                            }
                                        },
                                        error: function(e) {
                                            console.log(e);
                                            return resolve({});
                                        }
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
                    }, Promise.resolve(skpd.data[last]))
                    .then(function(data_last){
                        hide_loading();
                        alert('Sukses singkronisasi data Pembiayaan '+tipe+' !');
                    });
                }
            })
        }

    }
}
