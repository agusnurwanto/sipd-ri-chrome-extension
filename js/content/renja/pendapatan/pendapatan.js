function singkron_pendapatan_lokal(){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var idunit = _token.unit;
		var apiKey = x_api_key();
        if (idunit >= 1)
		{
			relayAjax({
				url: config.sipd_url+'api/renja/pendapatan/list',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,									
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
                    pesan_loading('Get data Pendapatan SKPD');	
                    console.log(skpd.data.data);
                    var last = skpd.data.data.length-1;
                    skpd.data.data.reduce(function(sequence, nextData){
                        return sequence.then(function(current_data){
                            return new Promise(function(resolve_reduce, reject_reduce){
                                // resolve_reduce(nextData);
                                
                                    console.log('current_data.nama_skpd', current_data.nama_skpd);
                                    pesan_loading('Simpan data Pendapatan '+current_data.nama_skpd+' ke DB Lokal!');
                                    var idskpd = current_data.id_skpd;
                                    relayAjax({
                                        url: config.sipd_url+'api/renja/pendapatan/listByIdUnit',                                    
                                        type: 'POST',
                                        data: {            
                                            id_daerah: _token.daerah_id,				                                            
                                            tahun: _token.tahun,					
                                            id_unit: idskpd                                            
                                        },
                                        beforeSend: function (xhr) {			    
                                            xhr.setRequestHeader("X-API-KEY", apiKey);
                                            xhr.setRequestHeader("x-access-token", _token.token);
                                        },				          	
                                        success: function(data){
                                            var data_pendapatan = [];                                                                                        
                                            data.data.map(function(b, i){                                                
                                                const bulan = ["01","02","03","04","05","06","07","08","09","10","11","12"];                                                
                                                var todayDate = new Date().toLocaleDateString("es-CL");
                                                let todayTime = new Date().toLocaleString('id-ID', {hour: '2-digit', hour12: false, minute:'2-digit', second:'2-digit'});
                                                // const rekArray = b.rekening.split(" ");
                                                // let kode_akun = rekArray[0];
                                                // let nama_akun = rekArray[1];
                                                const cd = new Date(b.created_at);
                                                let ctgl = cd.getDate();
                                                let cbln = bulan[cd.getMonth()];
                                                let cthn = cd.getFullYear();
                                                let cjam = cd.getHours();
                                                let cmenit = cd.getMinutes();
                                                let cdetik = cd.getSeconds();
                                                const ud = new Date(b.updated_at);
                                                let utgl = ud.getDate();
                                                let ubln = bulan[ud.getMonth()];
                                                let uthn = ud.getFullYear();
                                                let ujam = ud.getHours();
                                                let umenit = ud.getMinutes();
                                                let udetik = ud.getSeconds();
                                                data_pendapatan[i] = {};
                                                data_pendapatan[i].createdtime = todayTime;
                                                data_pendapatan[i].createddate = todayDate;
                                                //   data_pendapatan[i].createddate = b.created_at;
                                                data_pendapatan[i].created_user = b.created_user;                                              
                                                data_pendapatan[i].id_akun = b.id_akun; //baru int
                                                data_pendapatan[i].id_jadwal_murni = b.id_jadwal_murni; //baru int
                                                data_pendapatan[i].id_pendapatan = b.id_pendapatan;
                                                data_pendapatan[i].is_locked = b.is_locked; //baru
                                                data_pendapatan[i].keterangan = b.keterangan;
                                                data_pendapatan[i].kode_akun = b.kode_akun;
                                                data_pendapatan[i].koefisien = b.koefisien; //baru var
                                                data_pendapatan[i].kua_murni = b.kua_murni; //baru var
                                                data_pendapatan[i].kua_pak = b.kua_pak; //baru var
                                                data_pendapatan[i].nama_akun = b.nama_akun;
                                                data_pendapatan[i].program_koordinator = b.program_koordinator;
                                                data_pendapatan[i].rkpd_murni = b.rkpd_murni; //baru int
                                                data_pendapatan[i].rkpd_pak = b.rkpd_pak; //baru int
                                                //   data_pendapatan[i].nilaimurni = b.nilaimurni; //?                                              
                                                data_pendapatan[i].rekening = b.rekening; //                                                
                                                data_pendapatan[i].satuan = b.satuan; //baru var
                                                data_pendapatan[i].skpd_koordinator = b.skpd_koordinator;
                                                data_pendapatan[i].total = b.total;
                                                data_pendapatan[i].updated_user = b.updated_user;
                                                data_pendapatan[i].updatedtime = todayTime;
                                                data_pendapatan[i].updateddate = todayDate;
                                                //   data_pendapatan[i].updateddate = b.updated_at;
                                                //   data_pendapatan[i].updatedtime = b.updatedtime;
                                                data_pendapatan[i].uraian = b.uraian;
                                                data_pendapatan[i].urusan_koordinator = b.urusan_koordinator;
                                                data_pendapatan[i].volume = b.volume; //baru int
                                                //   data_pendapatan[i].user1 = b.user1;
                                                //   data_pendapatan[i].user2 = b.user2;
                                            });
                                            var data = {
                                                message:{
                                                    type: "get-url",
                                                    content: {
                                                        url: config.url_server_lokal,
                                                        type: 'post',
                                                        data: { 
                                                            action: 'singkron_pendapatan',
                                                            type: 'ri',
                                                            tahun_anggaran: _token.tahun,
                                                            api_key: config.api_key,
                                                            data: data_pendapatan,
                                                            id_skpd: idskpd
                                                        },
                                                        return: false
                                                    }
                                                }
                                            };

                                            if(nomor == skpd.data.data.length-1){
                                                data.message.content.return = true;
                                            }                                          
                                            chrome.runtime.sendMessage(data, function(response) {
                                                console.log('responeMessage', response);
                                            });

                                            // dikasih jeda agar lebih aman di server
                                            setTimeout(function(){
                                                resolve_reduce(nextData);
                                            }, 1000);
                                        },
                                        error: function(e) {
                                            console.log(e);
                                            return resolve({});
                                        }
                                    })
                                
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
                    }, Promise.resolve(skpd.data.data[last]))
                    .then(function(data_last){
                        hide_loading();
                        alert('Sukses singkronisasi data Pendapatan!');
                    });
                }
            })
        }
        else
        {
            relayAjax({
				url: config.sipd_url+'api/renja/pendapatan/list',
				type: 'POST',
				data: {            
					id_daerah: _token.daerah_id,									
					tahun: _token.tahun,					
                    length: 100000,
				    start: 0,
				},
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", apiKey);
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				success: function(skpd){
                    pesan_loading('Get data Pendapatan SKPD');
                    console.log(skpd.data.data);
                    var last = skpd.data.data.length-1;
                    var nomor = 0;
                    skpd.data.data.reduce(function(sequence, nextData){
                        return sequence.then(function(current_data){
                            return new Promise(function(resolve_reduce, reject_reduce){
                                // resolve_reduce(nextData);
                                
                                    console.log('current_data.nama_skpd', current_data.nama_skpd);
                                    pesan_loading('Simpan data Pendapatan '+current_data.nama_skpd+' ke DB Lokal!');
                                    var idskpd = current_data.id_skpd;
                                    relayAjax({
                                        url: config.sipd_url+'api/renja/pendapatan/listByIdUnit',                                    
                                        type: 'POST',
                                        data: {            
                                            id_daerah: _token.daerah_id,				                                            
                                            tahun: _token.tahun,					
                                            id_unit: idskpd                                            
                                        },
                                        beforeSend: function (xhr) {			    
                                            xhr.setRequestHeader("X-API-KEY", apiKey);
                                            xhr.setRequestHeader("x-access-token", _token.token);
                                        },				          	
                                        success: function(data){
                                            var data_pendapatan = [];                                                                                        
                                            data.data.map(function(b, i){                                                
                                                const bulan = ["01","02","03","04","05","06","07","08","09","10","11","12"];                                                
                                                var todayDate = new Date().toLocaleDateString("es-CL");
                                                let todayTime = new Date().toLocaleString('id-ID', {hour: '2-digit', hour12: false, minute:'2-digit', second:'2-digit'});
                                                // const rekArray = b.rekening.split(" ");
                                                // let kode_akun = rekArray[0];
                                                // let nama_akun = rekArray[1];
                                                const cd = new Date(b.created_at);
                                                let ctgl = cd.getDate();
                                                let cbln = bulan[cd.getMonth()];
                                                let cthn = cd.getFullYear();
                                                let cjam = cd.getHours();
                                                let cmenit = cd.getMinutes();
                                                let cdetik = cd.getSeconds();
                                                const ud = new Date(b.updated_at);
                                                let utgl = ud.getDate();
                                                let ubln = bulan[ud.getMonth()];
                                                let uthn = ud.getFullYear();
                                                let ujam = ud.getHours();
                                                let umenit = ud.getMinutes();
                                                let udetik = ud.getSeconds();
                                                data_pendapatan[i] = {};
                                                data_pendapatan[i].createdtime = todayTime;
                                                data_pendapatan[i].createddate = todayDate;
                                                //   data_pendapatan[i].createddate = b.created_at;
                                                data_pendapatan[i].created_user = b.created_user;                                              
                                                data_pendapatan[i].id_akun = b.id_akun; //baru int
                                                data_pendapatan[i].id_jadwal_murni = b.id_jadwal_murni; //baru int
                                                data_pendapatan[i].id_pendapatan = b.id_pendapatan;
                                                data_pendapatan[i].is_locked = b.is_locked; //baru
                                                data_pendapatan[i].keterangan = b.keterangan;
                                                data_pendapatan[i].kode_akun = b.kode_akun;
                                                data_pendapatan[i].koefisien = b.koefisien; //baru var
                                                data_pendapatan[i].kua_murni = b.kua_murni; //baru var
                                                data_pendapatan[i].kua_pak = b.kua_pak; //baru var
                                                data_pendapatan[i].nama_akun = b.nama_akun;
                                                data_pendapatan[i].program_koordinator = b.program_koordinator;
                                                data_pendapatan[i].rkpd_murni = b.rkpd_murni; //baru int
                                                data_pendapatan[i].rkpd_pak = b.rkpd_pak; //baru int
                                                //   data_pendapatan[i].nilaimurni = b.nilaimurni; //?                                              
                                                data_pendapatan[i].rekening = b.rekening; //?                                                
                                                data_pendapatan[i].satuan = b.satuan; //baru var
                                                data_pendapatan[i].skpd_koordinator = b.skpd_koordinator;
                                                data_pendapatan[i].total = b.total;
                                                data_pendapatan[i].updated_user = b.updated_user;
                                                data_pendapatan[i].updatedtime = todayTime;
                                                data_pendapatan[i].updateddate = todayDate;
                                                //   data_pendapatan[i].updateddate = b.updated_at;
                                                //   data_pendapatan[i].updatedtime = b.updatedtime;
                                                data_pendapatan[i].uraian = b.uraian;
                                                data_pendapatan[i].urusan_koordinator = b.urusan_koordinator;
                                                data_pendapatan[i].volume = b.volume; //baru int
                                                //   data_pendapatan[i].user1 = b.user1;
                                                //   data_pendapatan[i].user2 = b.user2;
                                            });
                                            var data = {
                                                message:{
                                                    type: "get-url",
                                                    content: {
                                                        url: config.url_server_lokal,
                                                        type: 'post',
                                                        data: { 
                                                            action: 'singkron_pendapatan',
                                                            type: 'ri',
                                                            tahun_anggaran: _token.tahun,
                                                            api_key: config.api_key,
                                                            data: data_pendapatan,
                                                            id_skpd: idskpd
                                                        },
                                                        return: false
                                                    }
                                                }
                                            };

                                            if(nomor == skpd.data.data.length-1){
                                                data.message.content.return = true;
                                            }                                          
                                            chrome.runtime.sendMessage(data, function(response) {
                                                console.log('responeMessage', response);
                                            });

                                            // dikasih jeda agar lebih aman di server
                                            setTimeout(function(){
                                                resolve_reduce(nextData);
                                            }, 1000);
                                        },
                                        error: function(e) {
                                            console.log(e);
                                            return resolve({});
                                        }
                                    })
                                
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
                    }, Promise.resolve(skpd.data.data[last]))
                    .then(function(data_last){
                        hide_loading();
                        alert('Sukses singkronisasi data Pendapatan!');
                    });
                }
            })
        }

    }
}