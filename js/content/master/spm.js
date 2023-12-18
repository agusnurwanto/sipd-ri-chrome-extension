function singkron_label_spm(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var apiKey = x_api_key();
		relayAjax({
            url: config.sipd_url+'api/master/spm/list',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
                // deleted_data: true,
                // order[0][column]:0,
                // order[0][dir]: asc,
                // search[value]: null,
                length: 21307,
                start: 0,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(data){
				pesan_loading('Simpan data Master SPM ke DB Lokal!');                
				var data_label = { 
					action: 'singkron_label_spm',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					label : {}
				};
				var _length = 250;
				var data_all = [];
				var data_temp = [];
				data.data.data.map(function(label, i){
					var data_label_temp = {};
					data_label_temp.id_spm = label.id_spm;
                    data_label_temp.abjad_spm = label.abjad_spm;
					data_label_temp.spm_teks = label.spm_teks;
                    data_label_temp.kode_layanan = label.kode_layanan;
                    data_label_temp.layanan_teks = label.layanan_teks;
                    data_label_temp.dashuk_teks = label.dashuk_teks;
                    data_label_temp.set_prov = label.set_prov;
                    data_label_temp.set_kab_kota = label.set_kab_kota;
                    data_label_temp.is_locked = label.is_locked;                    
					data_temp.push(data_label_temp);
					if((i+1)%_length == 0){
						data_all.push(data_temp);
						data_temp = [];
					}
				});
				if(data_temp.length >= 1){
					data_all.push(data_temp);
				}
				data_all.map(function(b, i){
					data_label.label = b;
					var data = {
					    message:{
					        type: "get-url",
					        content: {
							    url: config.url_server_lokal,
							    type: 'post',
							    data: data_label,
				    			return: false
							}
					    }
					};
					if(i == data_all.length-1){
						data.message.content.return = true;
					}
					chrome.runtime.sendMessage(data, function(response) {
					    console.log('responeMessage', response);
					});
				});
			}
		});
	}
}

function singkron_subgiat_spm(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var apiKey = x_api_key();
		relayAjax({
            url: config.sipd_url+'api/master/spm_giat/list',
			type: 'GET',
			// data: {
			// 	tahun: _token.tahun,
			// 	id_daerah: _token.daerah_id,
            //     length: 21307,
            //     start: 0,
			// },
            processData: false,
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(data){
				pesan_loading('Simpan data Mapping SPM Sub Giat ke DB Lokal!');                
				var data_label = { 
					action: 'singkron_mapping_spm',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					label : {}
				};
				var _length = 250;
				var data_all = [];
				var data_temp = [];
				data.data.map(function(label, i){
					var data_label_temp = {};
					data_label_temp.id_spm_giat = label.id_spm_giat;
                    data_label_temp.id_spm = label.id_spm;
					data_label_temp.id_bidang_urusan = label.id_bidang_urusan;
                    data_label_temp.id_program = label.id_program;
                    data_label_temp.id_giat = label.id_giat;
                    data_label_temp.id_sub_giat = label.id_sub_giat;
                    data_label_temp.set_prov = label.set_prov;
                    data_label_temp.set_kab_kota = label.set_kab_kota;
                    data_label_temp.is_locked = label.is_locked; 
					data_temp.push(data_label_temp);
					if((i+1)%_length == 0){
						data_all.push(data_temp);
						data_temp = [];
					}
				});
				if(data_temp.length >= 1){
					data_all.push(data_temp);
				}
				data_all.map(function(b, i){
					data_label.label = b;
					var data = {
					    message:{
					        type: "get-url",
					        content: {
							    url: config.url_server_lokal,
							    type: 'post',
							    data: data_label,
				    			return: false
							}
					    }
					};
					if(i == data_all.length-1){
						data.message.content.return = true;
					}
					chrome.runtime.sendMessage(data, function(response) {
					    console.log('responeMessage', response);
					});
				});
			}
		});
	}
}

function singkron_label_miskin(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var apiKey = x_api_key();
		relayAjax({
            url: config.sipd_url+'api/master/sub_giat/list_table_miskin',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
                // deleted_data: true,
                // order[0][column]:0,
                // order[0][dir]: asc,
                // search[value]: null,
                length: 21307,
                start: 0,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(data){
				pesan_loading('Simpan data Label Kemiskinan Ekstrim ke DB Lokal!');                
				var data_label = { 
					action: 'singkron_label_kemiskinan',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					label : {}
				};
				var _length = 250;
				var data_all = [];
				var data_temp = [];
				data.data.data.map(function(label, i){
					var data_label_temp = {};					
					data_label_temp.id_urusan = label.id_urusan;
					data_label_temp.id_bidang_urusan = label.id_bidang_urusan;
                    data_label_temp.id_program = label.id_program;
                    data_label_temp.id_giat = label.id_giat;
                    data_label_temp.id_sub_giat = label.id_sub_giat;
                    data_label_temp.kelompok_teks = label.kelompok_teks;
                    data_label_temp.kode_sub_giat = label.kode_sub_giat;
                    data_label_temp.nama_sub_giat = label.nama_sub_giat; 
					data_label_temp.strategi_teks = label.strategi_teks; 
					data_temp.push(data_label_temp);
					if((i+1)%_length == 0){
						data_all.push(data_temp);
						data_temp = [];
					}
				});
				if(data_temp.length >= 1){
					data_all.push(data_temp);
				}
				data_all.map(function(b, i){
					data_label.label = b;
					var data = {
					    message:{
					        type: "get-url",
					        content: {
							    url: config.url_server_lokal,
							    type: 'post',
							    data: data_label,
				    			return: false
							}
					    }
					};
					if(i == data_all.length-1){
						data.message.content.return = true;
					}
					chrome.runtime.sendMessage(data, function(response) {
					    console.log('responeMessage', response);
					});
				});
			}
		});
	}
}

function singkron_subgiat_miskin(){
	if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
        var apiKey = x_api_key();
		relayAjax({
            url: config.sipd_url+'api/master/sub_giat/list_table_miskin',
			type: 'POST',
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
                // deleted_data: true,
                // order[0][column]:0,
                // order[0][dir]: asc,
                // search[value]: null,
                length: 21307,
                start: 0,
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", apiKey);
				xhr.setRequestHeader("x-access-token", _token.token);
			},
			success: function(data){
				pesan_loading('Simpan data Mapping Kemiskinan Ekstrim Sub Giat ke DB Lokal!');                
				var data_label = { 
					action: 'singkron_mapping_kemiskinan',
					type: 'ri',
					tahun_anggaran: _token.tahun,
					api_key: config.api_key,
					label : {}
				};
				var _length = 250;
				var data_all = [];
				var data_temp = [];
				data.data.data.map(function(label, i){
					var data_label_temp = {};					
					data_label_temp.id_urusan = label.id_urusan;
					data_label_temp.id_bidang_urusan = label.id_bidang_urusan;
                    data_label_temp.id_program = label.id_program;
                    data_label_temp.id_giat = label.id_giat;
                    data_label_temp.id_sub_giat = label.id_sub_giat;
                    data_label_temp.kelompok_teks = label.kelompok_teks;
                    data_label_temp.kode_sub_giat = label.kode_sub_giat;
                    data_label_temp.nama_sub_giat = label.nama_sub_giat; 
					data_label_temp.strategi_teks = label.strategi_teks; 
					data_temp.push(data_label_temp);
					if((i+1)%_length == 0){
						data_all.push(data_temp);
						data_temp = [];
					}
				});
				if(data_temp.length >= 1){
					data_all.push(data_temp);
				}
				data_all.map(function(b, i){
					data_label.label = b;
					var data = {
					    message:{
					        type: "get-url",
					        content: {
							    url: config.url_server_lokal,
							    type: 'post',
							    data: data_label,
				    			return: false
							}
					    }
					};
					if(i == data_all.length-1){
						data.message.content.return = true;
					}
					chrome.runtime.sendMessage(data, function(response) {
					    console.log('responeMessage', response);
					});
				});
			}
		});
	}
}