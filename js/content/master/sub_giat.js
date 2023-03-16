function singkron_data_giat_lokal() {
    if (confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')) {
        show_loading();
        var apiKey = x_api_key();
        relayAjax({
            url: config.sipd_url+'api/master/sub_giat/list',
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
                xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
            success: function (ret) {
                var data_prog_keg = {
                    action: 'singkron_data_giat',
                    type: 'ri',
					tahun_anggaran: _token.tahun,
                    api_key: config.api_key,
                    subgiat: {}
                };

                var data_all = [];
		        var data_sementara = [];
		        var max = 50;
		        ret.data.data.map(function(b, i){
		            data_sementara.push(b);
		            if(data_sementara.length%max == 0){
		                data_all.push(data_sementara);
		                data_sementara = [];
		            }
		        });
		        if(data_sementara.length > 0){
		            data_all.push(data_sementara);
		        }
		        var last = data_all.length - 1;
		        var nomor = 0;
				data_all.reduce(function(sequence, nextData){
					return sequence.then(function(subgiat_all){
						return new Promise(function(resolve_reduce, reject_reduce){
							var all_promise = subgiat_all.map(function(subgiat, i){
								return new Promise(function(resolve, reject){
									var idurusan = subgiat.id_urusan;
									var idbidangurusan = subgiat.id_bidang_urusan;
									var idprogram = subgiat.id_program;	
									var idgiat = subgiat.id_giat;	
									var idsubgiat = subgiat.id_sub_giat;	
									var tahun = subgiat.tahun;

									data_prog_keg.subgiat[i] = {};
									data_prog_keg.subgiat[i].aceh = subgiat.aceh //baru
									data_prog_keg.subgiat[i].bali = subgiat.bali //baru
									data_prog_keg.subgiat[i].papua = subgiat.papua //baru
									data_prog_keg.subgiat[i].papua_barat = subgiat.papua_barat //baru
									data_prog_keg.subgiat[i].yogyakarta = subgiat.yogyakarta //baru
									data_prog_keg.subgiat[i].jakarta = subgiat.jakarta //baru
									data_prog_keg.subgiat[i].id_bidang_urusan = subgiat.id_bidang_urusan;
									data_prog_keg.subgiat[i].id_daerah = subgiat.id_daerah; //baru
									data_prog_keg.subgiat[i].id_daerah_khusus = subgiat.id_daerah_khusus; //baru
									data_prog_keg.subgiat[i].id_program = subgiat.id_program;
									data_prog_keg.subgiat[i].id_giat = subgiat.id_giat;
									data_prog_keg.subgiat[i].id_sub_giat = subgiat.id_sub_giat
									data_prog_keg.subgiat[i].id_urusan = subgiat.id_urusan
									data_prog_keg.subgiat[i].indikator = subgiat.indikator //baru
									data_prog_keg.subgiat[i].satuan = subgiat.satuan //baru
									data_prog_keg.subgiat[i].is_locked = subgiat.is_locked
									data_prog_keg.subgiat[i].is_setda = subgiat.is_setda //baru
									data_prog_keg.subgiat[i].is_setwan = subgiat.is_setwan //baru
									data_prog_keg.subgiat[i].kode_sub_giat = subgiat.kode_sub_giat
									data_prog_keg.subgiat[i].kunci_tahun = subgiat.kunci_tahun //baru
									data_prog_keg.subgiat[i].mulai_tahun = subgiat.mulai_tahun //baru
									data_prog_keg.subgiat[i].nama_sub_giat = subgiat.nama_sub_giat
									data_prog_keg.subgiat[i].set_kab_kota = subgiat.set_kab_kota //baru
									data_prog_keg.subgiat[i].set_prov = subgiat.set_prov //baru 
									data_prog_keg.subgiat[i].status = subgiat.status 
									get_giat(idgiat, tahun).then(function(g){
										data_prog_keg.subgiat[i].kode_giat = g.data[0].kode_giat
										data_prog_keg.subgiat[i].nama_giat = g.data[0].nama_giat
										get_program(idprogram, tahun).then(function(p){
											data_prog_keg.subgiat[i].kode_program = p.data[0].kode_program 
											data_prog_keg.subgiat[i].nama_program = p.data[0].nama_program
											get_bidang_urusan(idbidangurusan, tahun).then(function(bidur){
												data_prog_keg.subgiat[i].kode_bidang_urusan = bidur.data[0].kode_bidang_urusan
												data_prog_keg.subgiat[i].nama_bidang_urusan = bidur.data[0].nama_bidang_urusan
												get_urusan(idurusan, tahun).then(function(u){
													data_prog_keg.subgiat[i].kode_urusan = u.data[0].kode_urusan
													data_prog_keg.subgiat[i].nama_urusan = u.data[0].nama_urusan
													resolve();
												});                               
											})
										})
									});
								});
							});

							Promise.all(all_promise)
							.then(function(){
								nomor++;
								pesan_loading('Simpan ke '+nomor+' data Master Urusan, Bidang Urusan, Program, Kegiatan, Sub Kegiatan ke DB Lokal!');
								var data = {
									message: {
										type: "get-url",
										content: {
											url: config.url_server_lokal,
											type: 'post',
											data: data_prog_keg,
											return: false
										}
									}
								};
								chrome.runtime.sendMessage(data, function (response) {
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
				}, Promise.resolve(data_all[last]))
					.then(function(data_last){
						hide_loading();
						alert('Berhasil singkron data Master Urusan, Bidang Urusan, Program, Kegiatan, Sub Kegiatan !');
					})
					.catch(function(e){
						console.log(e);
					});      								
			}
		});
	}
}

function get_urusan(idurusan, tahun){
    return new Promise(function(resolve, reject){
    	if(typeof get_urusan_global == 'undefined'){
    		get_urusan_global = {};
    	}
    	var key = idurusan+'-'+tahun;
    	if(!get_urusan_global[key]){
			relayAjax({	      	
				url: config.sipd_url+'api/master/urusan/view/'+idurusan+'/'+tahun,
				type: 'GET',	      				
				processData : false,
				contentType : false,
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
		      	success: function(data){
		      		get_urusan_global[key] = data;
		      		return resolve(data);
		      	}
		    });
    	}else{
    		return resolve(get_urusan_global[key]);
    	}
    });
}

function get_bidang_urusan(idbidangurusan, tahun){
    return new Promise(function(resolve, reject){
    	if(typeof get_bidang_urusan_global == 'undefined'){
    		get_bidang_urusan_global = {};
    	}
    	var key = idbidangurusan+'-'+tahun;
    	if(!get_bidang_urusan_global[key]){
			relayAjax({	      	
				url: config.sipd_url+'api/master/bidang_urusan/view/'+idbidangurusan+'/'+tahun,
				type: 'GET',	      				
				processData : false,
				contentType : false,
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
		      	success: function(data){
		      		get_bidang_urusan_global[key] = data;
		      		return resolve(data);
		      	}
		    });
    	}else{
    		return resolve(get_bidang_urusan_global[key]);
    	}
    });
}

function get_program(idprogram, tahun){
    return new Promise(function(resolve, reject){
    	if(typeof get_program_global == 'undefined'){
    		get_program_global = {};
    	}
    	var key = idprogram+'-'+tahun;
    	if(!get_program_global[key]){
			relayAjax({	      	
				url: config.sipd_url+'api/master/program/view/'+idprogram+'/'+tahun,
				type: 'GET',	      				
				processData : false,
				contentType : false,
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
		      	success: function(data){
		      		get_program_global[key]
		      		return resolve(data);
		      	}
		    });
    	}else{
    		return resolve(get_program_global[key]);
    	}
    });
}

function get_giat(idgiat, tahun){
    return new Promise(function(resolve, reject){
    	if(typeof get_kegiatan_global == 'undefined'){
    		get_kegiatan_global = {};
    	}
    	var key = idgiat+'-'+tahun;
    	if(!get_kegiatan_global[key]){
			relayAjax({	      	
				url: config.sipd_url+'api/master/giat/view/'+idgiat+'/'+tahun,
				type: 'GET',	      				
				processData : false,
				contentType : false,
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
		      	success: function(data){
		      		get_kegiatan_global[key] = data;
		      		return resolve(data);
		      	}
		    });
    	}else{
    		return resolve(get_kegiatan_global[key]);
    	}
    });
}

function get_sub_giat(idsubgiat, tahun){
    return new Promise(function(resolve, reject){
    	if(typeof get_sub_kegiatan_global == 'undefined'){
    		get_sub_kegiatan_global = {};
    	}
    	var key = idsubgiat+'-'+tahun;
    	if(!get_sub_kegiatan_global[key]){
			relayAjax({	      	
				url: config.sipd_url+'api/master/sub_giat/view/'+idsubgiat+'/'+tahun,
				type: 'GET',	      				
				processData: false,
				contentType : 'application/json',
				beforeSend: function (xhr) {			    
					xhr.setRequestHeader("X-API-KEY", x_api_key());
					xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
				},	
		      	success: function(data){
		      		get_sub_kegiatan_global[key] = data;
		      		return resolve(data);
		      	}
		    });
    	}else{
    		return resolve(get_sub_kegiatan_global[key]);
    	}
    });
}