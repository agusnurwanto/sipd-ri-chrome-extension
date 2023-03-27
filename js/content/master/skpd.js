function singkron_skpd_ke_lokal(tampil_renja){
	if(tampil_renja && typeof data_unit != 'undefined'){
		jQuery('#table_skpd tbody tr').map(function(i, b){
			var td = jQuery(b).find('td');
			var id_skpd = td.find('ul.dropdown-menu li').eq(0).find('a').attr('onclick').split("'")[1];
			id_skpd = id_skpd.split("'")[0];
			if(td.eq(1).find('a').length == 0){
				td.eq(1).append(' <a class="btn btn-sm btn-info" target="_blank" href="'+data_unit[id_skpd]+'?key='+get_key()+'&rkpd=1">Print RENJA</a>');
			}
		});
		return;
	}
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var apiKey = x_api_key();	
		relayAjax({
			url: config.sipd_url+'api/master/skpd/listNew',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,				
                deleted_data: true,
                // order[0][column]: 0,
                // order[0][dir]: asc,
                // search[value]: '',
                length: 200,
                start: 0,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(unit){
				pesan_loading('Simpan data Master Profil SKPD ke DB Lokal!');
				var sendData = unit.data.data.map(function(b, i){
					return new Promise(function(resolve, reject){
                        var idsetupunit;
                        if (b.setup_unit == 1) {
                            idsetupunit = b.id_skpd;
                        }else {
                            idsetupunit = 0;
                        }
						var idskpd = b.id_skpd;
                        var tahun = b.tahun;
                        var iddaerah = b.id_daerah;							
                        var kode_opd2 = b.kode_skpd.split(".");
                        get_detil_skpd({
                        	idskpd: idskpd,
                        	tahun: tahun,
                        	iddaerah: iddaerah
                        })
	                	.then(function(data){
			          		var data_unit = {
								id_skpd : b.id_skpd,                            
								is_skpd : b.is_skpd,
								kode_skpd : b.kode_skpd,
								mapping : b.mapping, //baru
								kunci_skpd : b.kunci_skpd,
								nama_skpd : b.nama_skpd,
								posisi : b.posisi,
								setupunit : b.setup_unit,
								status : b.status,
                                // id_setup_unit : data.data[0].id_unit,
                                id_setup_unit : idsetupunit,
                                bidur_1 : data.data[0].id_bidang_urusan_1,
                                bidur_2 : data.data[0].id_bidang_urusan_2,
                                bidur_3 : data.data[0].id_bidang_urusan_3,
                                id_kecamatan : data.data[0].id_kecamatan, //baru
                                id_strategi : data.data[0].id_strategi, //baru
                                id_unit : data.data[0].id_unit,
                                is_dpa_khusus : data.data[0].is_dpa_khusus, //baru
                                ispendapatan : data.data[0].is_pendapatan,    
                                is_ppkd : data.data[0].is_ppkd,  //baru  
                                isskpd : data.data[0].is_skpd,
                                kode_skpd_1 : kode_opd2[6],
                                kode_skpd_2 : kode_opd2[7],
                                kodeunit : data.data[0].kode_unit,
                                komisi : data.data[0].komisi,
                                namabendahara : data.data[0].nama_bendahara,
                                namakepala : data.data[0].nama_kepala,
                                namaunit : data.data[0].nama_skpd,
                                nipbendahara : data.data[0].nip_bendahara,
                                nipkepala : data.data[0].nip_kepala,
                                pangkatkepala : data.data[0].pangkat_kepala,                            
                                set_input : data.data[0].set_input, //baru
                                statuskepala : data.data[0].status_kepala,
                                idinduk : data.data[0].id_skpd,	
			          		};
							return resolve(data_unit);
				        });
	                })
	                .catch(function(e){
	                    console.log(e);
	                    return Promise.resolve({});
	                });
				});

	            Promise.all(sendData)
	        	.then(function(all_unit){
	        		var opsi = { 
						action: 'singkron_unit',
						type: 'ri',
						tahun_anggaran: _token.tahun,
                        api_key: config.api_key,
						data_unit : all_unit						
					};
					var data = {
					    message:{
					        type: "get-url",
					        content: {
							    url: config.url_server_lokal,
							    type: 'post',
							    data: opsi,
				    			return: true
							}
					    }
					};
					chrome.runtime.sendMessage(data, function(response) {
					    console.log('responeMessage', response);
					});
	            })
	            .catch(function(err){
	                console.log('err', err);
	        		alert('Ada kesalahan sistem!');
	        		hide_loading();
	            });
			}
		});
	}
}

function get_detil_skpd(opsi){
	return new Promise(function(resolve, reject){
		relayAjax({
			url: config.sipd_url+'api/master/skpd/view/'+opsi.idskpd+'/'+opsi.tahun+'/'+opsi.iddaerah,
			type: 'GET',
			processData : false,
			contentType : false,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
          	success: function(data){
          		resolve(data);
          	}
        });
	})
}