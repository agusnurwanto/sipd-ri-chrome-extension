var import_excel = ''
	+'<button style="margin-left: 20px;" class="fcbtn btn btn-sm btn-success btn-outline" id="import_excel">'
		+'<i class="menu-upload m-r-5"></i> <span>Import Excel</span>'
	+'</button>';
jQuery('.aksi-extension').append(import_excel);

var modal = ''
	+'<div class="modal fade rka_inject modal-extension" id="mod-import-excel" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
        +'<div class="modal-dialog modal-lg" role="document">'
            +'<div class="modal-content">'
                +'<div class="modal-header bgpanel-theme">'
                    +'<h3 class="modal-title" id="">Upload Data Excel</h3>'
					+'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
                +'</div>'
                +'<div class="modal-body">'
                  	+'<form>'
                      	+'<div class="form-group">'
                      		+'<label class="control-label">Jenis Data Excel</label>'
                            +'<select name="jenis_data" id="jenis_data" class="form-control">'
								+'<option value="">Pilih</option>'
								+'<option value="BTL-GAJI">Belanja Gaji dan Tunjangan ASN</option>'
								+'<option value="BARJAS-MODAL">Belanja Barang Jasa dan Modal</option>'
								+'<option value="BUNGA">Belanja Bunga</option>'
								+'<option value="SUBSIDI">Belanja Subsidi</option>'
								+'<option value="HIBAH-BRG">Belanja Hibah (Barang/Jasa)</option>'
								+'<option value="HIBAH">Belanja Hibah (Uang)</option>'
								+'<option value="BANSOS-BRG">Belanja Bantuan Sosial (Barang/Jasa)</option>'
								+'<option value="BANSOS">Belanja Bantuan Sosial (Uang)</option>'
								+'<option value="BAGI-HASIL">Belanja Bagi Hasil</option>'
								+'<option value="BANKEU">Belanja Bantuan Keuangan Umum</option>'
								+'<option value="BANKEU-KHUSUS">Belanja Bantuan Keuangan Khusus</option>'
								+'<option value="BTT">Belanja Tidak Terduga (BTT)</option>'
								+'<option value="BOS">Dana BOS (BOS Pusat)</option>'
								+'<option value="BLUD">Belanja Operasional (BLUD)</option>'
								+'<option value="TANAH">Pembebasan Tanah/ Lahan</option>'
							+'</select>'
            				+'<input type="hidden" id="id_sub_skpd_excel" value"">'
            				+'<input type="hidden" id="id_sub_bl_excel" value"">'
                      	+'</div>'
                      	+'<div class="form-group">'
                      		+'<label class="control-label">Contoh format excel <a id="label-excel" href="" target="_blank"></a> atau DOWNLOAD Excel dari Rincian belanja</label>'
                      		+'<input type="file" id="file_input" />'
                      	+'</div>'
                      	+'<div class="form-group">'
                      		+'<label class="control-label">Data JSON</label>'
							+'<textarea class="form-control" id="file_output" style="height: 150px;"></textarea>'
                      	+'</div>'
	                    +'<div class="form-group group-dana-desa excel-opsional" style="display:none;">'
	                        +'<label class="control-label">Rekening / Akun</label>'
	                        +'<select class="form-control" id="rek-excel"></select>'
	                    +'</div>'
	                    +'<div class="form-group group-dana-desa excel-opsional" style="display:none;">'
	                        +'<label class="control-label">Pengelompokan Belanja / Paket Pekerjaan</label>'
	                        +'<select class="form-control" id="paket-excel"></select>'
	                    +'</div>'
	                    +'<div class="form-group group-dana-desa excel-opsional" style="display:none;">'
	                        +'<label class="control-label">Sumber Dana</label>'
	                        +'<select class="form-control" id="sumber_dana-excel"></select>'
	                    +'</div>'
	                    +'<div class="form-group group-dana-desa excel-opsional" style="display:none;">'
	                        +'<label class="control-label">Keterangan</label>'
	                        +'<label style="margin-left: 30px;"><input type="checkbox" id="keterangan-otomatis"> (Otomatis dari Excel)</label>'
			               	+'<select class="form-control" id="keterangan-excel"></select>'
			            +'</div>'
	                    +'<div class="form-group group-dana-desa excel-opsional" style="display:none;">'
	                        +'<label class="control-label">Koefisien (Perkalian)</label>'
	                        +'<div class="col-xs-12">'
	                        	+'<div class="row">'
	                        		+'<div class="col-xs-6" style="width: 40%;">'
			               				+'<input class="form-control" type="number" placeholder="Volume" id="volum-excel">'
			            			+'</div>'
	                        		+'<div class="col-xs-6" style="width: 40%;">'
			               				+'<select class="form-control" id="satuan-excel"></select>'
			            			+'</div>'
			            		+'</div>'
			            	+'</div>'
			            +'</div>'
                  	+'</form>'
                +'</div>'
                +'<div class="modal-footer">'
                    +'<button type="button" class="btn btn-sm btn-success" id="simpan-excel">Simpan</button>'
                    +'<button type="button" class="btn btn-sm btn-default" data-dismiss="modal">Tutup</button>'
                +'</div>'
            +'</div>'
        +'</div>'
    +'</div>';
jQuery('body').append(modal);

jQuery('#import_excel').on('click', function(){
	jQuery('#jenis_data').val('').trigger('change');
	jQuery('#file_output').val('');
	jQuery('#sumber_dana-excel').val('').trigger('change');
	jQuery('#rek-excel').val('').trigger('change');
	jQuery('#paket-excel').val('').trigger('change');
	jQuery('#volum-excel').val('').trigger('change');
	jQuery('#satuan-excel').val('').trigger('change');
	jQuery('#id_sub_skpd_excel').val('');
	jQuery('#id_sub_bl_excel').val('');
	jQuery('#mod-import-excel').modal('show');
});

jQuery('#jenis_data').on('change', function(){
	var jenis = jQuery(this).val();
	jQuery('.excel-opsional').hide();
	jQuery('.excel-opsional select').html('');
	jQuery('#label-excel').attr('href', '#');
	jQuery('#label-excel').text('');
	if(jenis == ''){
		return;
	}
    var cek = false;
    if(
        jenis == 'BANKEU'
        || jenis == 'BAGI-HASIL'
    ){
        jQuery('#label-excel').attr('href', ext_url+'excel/BANKEU.xlsx');
        jQuery('.group-dana-desa').show();
        cek = true;
    }else if(
        jenis == 'BOS'
        || jenis == 'HIBAH-BRG'
        || jenis == 'HIBAH'
        || jenis == 'BANSOS-BRG'
        || jenis == 'BANSOS'
        || jenis == 'BOP-PUSAT-PAUD'
    ){
        jQuery('#label-excel').attr('href', ext_url+'excel/BOS-HIBAH.xlsx');
        jQuery('.group-dana-desa').show();
        cek = true;
    }
    if(cek){
		jQuery('#label-excel').text('DOWNLOAD DI SINI');
    	var id_sub_keg = location.href.split('/').pop();
    	jQuery('#id_sub_bl_excel').val(id_sub_keg);

    	// get detail sub kegiatan
    	sub_bl_view(id_sub_keg)
    	.then(function(detail_sub){
    		jQuery('#id_sub_skpd_excel').val(detail_sub.id_sub_skpd);

	    	// get master keterangan
	    	if(typeof global_ket_rka == 'undefined'){
	    		global_ket_rka = {};
	    	}
	    	if(!global_ket_rka[id_sub_keg]){
	    		show_loading();
			  	relayAjaxApiKey({
					url: config.sipd_url+'api/renja/ket_sub_bl/find',
					type: 'post',
					data: formData({
						length: 10000,
						tahun: _token.tahun,
						id_daerah: _token.daerah_id,
						id_unit: detail_sub.id_sub_skpd,
						id_sub_giat: detail_sub.id_sub_giat,
						kondisi_rincian: true
					}),
					success: function(ret){
						global_ket_rka[id_sub_keg] = ret.data;
						var html = '<option value="">Pilih Keterangan</option>';
						global_ket_rka[id_sub_keg].map(function(b, i){
							html += '<option value="'+b.id_ket_sub_bl+'">'+b.ket_bl_teks+'</option>';
						});
						jQuery('#keterangan-excel').html(html);
				    	jQuery('#keterangan-excel').select2({
				    		dropdownParent: jQuery('#mod-import-excel .modal-content')
				    	});
				    	hide_loading();
					}
				});
	    	}else{
				var html = '';
				global_ket_rka[id_sub_keg].map(function(b, i){
					html += '<option value="'+b.id_ket_sub_bl+'">'+b.ket_bl_teks+'</option>';
				});
				jQuery('#keterangan-excel').html(html);
		    	jQuery('#keterangan-excel').select2({
		    		dropdownParent: jQuery('#mod-import-excel .modal-content')
		    	});
	    	}
    	})

    	// get master kelompok
    	jQuery('#paket-excel').html(jQuery('select[name="subtitle"]').html());
    	if(typeof global_paket_rka == 'undefined'){
    		global_paket_rka = {};
    	}
    	if(!global_paket_rka[id_sub_keg]){
    		show_loading();
		  	relayAjaxApiKey({
				url: config.sipd_url+'api/renja/subs_sub_bl/find_by_id_sub_bl',
				type: 'post',
				data: formData({
					tahun: _token.tahun,
					id_daerah: _token.daerah_id,
					id_unit: _token.unit_id,
					id_sub_bl: id_sub_keg,
					is_paket: 2
				}),
				success: function(ret){
					global_paket_rka[id_sub_keg] = ret.data;
					var html = '<option value="">Pilih Kelompok</option>';
					global_paket_rka[id_sub_keg].map(function(b, i){
						html += '<option value="'+b.id_subs_sub_bl+'">'+b.subs_bl_teks+'</option>';
					});
					jQuery('#paket-excel').html(html);
			    	jQuery('#paket-excel').select2({
			    		dropdownParent: jQuery('#mod-import-excel .modal-content')
			    	});
			    	hide_loading();
				}
			});
    	}else{
			var html = '';
			global_paket_rka[id_sub_keg].map(function(b, i){
				html += '<option value="'+b.id_subs_sub_bl+'">'+b.subs_bl_teks+'</option>';
			});
			jQuery('#paket-excel').html(html);
	    	jQuery('#paket-excel').select2({
	    		dropdownParent: jQuery('#mod-import-excel .modal-content')
	    	});
    	}

    	// get master sumber dana sub kegiatan
    	jQuery('#sumber_dana-excel').html(jQuery('select[name="subtitle"]').html());
    	if(typeof global_sd_rka == 'undefined'){
    		global_sd_rka = {};
    	}
    	if(!global_sd_rka[id_sub_keg]){
    		show_loading();
		  	relayAjaxApiKey({
				url: config.sipd_url+'api/renja/dana_sub_bl/get_by_id_sub_bl',
				type: 'post',
				data: formData({
					tahun: _token.tahun,
					id_daerah: _token.daerah_id,
					id_sub_bl: id_sub_keg
				}),
				success: function(ret){
					global_sd_rka[id_sub_keg] = ret.data;
					var html = '<option value="">Pilih Sumber Dana</option>';
					global_sd_rka[id_sub_keg].map(function(b, i){
						if(b.is_locked == 0){
							html += '<option value="'+b.id_dana+'">'+b.nama_dana+'</option>';
						}
					});
					jQuery('#sumber_dana-excel').html(html);
			    	jQuery('#sumber_dana-excel').select2({
			    		dropdownParent: jQuery('#mod-import-excel .modal-content')
			    	});
			    	hide_loading();
				}
			});
    	}else{
			var html = '';
			global_sd_rka[id_sub_keg].map(function(b, i){
				if(b.is_locked == 0){
					html += '<option value="'+b.id_dana+'">'+b.nama_dana+'</option>';
				}
			});
			jQuery('#sumber_dana-excel').html(html);
	    	jQuery('#sumber_dana-excel').select2({
	    		dropdownParent: jQuery('#mod-import-excel .modal-content')
	    	});
    	}

    	// get master rekening
    	jQuery('#rek-excel').select2({
    		dropdownParent: jQuery('#mod-import-excel .modal-content'),
    		width: '100%',
	  		ajax: {
			    url: config.sipd_url+'api/master/akun/find_akun_for_komponen',
			    type: 'post',
			    dataType: 'json',
				    data: function (params) {
				      	var opsi = {
							id_daerah: _token.daerah_id,
							tahun: _token.tahun,
							'search[value]': params.term,
							length: 20,
							is_gaji_asn: 0,
							is_barjas: 0,
							is_bunga: 0,
							is_subsidi: 0,
							is_bagi_hasil: 0,
							is_bankeu_umum: 0,
							is_bankeu_khusus: 0,
							is_btt: 0,
							is_hibah_brg: 0,
							is_hibah_uang: 0,
							is_sosial_brg: 0,
							is_sosial_uang: 0,
							is_bos: 0,
							is_modal_tanah: 0,
							set_lokus: ''
						};
						if(jenis == 'BTL-GAJI'){
							opsi.is_gaji_asn = 1;
						}else if(jenis == 'BARJAS-MODAL'){
							opsi.is_barjas = 1;
						}else if(jenis == 'BUNGA'){
							opsi.is_bunga = 1;
						}else if(jenis == 'SUBSIDI'){
							opsi.is_subsidi = 1;
						}else if(jenis == 'HIBAH-BRG'){
							opsi.is_hibah_brg = 1;
						}else if(jenis == 'HIBAH'){
							opsi.is_hibah_uang = 1;
						}else if(jenis == 'BANSOS-BRG'){
							opsi.is_sosial_brg = 1;
						}else if(jenis == 'BANSOS'){
							opsi.is_sosial_uang = 1;
						}else if(jenis == 'BAGI-HASIL'){
							opsi.is_bagi_hasil = 1;
						}else if(jenis == 'BANKEU'){
							opsi.is_bankeu_umum = 1;
						}else if(jenis == 'BANKEU-KHUSUS'){
							opsi.is_bankeu_khusus = 1;
						}else if(jenis == 'BTT'){
							opsi.is_btt = 1;
						}else if(jenis == 'BOS'){
							opsi.is_bos = 1;
						}else if(jenis == 'BLUD'){
							opsi.set_lokus = 'blud';
						}else if(jenis == 'TANAH'){
							opsi.is_modal_tanah = 1;
					}
			      	return opsi;
			  	},
			  	processResults: function (ret) {
			  		var newData = [];
			  		ret.data.map(function(b, i){
			  			newData.push({
			  				id: b.id_akun,
			  				text: b.kode_akun+' '+b.nama_akun
			  			});
					});
			  		console.log(newData, ret);
			  		return {
				        results: newData
			      	};
			  	},
			  	beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				}
			}
	  	});

    	// get master satuan
    	if(typeof global_satuan_rka == 'undefined'){
    		show_loading();
		  	relayAjaxApiKey({
				url: config.sipd_url+'api/master/satuan/list',
				type: 'post',
				data: formData({length: 10000}),
				success: function(ret){
					global_satuan_rka = ret.data.data;
					var html = '';
					global_satuan_rka.map(function(b, i){
						if(b.is_locked == 0){
							html += '<option value="'+b.id_satuan+'">'+b.nama_satuan+'</option>';
						}
					});
					jQuery('#satuan-excel').html(html);
			    	jQuery('#satuan-excel').select2({
			    		dropdownParent: jQuery('#mod-import-excel .modal-content')
			    	});
			    	hide_loading();
				}
			});
    	}else{
			var html = '';
			global_satuan_rka.map(function(b, i){
				if(b.is_locked == 0){
					html += '<option value="'+b.id_satuan+'">'+b.nama_satuan+'</option>';
				}
			});
			jQuery('#satuan-excel').html(html);
	    	jQuery('#satuan-excel').select2({
	    		dropdownParent: jQuery('#mod-import-excel .modal-content')
	    	});
    	}
    }else{
        var text_jenis = jQuery(this).find('option:selected').text();
        alert('Maaf jenis belanja "'+text_jenis+'" belum bisa diimport. Harap pilih jenis belanja yang lainnya!');
    }
});

var oFileIn;
jQuery(function() {
    oFileIn = document.getElementById('file_input');
    if(oFileIn.addEventListener) {
        oFileIn.addEventListener('change', filePicked, false);
    }
});

function filePicked(oEvent) {
    // Get The File From The Input
    var oFile = oEvent.target.files[0];
    var sFilename = oFile.name;
    // Create A File Reader HTML5
    var reader = new FileReader();

    reader.onload = function(e) {
      	var data = e.target.result;
      	var workbook = XLSX.read(data, {
        	type: 'binary'
      	});

        var cek = false;
      	workbook.SheetNames.forEach(function(sheetName) {
            if(sheetName != 'data'){ return; }
            cek = true;
            console.log('sheetName', sheetName);
	        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
	        var type_data = jQuery('#jenis_data').val();
	        var data = [];
            if(type_data == ''){
                return alert('Jenis Data Excel tidak boleh kosong!');
            }else if(
                type_data == 'BANKEU'
        		|| type_data == 'BAGI-HASIL'
            ){
	        	XL_row_object.map(function(row, i){
                    data_pasti = {
                        no: '',
                        idbelanjarinci: '',
                        idakunrinci: '',
                        alamat: '',
                        desa: '',
                        total: '',
                        keterangan: '',
                        kec: '',
                        kab: '',
                        prov: ''
                    };
                    if(row['NO']){
                        data_pasti.no = row['NO'];
                    }
                    if(row['idbelanjarinci']){
                        data_pasti.idbelanjarinci = row['idbelanjarinci'];
                    }
                    if(row['idakunrinci']){
                        data_pasti.idakunrinci = row['idakunrinci'];
                    }
                    if(row['DESA']){
                        data_pasti.desa = row['DESA'];
                    }
	        		if(row['PAGU']){
                        data_pasti.total = row['PAGU'];
                    }
	        		if(row['KETERANGAN']){
	        			data_pasti.keterangan = row['KETERANGAN'];
	        		}
	        		if(row['KECAMATAN']){
                        data_pasti.kec = row['KECAMATAN'];
                    }
	        		if(row['KABUPATEN']){
                        data_pasti.kab = row['KABUPATEN'];
                    }
	        		if(row['PROVINSI']){
                        data_pasti.prov = row['PROVINSI'];
                    }
	        		data.push(data_pasti);
	        	});
	        }else if(
		        type_data == 'BOS'
		        || type_data == 'HIBAH-BRG'
		        || type_data == 'HIBAH'
		        || type_data == 'BANSOS-BRG'
		        || type_data == 'BANSOS'
                || type_data == 'BOP-PUSAT-PAUD'
	        ){
	        	XL_row_object.map(function(row, i){
                    data_pasti = {
                        no: '',
                        idbelanjarinci: '',
                        idakunrinci: '',
                        id_profile: '',
                        nama: '',
                        vol: '',
                        harga: '',
                        total: '',
                        keterangan: '',
                        jenis: '',
                        nik: '',
                        alamat: '',
                        kel: '',
                        kec: '',
                        kab: '',
                        prov: '',
                        tlp: ''
                    };
                    if(row['NO']){
                        data_pasti.no = row['NO'];
                    }
                    if(row['idbelanjarinci']){
                        data_pasti.idbelanjarinci = row['idbelanjarinci'];
                    }
                    if(row['idakunrinci']){
                        data_pasti.idakunrinci = row['idakunrinci'];
                    }
                    if(row['ID_PROFIL']){
                        data_pasti.id_profil = row['ID_PROFIL'];
                    }
                    if(row['PENERIMA']){
                        data_pasti.nama = row['PENERIMA'];
                    }
                    if(row['VOLUME']){
                        data_pasti.vol = row['VOLUME'];
                    }
                    if(row['HARGA']){
                        data_pasti.harga = row['HARGA'];
                    }
                    if(row['PAGU']){
                        data_pasti.total = row['PAGU'];
                    }
                    if(row['KETERANGAN']){
                        data_pasti.keterangan = row['KETERANGAN'];
                    }
                    if(row['JENIS']){
                        data_pasti.jenis = row['JENIS'];
                    }
                    if(row['NIK']){
                        data_pasti.nik = row['NIK'];
                    }
                    if(row['ALAMAT']){
                        data_pasti.alamat = row['ALAMAT'];
                    }
                    if(row['KELURAHAN']){
                        data_pasti.kel = row['KELURAHAN'];
                    }
                    if(row['KECAMATAN']){
                        data_pasti.kec = row['KECAMATAN'];
                    }
                    if(row['KABUPATEN']){
                        data_pasti.kab = row['KABUPATEN'];
                    }
                    if(row['PROVINSI']){
                        data_pasti.prov = row['PROVINSI'];
                    }
                    if(row['TLP']){
                        data_pasti.tlp = row['TLP'];
                    }
                    data.push(data_pasti);
	        		// console.log('b', b);
	        	});
            }
	        console.log(data);
            var json_object = JSON.stringify(data);
		    jQuery("#file_output").val(json_object);
      	});
      	if(!cek){
      		alert('Nama sheet "data" tidak ditemukan!');
      	}
	};

    reader.onerror = function(ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(oFile);
}

function sub_bl_view(id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/sub_bl/view/'+id_sub_bl,                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(sub_bl_view){
	      		return resolve(sub_bl_view.data[0]);
	      	}
	    });
    });
}

// proses simpan excel
jQuery('#simpan-excel').on('click', function(){
	jQuery('#wrap-loading').show();
	if(confirm('Apakah anda yakin untuk menyimpan data!')){
		insertRKA();
	}
});

function insertRKA(){
	var id_sub_skpd = jQuery('#id_sub_skpd_excel').val();
	if(id_sub_skpd == ''){
		return alert('ID sub SKPD tidak boleh kosong!');
	}
	var id_sub_bl = jQuery('#id_sub_bl_excel').val();
	if(id_sub_bl == ''){
		return alert('id_sub_bl tidak boleh kosong!');
	}
	var type_data = jQuery('#jenis_data').val();
    if(type_data == ''){
    	return alert('Jenis Data Excel tidak boleh kosong!');
    }
	var excel = jQuery('#file_output').val();
	if(excel ==''){
    	return alert('Data Excel tidak boleh kosong!');
	}
	excel = JSON.parse(excel);
	var sumber_dana = jQuery('#sumber_dana-excel').val();
	if(sumber_dana == ''){
		return alert('Sumber dana tidak boleh kosong!');
	}
	var jenis_belanja = type_data;
	var id_rek_akun = jQuery('#rek-excel').val();
	if(id_rek_akun == ''){
		return alert('Rekening / akun belanja tidak boleh kosong');
	}
	var id_pengelompokan = jQuery('#paket-excel').val();
	if(id_pengelompokan == ''){
		return alert('Kelompok tidak boleh kosong!');
	}
	var vol = jQuery('#volum-excel').val();
	if(vol == ''){
		return alert('Volume tidak boleh kosong!');
	}
	var satuan = jQuery('#satuan-excel').val();
	if(satuan == ''){
		return alert('Satuan tidak boleh kosong!');
	}
	var satuantext = jQuery('#satuan-excel option:selected').text();
	return alert('Masih dalam pengembangan!');

    var all_status = [];
    var opsi_cek_rka = {
    	id_sub_skpd: id_sub_skpd,
    	id_sub_bl: id_sub_bl
    };
	jQuery('.tambah-detil').click();
    if(
    	type_data == 'BOS'
        || type_data == 'HIBAH-BRG'
        || type_data == 'HIBAH'
        || type_data == 'BANSOS-BRG'
        || type_data == 'BANSOS'
        || type_data == 'BOP-PUSAT-PAUD'
    ){
        cek_rincian_exist(excel, false, opsi_cek_rka)
        .then(function(new_excel){
            console.log('new_excel', new_excel);
            // return;
            var data_all = [];
            var data_sementara = [];
            new_excel.map(function(b, i){
                data_sementara.push(b);
                var n = i+1;
                if(n%1 == 0){
                    data_all.push(data_sementara);
                    data_sementara = [];
                }
            });
            if(data_sementara.length > 0){
                data_all.push(data_sementara);
            }
            data_all.unshift(data_all.pop());

            var last = data_all.length-1;
            data_all.reduce(function(sequence, nextData){
                return sequence.then(function(current_data){
                    return new Promise(function(resolve_reduce, reject_reduce){
                        var sendData = current_data.map(function(raw, i){
                            return new Promise(function(resolve, reject){
                                new Promise(function(resolve2, reject2){
                                    var nama_cek = raw.nama.replace(/'/g, "''");
                                    var customFormData = new FormData();
                                    customFormData.append('_token', tokek);
                                    customFormData.append('v1bnA1m', v1bnA1m);
                                    customFormData.append('DsK121m', C3rYDq('rekening='+id_rek_akun));
                                    customFormData.append('columns[0][data]', 'id_profil');
                                    customFormData.append('columns[0][name]', 'pr.id_profil');
                                    customFormData.append('columns[0][searchable]', 'true');
                                    customFormData.append('columns[0][orderable]', 'true');
                                    if(raw.id_profil){
                                        customFormData.append('columns[0][search][value]', raw.id_profil);
                                        customFormData.append('columns[0][search][regex]', 'false');
                                    }else{
                                        customFormData.append('columns[0][search][value]', '');
                                        customFormData.append('columns[0][search][regex]', 'false');
                                        customFormData.append('columns[1][data]', 'nama_teks');
                                        customFormData.append('columns[1][name]', 'pr.nama_teks');
                                        customFormData.append('columns[1][searchable]', 'true');
                                        customFormData.append('columns[1][orderable]', 'true');
                                        customFormData.append('columns[1][search][value]', nama_cek);
                                        customFormData.append('columns[1][search][regex]', 'false');
                                    }
                                    // cari nama penerima bantuan
                                    relayAjax({
                                        url: lru13,
                                        type: "post",
                                        data: customFormData,
                                        processData: false,
                                        contentType: false,
                                        success: function(cari_penerima){
                                            raw.resolve2 = resolve2;
                                            console.log('cari_penerima', cari_penerima);
                                            if(
                                                raw.id_profil 
                                                && cari_penerima.data.length >= 1
                                            ){
                                                raw.nama = cari_penerima.data[0].nama_teks;
                                                raw.id_profile = cari_penerima.data[0].id_profil;
                                                resolve2(raw);
                                            }else{
                                                var cek_exist = false;
                                                var cek_exist_beda_alamat = false;
                                                cari_penerima.data.map(function(b, i){
                                                    b.nama_teks = jQuery("<div/>").html(b.nama_teks).text();
                                                    b.alamat_teks = jQuery("<div/>").html(b.alamat_teks).text();
                                                    if(
                                                        b.nama_teks.toLowerCase().trim() == nama_cek.toLowerCase().trim()
                                                        && b.alamat_teks.toLowerCase().trim() == raw.alamat.toLowerCase().trim()
                                                    ){
                                                        cek_exist = b;
                                                    }else if(
                                                        b.nama_teks.toLowerCase().trim() == nama_cek.toLowerCase().trim()+' '+raw.alamat.toLowerCase().trim()
                                                    ){
                                                        cek_exist = b;
                                                    }else if(b.nama_teks.toLowerCase().trim() == nama_cek.toLowerCase().trim()){
                                                        cek_exist_beda_alamat = b;
                                                    }
                                                });
                                                if(!cek_exist){
                                                    // nama digabung dengan alamat agar data bisa diinput ke sipd
                                                    if(cek_exist_beda_alamat){
                                                        raw.nama += ' '+raw.alamat;
                                                    }
                                                    input_penerima(raw);
                                                }else{
                                                    raw.nama = cek_exist.nama_teks;
                                                    raw.id_profile = cek_exist.id_profil;
                                                    resolve2(raw);
                                                }
                                            }
                                        }
                                    });
                                })
                                .then(function(raw2){
                                    // console.log('raw2.id_profile', raw2.id_profile);
                                    if(!raw2.id_profile){
                                        raw2.error = "Penerima tidak ditemukan atau tidak bisa disimpan!";
                                        resolve(raw2);
                                    }else{
                                        raw2.kodesbl = jQuery('input[name="kodesbl"]').val();
                                        // get id keterangan (tambah data keterangan jika belum ada)
                                        setKeterangan(raw2).then(function(id_ket){
                                            raw2.detil_rincian = {
                                                jenis_belanja: jenis_belanja,
                                                id_rek_akun: id_rek_akun,
                                                id_pengelompokan: id_pengelompokan,
                                                id_keterangan: id_ket
                                            };
                                            var skrim = ''
                                                +'kodesbl='+raw2.kodesbl
                                                +'&idbelanjarinci='+raw2.idbelanjarinci
                                                +'&idakunrinci='+raw2.idakunrinci
                                                +'&jenisbl='+jenis_belanja
                                                +'&akun='+encodeURIComponent(id_rek_akun)
                                                +'&subtitle='+id_pengelompokan
                                                +'&uraian_penerima='+raw2.nama
                                                +'&id_penerima='+raw2.id_profile
                                                +'&prop='+raw2.id_prov
                                                +'&komponenkel='
                                                +'&komponen='
                                                +'&idkomponen='
                                                +'&spek='
                                                +'&satuan='+encodeURIComponent(satuantext)
                                                +'&keterangan='+id_ket
                                                +'&satuan1='+satuan
                                                +'&volum2='
                                                +'&satuan2='
                                                +'&volum3='
                                                +'&satuan3='
                                                +'&volum4='
                                                +'&satuan4=';
                                            if(
                                                raw2.vol
                                                && raw2.harga
                                            ){
                                                skrim += ''
                                                    +'&hargasatuan='+(+raw2.harga.replace(/,/g, ''))
                                                    +'&volum1='+raw2.vol;
                                            }else{
                                                skrim += ''
                                                    +'&hargasatuan='+(+raw2.total.replace(/,/g, ''))
                                                    +'&volum1='+vol;
                                            }
                                            raw2.skrim = skrim;
                                            var customFormData = new FormData();
                                            customFormData.append('_token', tokek);
                                            customFormData.append('v1bnA1m', v1bnA1m);
                                            customFormData.append('DsK121m', C3rYDq(skrim));
                                            var debug = false;
                                            // debug = true;
                                            if(debug){
                                                console.log('raw2', raw2); resolve(raw2);
                                            }else{
                                                relayAjax({
                                                    url: lru9,
                                                    type: "post",
                                                    data: customFormData,
                                                    processData: false,
                                                    contentType: false,
                                                    success: function(data_kel){
                                                        resolve(raw2);
                                                    },
                                                    error: function(jqXHR, textStatus, error){
                                                        raw2.error = 'Error ajax simpan rincian';
                                                        resolve(raw2);
                                                    }
                                                });
                                            }
                                        })
                                    }
                                })
                                .catch(function(e){
                                    console.log(e);
                                    return Promise.resolve({});
                                });
                            })
                            .catch(function(e){
                                console.log(e);
                                return Promise.resolve({});
                            });
                        });
                        Promise.all(sendData)
                        .then(function(res){
                            all_status = all_status.concat(res);
                            resolve_reduce(nextData);
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
                console.log('all_status', all_status);
                after_insert(all_status, type_data);
            })
            .catch(function(err){
                console.log('err', err);
                alert('Ada kesalahan sistem!');
                jQuery('#wrap-loading').hide();
            });
        });
    }else if(
        type_data == 'BANKEU'
        || type_data == 'BAGI-HASIL'
    ){
    	get_prov_login()
        .then(function(data_prov){
            cek_rincian_exist(excel, true, opsi_cek_rka)
            .then(function(new_excel){
                console.log('new_excel', new_excel);
                var data_all = [];
                var data_sementara = [];
                new_excel.map(function(b, i){
                    data_sementara.push(b);
                    var n = i+1;
                    if(n%1 == 0){
                        data_all.push(data_sementara);
                        data_sementara = [];
                    }
                });
                if(data_sementara.length > 0){
                    data_all.push(data_sementara);
                }
                data_all.unshift(data_all.pop());

                var last = data_all.length-1;
                data_all.reduce(function(sequence, nextData){
                    return sequence.then(function(current_data){
                        return new Promise(function(resolve_reduce, reject_reduce){
                    		var sendData = current_data.map(function(raw, i){
                    			return new Promise(function(resolve, reject){
                    	      		var id_prov = jQuery('<select>'+data_prov+'</select>').find('option').filter(function(){
                    	      			return jQuery(this).val() == raw.prov;
                    	      		}).val();
                    				// console.log('id_prov', id_prov, data_prov, raw.prov);
                    	      		if(typeof id_prov == 'undefined'){
                    	      			raw.error = 'Provinsi tidak ditemukan';
                    	      			resolve(raw);
                    	      		}else{
                    					raw.id_prov = raw.prov;
                    					getIdKab(raw.id_prov).then(function(id_kab){
                    			      		if(typeof id_kab == 'undefined'){
                    			      			raw.error = 'Kabupaten / Kota tidak ditemukan';
                    			      			resolve(raw);
                    			      		}else{
                    							raw.id_kab = id_kab;
                    							getIdKec(raw.id_kab).then(function(id_kec){
                    					      		if(typeof id_kec == 'undefined'){
                    					      			raw.error = 'Kecamatan tidak ditemukan';
                    					      			resolve(raw);
                    					      		}else{
                    							      	raw.id_kec = id_kec;
                    					      			getIdKel(raw.id_kab, raw.id_kec).then(function(id_kel){
                    							      		if(typeof id_kel == 'undefined'){
                    							      			raw.error = 'Desa / Kelurahan tidak ditemukan';
                    							      			resolve(raw);
                    							      		}else{
                    							      			raw.id_kel = id_kel;
                    							      			raw.kodesbl = jQuery('input[name="kodesbl"]').val();
                    							      			setKeterangan(raw).then(function(id_ket){
                    								      			raw.detil_rincian = {
                    								      				jenis_belanja: jenis_belanja,
                    								      				id_rek_akun: id_rek_akun,
                    								      				id_pengelompokan: id_pengelompokan,
                    								      				id_keterangan: id_ket
                    								      			};
                    								      			var skrim = ''
                    								      				+'kodesbl='+raw.kodesbl
                    								      				+'&idbelanjarinci='+raw.idbelanjarinci
                    								      				+'&idakunrinci='+raw.idakunrinci
                    								      				+'&jenisbl='+jenis_belanja
                    									      			+'&akun='+encodeURIComponent(id_rek_akun)
                    									      			+'&subtitle='+id_pengelompokan
                    									      			+'&uraian_penerima='
                    									      			+'&id_penerima='
                    									      			+'&prop='+raw.id_prov
                    									      			+'&kab_kota='+raw.id_kab
                    									      			+'&kecamatan='+raw.id_kec
                    									      			+'&kelurahan='+raw.id_kel
                    									      			+'&komponenkel='
                    									      			+'&komponen='
                    									      			+'&idkomponen='
                    									      			+'&spek='
                    									      			+'&satuan='+encodeURIComponent(satuantext)
                    									      			+'&hargasatuan='+(+raw.total.replace(/,/g, ''))
                    									      			+'&keterangan='+id_ket
                    									      			+'&volum1='+vol
                    									      			+'&satuan1='+satuan
                    									      			+'&volum2='
                    									      			+'&satuan2='
                    									      			+'&volum3='
                    									      			+'&satuan3='
                    									      			+'&volum4='
                    									      			+'&satuan4=';
                    										        raw.skrim = skrim;

                    										        var opsi_rincian = {
                    										        	id_subs_sub_bl: '226028',
																		id_ket_sub_bl: 277751,
																		id_akun: 19519,
																		id_standar_harga: 0,
																		id_standar_nfs: 0,
																		pajak: 0,
																		volume: 1,
																		harga_satuan: 1000000,
																		koefisien: '1 Tahun',
																		total_harga: 1000000,
																		jenis_bl: 'BANKEU-KHUSUS',
																		id_dana: 334,
																		vol_1: 1,
																		sat_1: 'Tahun',
																		vol_2: 0,
																		sat_2: '',
																		vol_3: 0,
																		sat_3: '',
																		vol_4: 0,
																		sat_4: '',
																		rkpd_murni: 0,
																		rkpd_pak: 0,
																		kode_akun: '5.4.02.05.02.0003',
																		nama_akun: 'Belanja Bantuan Keuangan Khusus Kabupaten/Kota kepada Desa',
																		nama_standar_harga: '',
																		kode_standar_harga: '',
																		is_lokus_akun: 1,
																		lokus_akun_teks: 'Babadan Lor',
																		id_daerah_log: 89,
																		id_user_log: 23566,
																		created_user: 23566,
																		id_daerah: 89,
																		tahun: 2024,
																		id_unit: 3282,
																		id_bl: 0,
																		id_sub_bl: 84288,
																		id_jadwal_murni: 0,
																		id_skpd: 3282,
																		id_sub_skpd: 3282,
																		id_program: 1164,
																		id_giat: 8653,
																		id_sub_giat: 19938,
																		rkpd_murni: 0,
																		rkpd_pak: 0,
																		nama_daerah: 'Kab. Madiun',
																		nama_unit: 'Badan Pengelolaan Keuangan dan Aset Daerah',
																		nama_skpd: 'Badan Pengelolaan Keuangan dan Aset Daerah',
																		nama_sub_skpd: 'Badan Pengelolaan Keuangan dan Aset Daerah',
																		nama_program: 'PROGRAM PENGELOLAAN KEUANGAN DAERAH',
																		nama_giat: 'Penunjang Urusan Kewenangan Pengelolaan Keuangan Daerah',
																		nama_sub_giat: 'Analisis Perencanaan dan Penyaluran Bantuan Keuangan',
																		nama_standar_nfs: '',
																		nama_jadwal_murni: '',
																		nama_blt: '',
																		nama_usulan: '',
																		nama_jenis_usul: ''
                    										        };

                                                                    // tambah data rincian
                                                                    relayAjaxApiKey({
                                                                        url: config.sipd_url+'api/renja/penerima_bantuan/add',
                                                                        type: "post",
                                                                        data: formData(opsi_rincian),
                    										          	success: function(ret){

                    										          		// get detail rincian untuk mendapatkan id_rinci_sub_bl
                    										          		view_rincian_by_id_unik(ret.data)
                    										          		.then(function(detail_rka){

			                    										        var opsi_penerima_bantuan = {
			                    										        	tahun: _token.tahun,
																					id_daerah: _token.daerah_id,
																					id_unit: raw.id_sub_skpd,
																					jenis_bantuan: type_data.toLowerCase(),
																					id_bl: 0,
																					id_sub_bl: raw.id_sub_bl,
																					id_rinci_sub_bl: detail_rka.id_rinci_sub_bl,
																					id_akun: id_rek_akun,
																					lokus_akun: raw.nama_kel,
																					id_profil: 0,
																					total_harga: (+raw.total.replace(/,/g, '')),
																					id_prop: raw.id_prov,
																					id_kokab: raw.id_kab,
																					id_camat: raw.id_kec,
																					id_lurah: raw.id_kel,
																					id_skpd: raw.id_skpd,
																					id_sub_skpd: raw.id_sub_skpd,
																					id_program: raw.id_program,
																					id_giat: raw.id_giat,
																					id_sub_giat: raw.id_sub_giat,
																					id_daerah_log: _token.daerah_id,
																					id_user_log: _token.user_id
			                    										        };

	                    										          		// tambah data penerima bantuan
			                                                                    relayAjaxApiKey({
			                                                                        url: config.sipd_url+'api/renja/penerima_bantuan/add',
			                                                                        type: "post",
			                                                                        data: formData(opsi_penerima_bantuan),
			                    										          	success: function(data_kel){
	                    								      							resolve(raw);
	                    								      						},
			                    										          	error: function(jqXHR, textStatus, error){
			                    										      			raw.error = 'Error ajax simpan rincian';
			                    										      			resolve(raw);
			                    										          	}
		                    										          	});
                    										          		});
                    										          	},
                    										          	error: function(jqXHR, textStatus, error){
                    										      			raw.error = 'Error ajax simpan rincian';
                    										      			resolve(raw);
                    										          	}
                    										       	});
                    							      			})
                    							      		}
                    								    })
                    								    .catch(function(e){
                    										raw.error = 'Error ajax kelurahan';
                    				      					resolve(raw);
                    								    });
                    						      	}
                    					        })
                    						    .catch(function(e){
                    								raw.error = 'Error ajax kecamatan';
                    		      					resolve(raw);
                    						    });
                    				      	}
                    			        })
                    				    .catch(function(e){
                    						raw.error = 'Error ajax kabupaten';
                          					resolve(raw);
                    				    });
                    		      	}
                    			})
                    		    .catch(function(e){
                    		        console.log(e);
                    		        return Promise.resolve({});
                    		    });
                    		});
                    		Promise.all(sendData)
                    		.then(function(res){
                                all_status = all_status.concat(res);
                                resolve_reduce(nextData);
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
                    console.log('all_status', all_status);
                    after_insert(all_status, type_data);
                })
                .catch(function(err){
                    console.log('err', err);
                    alert('Ada kesalahan sistem!');
                    jQuery('#wrap-loading').hide();
                });
            });
        })
        .catch(function(err){
    		alert('Error ajax provinsi');
    		jQuery('#wrap-loading').hide();
        });
    }
}

function cek_rincian_exist(excel, bankeu=false, opsi){
    return new Promise(function(resolve, reduce){
    	// get rincian berdasar id sub bl
    	get_rinci_sub_bl(opsi.id_sub_skpd, opsi.id_sub_bl)
    	.then(function(data){
    		var last = data.data.length-1;
    		var newData = [];
    		data.data.reduce(function(sequence, nextData){
				return sequence.then(function(current_data){
					return new Promise(function(resolve_reduce, reject_reduce){

						// get detail rincian berdasarkan id_rinci_sub_bl
						detail_rincian_sub_bl(current_data)
						.then(function(rinci){
							newData.push(rinci.data[0]);
							resolve_reduce();
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
                var data_exist = {};
				newData.map(function(b, i){
                    var nama = b.nama_standar_harga;
					if(b.lokus_akun_teks != ''){
						nama = lokus_akun_teks;
					}

                    // keyword yang tepat masih dalam pencarian
                    var keyword = jQuery("<div/>").html(nama).text().toLowerCase().trim()+b.total_harga.trim();
                    if(!data_exist[keyword]){
                        data_exist[keyword] = {
                            'sipd': [],
                            'excel': []
                        };
                    }
                    data_exist[keyword].sipd.push(b);
                });
                var data_import = [];
                excel.map(function(b, i){
                    if(bankeu){
                        b.nama = b.desa;
                    }
                    var keyword = b.nama.replace(/'/g, "''").toLowerCase().trim()+b.total.replace(/,/g, '').trim();
                    var keyword2 = (b.nama.replace(/'/g, "''").toLowerCase()+' '+b.alamat.replace(/'/g, "''").toLowerCase()).trim()+b.total.replace(/,/g, '').trim();
                    if(
                        !data_exist[keyword]
                        && !data_exist[keyword2]
                    ){
                        console.log('Belum ada! nama='+b.nama+' total='+b.total, keyword, keyword2, b);
                        b.ket_cek_rincian_exist = 'Belum ada! '+keyword;
                        data_import.push(b);
                    }else{
                        if(data_exist[keyword2]){
                            keyword = keyword2;
                        }
                        data_exist[keyword].excel.push(b);
                        if(data_exist[keyword].sipd.length < data_exist[keyword].excel.length){
                            console.log('Data excel double! nama='+b.nama+' total='+b.total, keyword, b);
                            b.ket_cek_rincian_exist = 'Data excel double! '+keyword;
                            data_import.push(b);
                        }else{
                            // console.log('Sudah ada! nama='+b.nama+' total='+b.total, b);
                        }
                    }
                });
                var double = [];
                var jenis_data = jQuery('#jenis_data').val().toLowerCase();
                for(var i in data_exist){
                    if(
                        jenis_data == data_exist[i].sipd[0].jenis_bl
                        && data_exist[i].sipd.length > data_exist[i].excel.length
                    ){
                        double.push(data_exist[i]);
                    }
                }
                console.log('data sipd tapi tidak ada di excel', double);
                resolve(data_import);
			});
    	});
    });
}

function get_rinci_sub_bl(idunit, id_sub_bl){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/renja/rinci_sub_bl/get_by_id_sub_bl',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun,
				id_sub_bl: id_sub_bl,
				id_unit: idunit,
				is_anggaran: global_is_anggaran
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(rinci_sub_bl){
	      		return resolve(rinci_sub_bl);
	      	}
	    });
    });
}

// get rincian 
function detail_rincian_sub_bl(opsi){
	return new Promise(function(resolve, reject){
		pesan_loading('Get detail rincian komponen "'+opsi.nama_komponen+'" '+opsi.spek_komponen);
		relayAjax({
			url: config.sipd_url+'api/renja/rinci_sub_bl/view/'+opsi.id_rinci_sub_bl,						
			type: 'POST',	      				
			data: {
				tahun: _token.tahun,
				id_daerah: _token.daerah_id,
				id_sub_bl: opsi.id_sub_bl
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key2());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
			success: function(res){
				return resolve(res);
			}
		});
	});
}

function view_rincian_by_id_unik(id_unik){
	return new Promise(function(resolve, reduce){
		relayAjaxApiKey({
			url: config.sipd_url+'api/renja/rinci_sub_bl/view_by_id_unik',
			type: 'post',
			data: formData({
				id_daerah: _token.daerah_id,
				tahun: _token.tahun,
				id_unik: id_unik
			}),
			success: function(ret){
				resolve(ret.data[0]);
			}
		});
	});
}

function get_prov_login(){
	return new Promise(function(resolve, reduce){
		if(typeof prov_login_global == 'undefined'){
			var formDataCustom = new FormData();
			formDataCustom.append('search[value]', '');
			formDataCustom.append('tipe', 'prov');
			relayAjax({
				url: config.sipd_url+'api/master/provinsi/findlistpusat',
				type: 'post',
				beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				xhr: function() {
			        var xhr = jQuery.ajaxSettings.xhr();
			        var setRequestHeader = xhr.setRequestHeader;
			        xhr.setRequestHeader = function(name, value) {
			            if (name == 'X-Requested-With') return;
			            setRequestHeader.call(this, name, value);
			        }
			        return xhr;
			    },
				data: formDataCustom,
		        processData: false,
		        contentType: false,
				success: function(ret){
					prov_login_global = ret.data;
					resolve(prov_login_global);
				}
			});
		}else{
			resolve(prov_login_global);
		}
	});
}

function getIdKab(id_prov){
	return new Promise(function(resolve, reduce){
		if(typeof kab_login_global == 'undefined'){
			kab_login_global = {};
		}
		if(typeof kab_login_global[id_prov] == 'undefined'){
			relayAjax({
				url: config.sipd_url+'api/master/kabkot/findlist',
				type: 'post',
				beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				data: {
					'search[value]': '',
					id_daerah: id_prov
				},
				success: function(ret){
					kab_login_global[id_prov] = ret.data;
					resolve(kab_login_global[id_prov]);
				}
			});
		}else{
			resolve(kab_login_global[id_prov]);
		}
	});
}

function getIdKec(id_kab){
	return new Promise(function(resolve, reduce){
		if(typeof kec_global == 'undefined'){
			kec_global = {};
		}
		if(typeof kec_global[id_kab] == 'undefined'){
			relayAjax({
				url: config.sipd_url+'api/master/kecamatan/search_by_kotkab',
				type: 'post',
				beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				data: {
					'search[value]': '',
					tahun: _token.tahun,
					id_kabkota: id_kab
				},
				success: function(ret){
					kec_global[id_kab] = ret.data;
					resolve(kec_global[id_kab]);
				}
			});
		}else{
			resolve(kec_global[id_kab]);
		}
	});
}

function getIdKel(id_kab, id_kec){
	return new Promise(function(resolve, reduce){
		if(typeof kel_global == 'undefined'){
			kel_global = {};
		}
		var key = id_kab+'-'+id_kec;
		if(typeof kel_global[key] == 'undefined'){
			relayAjax({
				url: config.sipd_url+'api/master/kelurahan/findByKabkotaAndCamat',
				type: 'post',
				beforeSend: function (xhr) {
				    xhr.setRequestHeader("x-api-key", x_api_key());
					xhr.setRequestHeader("x-access-token", _token.token);
				},
				data: {
					'search[value]': '',
					tahun: _token.tahun,
					id_kabkota: id_kab,
					id_camat: id_kec
				},
				success: function(ret){
					kel_global[key] = ret.data;
					resolve(kel_global[key]);
				}
			});
		}else{
			resolve(kel_global[key]);
		}
	});
}

function get_rekening_by_jenis_belanja(jenis, text){
	var key = jenis+text;
	if(typeof global_rek_by_jenis_belanja[key] == 'undefined'){
		show_loading();
		pesan_loading('Get data Rekening by jenis belanja', true);
		var opsi = {
			id_daerah: _token.daerah_id,
			tahun: _token.tahun,
			'search[value]': '',
			length: 20,
			is_gaji_asn: 0,
			is_barjas: 0,
			is_bunga: 0,
			is_subsidi: 0,
			is_bagi_hasil: 0,
			is_bankeu_umum: 0,
			is_bankeu_khusus: 0,
			is_btt: 0,
			is_hibah_brg: 0,
			is_hibah_uang: 0,
			is_sosial_brg: 0,
			is_sosial_uang: 0,
			is_bos: 0,
			is_modal_tanah: 0,
			set_lokus: ''
		};
		if(jenis == 'BTL-GAJI'){
			opsi.is_gaji_asn = 1;
		}else if(jenis == 'BARJAS-MODAL'){
			opsi.is_barjas = 1;
		}else if(jenis == 'BUNGA'){
			opsi.is_bunga = 1;
		}else if(jenis == 'SUBSIDI'){
			opsi.is_subsidi = 1;
		}else if(jenis == 'HIBAH-BRG'){
			opsi.is_hibah_brg = 1;
		}else if(jenis == 'HIBAH'){
			opsi.is_hibah_uang = 1;
		}else if(jenis == 'BANSOS-BRG'){
			opsi.is_sosial_brg = 1;
		}else if(jenis == 'BANSOS'){
			opsi.is_sosial_uang = 1;
		}else if(jenis == 'BAGI-HASIL'){
			opsi.is_bagi_hasil = 1;
		}else if(jenis == 'BANKEU'){
			opsi.is_bankeu_umum = 1;
		}else if(jenis == 'BANKEU-KHUSUS'){
			opsi.is_bankeu_khusus = 1;
		}else if(jenis == 'BTT'){
			opsi.is_btt = 1;
		}else if(jenis == 'BOS'){
			opsi.is_bos = 1;
		}else if(jenis == 'BLUD'){
			opsi.set_lokus = 'blud';
		}else if(jenis == 'TANAH'){
			opsi.is_modal_tanah = 1;
		}
		relayAjaxApiKey({
			url: config.sipd_url+'api/master/akun/find_akun_for_komponen',
			type: 'post',
			data: formData(opsi),
			success: function(ret){
				global_rek_by_jenis_belanja[key] = ret.data;
				var html = '';
				global_rek_by_jenis_belanja[key].map(function(b, i){
					html += '<option value="'+b.id_akun+'">'+b.kode_akun+' '+b.nama_akun+'</option>';
				});
				jQuery('#rek-excel').html(html);
				hide_loading();
			}
		});
	}else{
		var html = '';
		global_rek_by_jenis_belanja[key].map(function(b, i){
			html += '<option value="'+b.id_akun+'">'+b.kode_akun+' '+b.nama_akun+'</option>';
		})
		jQuery('#rek-excel').html(html);
	}
}