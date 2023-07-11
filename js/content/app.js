window._interval = false;

let previousUrl = "";
const observer = new MutationObserver(() => {
  	if (window.location.href !== previousUrl) {
	    console.log(`URL changed from ${previousUrl} to ${window.location.href}`);
	    previousUrl = window.location.href;
	    cekUrl(previousUrl);
  	}
});

observer.observe(document, { subtree: true, childList: true });

function cekUrl(current_url, nomor=1){
	if(nomor > 1){
		console.log('Run ulang cekUrl() ke '+nomor+' URL: '+current_url);
	}else{
		cekLisensi();
	}

	getToken();

	// untuk menjaga session
	clearInterval(_interval);
	intervalSession();
	if(_token.daerah_id == 101){
		return alert('Hubungi Pak Pur');
	}
	
	var loading = ''
		+'<div id="wrap-loading">'
	        +'<div class="lds-hourglass"></div>'
	        +'<div id="persen-loading"></div>'
	    +'</div>';
	if(jQuery('#wrap-loading').length == 0){
		jQuery('body').prepend(loading);
	}

	jQuery('.aksi-extension').remove();
	jQuery('#modal-extension').remove();

	setTimeout(function(){
		var cek_reload = true;
		var title_admin = jQuery('#kt_header .menu-title.text-white');
		// jika halaman admin
		if(title_admin.length >= 1){
			var aksi_admin = ''
				+'<div id="aksi-admin" class="menu-item me-lg-1">'
					+'<a class="btn btn-success btn-sm" onclick="ganti_tahun();" style="margin-left: 2px;">Ganti Tahun Anggaran</a>'
					+'<a class="btn btn-danger btn-sm" onclick="logout();" style="margin-left: 5px;">Keluar</a>'
				+'</div>'
			if(jQuery('#aksi-admin').length == 0){
				title_admin.closest('.menu-item').after(aksi_admin);
			}

			if(current_url.indexOf('/perencanaan/rpjpd/cascading/') != -1){
				var modal = ''
					+'<div class="modal fade modal-extension" id="modal-extension" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
				        +'<div class="modal-dialog" style="max-width: 1500px;" role="document">'
				            +'<div class="modal-content">'
				                +'<div class="modal-header bgpanel-theme">'
				                    +'<h3 class="fw-bolder m-0">Data RPJPD WP-SIPD</h4>'
				                    +'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
				                +'</div>'
				                +'<div class="modal-body">'
				                  	+'<table class="table table-bordered table-hover table-striped" id="table-extension">'
				                      	+'<thead>'
				                        	+'<tr>'
				                          		+'<th class="text-center" style="font-weight: bold;"><input type="checkbox" id="modal_cek_all"></th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Visi</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Misi</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Sasaran</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Kebijakan</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Strategi</th>'
				                        	+'</tr>'
				                      	+'</thead>'
				                      	+'<tbody></tbody>'
				                  	+'</table>'
				                +'</div>'
				                +'<div class="modal-footer">'
				                    +'<button type="button" class="btn btn-primary" id="proses-extension">Singkronisasi</button>'
				                    +'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'
				                +'</div>'
				            +'</div>'
				        +'</div>'
				    +'</div>';
				jQuery('body').append(modal);
				jQuery('#proses-extension').on('click', function(){
					singkronisasi_rpjpd_dari_lokal();
				});
			    jQuery('#modal_cek_all').on('click', function(){
					var cek = jQuery(this).is(':checked');
					jQuery('#table-extension tbody tr input[type="checkbox"]').prop('checked', cek);
				});
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="get_rpjpd_lokal">Singkronisasi Data RPJPD dari WP-SIPD</button>'
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#get_rpjpd_lokal').on('click', function(){
					get_rpjpd_lokal();
				});
			}else if(current_url.indexOf('/perencanaan/rpd/cascading/') != -1){
				window.type_data_rpd = 'tujuan';
				var header_isu = 'Isu Strategi RPJPD';
				var header_tujuan = 'Tujuan Teks';
				if(current_url.indexOf('/perencanaan/rpd/cascading/tujuan') != -1){
					type_data_rpd = 'tujuan';
				}else if(current_url.indexOf('/perencanaan/rpd/cascading/sasaran') != -1){
					header_isu = 'Tujuan Teks';
					header_tujuan = 'Sasaran Teks';
					type_data_rpd = 'sasaran';
				}else if(current_url.indexOf('/perencanaan/rpd/cascading/program') != -1){
					header_isu = 'Sasaran Teks';
					header_tujuan = 'Program Teks';
					type_data_rpd = 'program';
				}
				var modal = ''
					+'<div class="modal fade modal-extension" id="modal-extension" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
				        +'<div class="modal-dialog" style="max-width: 1500px;" role="document">'
				            +'<div class="modal-content">'
				                +'<div class="modal-header bgpanel-theme">'
				                    +'<h3 class="fw-bolder m-0">Data RPD WP-SIPD</h4>'
				                    +'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
				                +'</div>'
				                +'<div class="modal-body">'
				                  	+'<table class="table table-bordered table-hover" id="table-extension">'
				                      	+'<thead>'
				                        	+'<tr>'
				                          		+'<th class="text-center" style="font-weight: bold;"><input type="checkbox" id="modal_cek_all"></th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Status</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">'+header_isu+'</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">'+header_tujuan+'</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Indikator Teks</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Target Awal</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Target 1</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Target 2</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Target 3</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Target 4</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Target 5</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Target Akhir</th>'
				                          		+'<th class="text-center" style="font-weight: bold;">Keterangan</th>'
				                        	+'</tr>'
				                      	+'</thead>'
				                      	+'<tbody></tbody>'
				                  	+'</table>'
				                +'</div>'
				                +'<div class="modal-footer">'
				                    +'<button type="button" class="btn btn-primary" id="proses-extension">Singkronisasi</button>'
				                    +'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'
				                +'</div>'
				            +'</div>'
				        +'</div>'
				    +'</div>';
				jQuery('body').append(modal);
				jQuery('#proses-extension').on('click', function(){
					if(type_data_rpd == 'tujuan'){
						singkronisasi_rpd_dari_lokal();
					}else if(type_data_rpd == 'sasaran'){
						singkronisasi_rpd_sasaran_dari_lokal();
					}else if(type_data_rpd == 'program'){
						singkronisasi_rpd_program_dari_lokal();
					}
				});
			    jQuery('#modal_cek_all').on('click', function(){
					var cek = jQuery(this).is(':checked');
					jQuery('#table-extension tbody tr input[type="checkbox"]').prop('checked', cek);
				});
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="get_rpd_lokal">Singkronisasi Data RPD dari WP-SIPD</button>'
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#get_rpd_lokal').on('click', function(){
					get_rpd_lokal();
				});
			}
			// Data RPJMD
			else if(current_url.indexOf('/perencanaan/rpjmd/cascading/') != -1){
				window.type_data_renstra = 'visi';				
				var header_tujuan = 'Visi Teks';
				if(current_url.indexOf('/perencanaan/rpjmd/cascading/visi') != -1){
					type_data_rpjmd = 'visi';
				}else if(current_url.indexOf('/perencanaan/rpjmd/cascading/misi') != -1){					
					header_tujuan = 'misi Teks';
					type_data_rpjmd = 'misi';
				}else if(current_url.indexOf('/perencanaan/rpjmd/cascading/tujuan') != -1){					
					header_tujuan = 'tujuan Teks';
					type_data_rpjmd = 'tujuan';				
				}else if(current_url.indexOf('/perencanaan/rpjmd/cascading/sasaran') != -1){					
					header_tujuan = 'sasaran Teks';
					type_data_rpjmd = 'sasaran';				
				}else if(current_url.indexOf('/perencanaan/rpjmd/cascading/program') != -1){					
					header_tujuan = 'program Teks';
					type_data_rpjmd = 'program';
				}
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="backup_rpjmd">Singkron ke DB Lokal</button>'
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#backup_rpjmd').on('click', function(){
					backup_rpjmd();					
				});
			}
			// Data Renstra
			else if(current_url.indexOf('/perencanaan/renstra/cascading/') != -1){
				window.type_data_renstra = 'tujuan';
				var header_isu = 'Isu Strategi RPJMD';
				var header_tujuan = 'Tujuan Teks';
				if(current_url.indexOf('/perencanaan/renstra/cascading/tujuan') != -1){
					type_data_renstra = 'tujuan';
				}else if(current_url.indexOf('/perencanaan/renstra/cascading/sasaran') != -1){
					header_isu = 'Tujuan Teks';
					header_tujuan = 'Sasaran Teks';
					type_data_renstra = 'sasaran';
				}else if(current_url.indexOf('/perencanaan/renstra/cascading/program') != -1){
					header_isu = 'Sasaran Teks';
					header_tujuan = 'Program Teks';
					type_data_renstra = 'program';				
				}else if(current_url.indexOf('/perencanaan/renstra/cascading/kegiatan') != -1){
					header_isu = 'Program Teks';
					header_tujuan = 'Kegiatan Teks';
					type_data_renstra = 'kegiatan';				
				}else if(current_url.indexOf('/perencanaan/renstra/cascading/sub_kegiatan') != -1){
					header_isu = 'Kegiatan Teks';
					header_tujuan = 'Sub Kegiatan Teks';
					type_data_renstra = 'sub_kegiatan';
				}
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="backup_renstra">Singkron ke DB Lokal</button>'
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#backup_renstra').on('click', function(){
					backup_renstra();
					// if(type_data_renstra == 'tujuan'){
					// 	singkron_tujuan_renstra();
					// }else if(type_data_renstra == 'sasaran'){
					// 	singkron_sasaran_renstra();
					// }else if(type_data_renstra == 'program'){
					// 	singkron_program_renstra();
					// }else if(type_data_renstra == 'kegiatan'){
					// 	singkron_kegiatan_renstra();
					// }else if(type_data_renstra == 'sub_kegiatan'){
					// 	singkron_sub_kegiatan_renstra();
					// }
				});
			}
			// Data pengaturan SIPD
			else if(current_url.indexOf('/pengaturan/sipd') != -1)
			{
				console.log('halaman Pengaturan SIPD');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_pengaturan_sipd_lokal">Singkron ke DB Lokal</button>'					
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_pengaturan_sipd_lokal').on('click', function(){
					singkron_pengaturan_sipd_lokal();
				});
			}
			// Data Master User
			else if(current_url.indexOf('/user') != -1)
			{
				if(current_url.indexOf('/user/admin_bappeda_keuangan') != -1)
				{
					console.log('halaman User admin_bappeda_keuangan');		
					level = "3,4";
					levelmitra = "7,11";
					levelskpd = "9,13,40";
					model="mitra";
					models="skpd";
					idunit="0";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="singkron_user_mitra_lokal">Singkron User Mitra ke DB Lokal</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-info" id="singkron_user_skpd_lokal">Singkron User SKPD ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
					jQuery('#singkron_user_mitra_lokal').on('click', function(){
						singkron_user_mitra_lokal(levelmitra, model);
					});
					jQuery('#singkron_user_skpd_lokal').on('click', function(){
						singkron_user_skpd_lokal(levelskpd, models, idunit);
					});
				}
				else if(current_url.indexOf('/user/mitra_bappeda') != -1)
				{
					console.log('halaman User mitra_bappeda');	
					level = "7,11";
					model="mitra";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_mitra_lokal">Singkron User Mitra/Penyelia ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_mitra_lokal').on('click', function(){
						singkron_user_mitra_lokal(level, model);
					});
				}
				else if(current_url.indexOf('/user/penyelia_keuangan') != -1)
				{
					console.log('halaman User penyelia_keuangan');	
					level = "8";
					model = "penyelia";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_mitra_lokal">Singkron User Mitra/Penyelia ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_mitra_lokal').on('click', function(){
						singkron_user_mitra_lokal(level, model);
					});
				}
				else if(current_url.indexOf('/user/ppkd') != -1)
				{
					console.log('halaman User ppkd');	
					level = "8";
					// levelp = "8,9,10,14,12";			
					model = "penyelia";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="singkron_user_mitra_lokal">Singkron User Mitra/Penyelia ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
					jQuery('#singkron_user_mitra_lokal').on('click', function(){
						singkron_user_mitra_lokal(level, model);
					});
				}
				else if(current_url.indexOf('/user/anggota_dewan') != -1)
				{
					console.log('halaman User anggota_dewan');		
					level = "16";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
				}
				else if(current_url.indexOf('/user/penyelia_inspektorat') != -1)
				{
					console.log('halaman User penyelia_inspektorat');		
					level = "26";
					model="inspektorat";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="singkron_user_mitra_lokal">Singkron User Mitra/Penyelia ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
					jQuery('#singkron_user_mitra_lokal').on('click', function(){
						singkron_user_mitra_lokal(level, model);
					});
				}
				else if(current_url.indexOf('/user/penyelia_barang_jasa') != -1)
				{
					console.log('halaman User penyelia_barang_jasa');
					level = "30";		
					model="pbj";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="singkron_user_mitra_lokal">Singkron User Mitra/Penyelia ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
					jQuery('#singkron_user_mitra_lokal').on('click', function(){
						singkron_user_mitra_lokal(level, model);
					});
				}
				else if(current_url.indexOf('/user/kelurahan_desa') != -1)
				{
					console.log('halaman User kelurahan_desa');	
					level = "20";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
				}
				else if(current_url.indexOf('/user/admin_standar_harga') != -1)
				{
					console.log('halaman User admin_standar_harga');
					level = "6";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
				}
				else if(current_url.indexOf('/user/masyarakat') != -1)
				{
					console.log('halaman User masyarakat');	
					level = "21";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_masyarakat_lokal">Singkron User ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_masyarakat_lokal').on('click', function(){
						singkron_user_masyarakat_lokal(level);
					});
				}
				else if(current_url.indexOf('/user/penyelia_standar_harga') != -1)
				{
					console.log('halaman User Penyelia Standar Harga');	
					level = "10,14";
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_dewan_lokal">Singkron User ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_dewan_lokal').on('click', function(){
						singkron_user_dewan_lokal(level);
					});
				}
				else if(current_url.indexOf('/user/skpd') != -1)
				{
					console.log('halaman User SKPD');	
					level = "9,13,40";
					model="skpd";
					idunit=_token.unit;
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_user_skpd_lokal">Singkron User SKPD ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_user_skpd_lokal').on('click', function(){
						singkron_user_skpd_lokal(level, model, idunit);
					});
				}
			}	
			// Data Master SKPD
			else if(current_url.indexOf('/master/skpd') != -1)
			{
				console.log('halaman Master SKPD');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_skpd_ke_lokal">Singkron ke DB Lokal</button>'
						+'<button class="btn btn-sm btn-success btn-outline" id="tampil_laporan_renja" style="margin-left: 3px;">'
							+'Tampilkan Link Print RENJA'
						+'</button>';
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_skpd_ke_lokal').on('click', function(){
					singkron_skpd_ke_lokal();
				});
				jQuery('#tampil_laporan_renja').on('click', function(){
					singkron_skpd_ke_lokal(1);
				});
			}
			// Data Master Urusan, Bidang, Program, Kegiatan, Sub Kegiatan
			else if(current_url.indexOf('/master/sub_giat') != -1)
			{
				console.log('halaman Master Program Kegiatan Sub Kegiatan');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_data_giat_lokal">Singkron ke DB Lokal</button>'					
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_data_giat_lokal').on('click', function(){
					singkron_data_giat_lokal();
				});
			}
			// Master Prioritas Provinsi
			else if(current_url.indexOf('/master/label_prov') != -1)
			{
				console.log('halaman Master Prioritas Provinsi');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_prioritas_kab_lokal">Singkron ke DB Lokal</button>'					
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="singkron_prioritas_prov_lokal">Singkron Prioritas Prov ke DB Lokal</button>'											
					+'</div>';
				jQuery('.page-title').append(btn);				
				jQuery('#singkron_prioritas_prov_lokal').on('click', function(){
					singkron_prioritas_prov_lokal();
				});
				jQuery('#singkron_prioritas_pusat_lokal').on('click', function(){
					singkron_prioritas_pusat_lokal();
				});
			}
			else if(current_url.indexOf('/master/label_kabkot') != -1)
			{
				console.log('halaman Master Prioritas Kabupaten');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_prioritas_kab_lokal">Singkron ke DB Lokal</button>'					
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="singkron_prioritas_prov_lokal">Singkron Prioritas Prov ke DB Lokal</button>'					
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-info" id="singkron_prioritas_pusat_lokal">Singkron Prioritas Pusat ke DB Lokal</button>'					
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_prioritas_kab_lokal').on('click', function(){
					singkron_prioritas_kab_lokal();
				});
				jQuery('#singkron_prioritas_prov_lokal').on('click', function(){
					singkron_prioritas_prov_lokal();
				});
				jQuery('#singkron_prioritas_pusat_lokal').on('click', function(){
					singkron_prioritas_pusat_lokal();
				});
			}
			// Master Label Giat
			else if(current_url.indexOf('/master/label_kegiatan') != -1)
			{
				console.log('halaman Master Label Kegiatan');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_label_giat">Singkron ke DB Lokal</button>'											
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_label_giat').on('click', function(){
					singkron_label_giat();
				});
			}
			// Data Master Akun
			else if(current_url.indexOf('/master/akun') != -1)
			{
				console.log('halaman Master Akun Belanja');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_akun_ke_lokal">Singkron ke DB Lokal</button>'					
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_akun_ke_lokal').on('click', function(){
					singkron_akun_ke_lokal();
				});
			}
			// Data Master Sumber Dana
			else if(current_url.indexOf('/master/sumber_dana') != -1)
			{
				console.log('halaman Master Sumber Dana');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_sumber_dana_lokal">Singkron ke DB Lokal</button>'					
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_sumber_dana_lokal').on('click', function(){
					singkron_sumber_dana_lokal();
				});
			}
			// Kamus Usulan
			else if(current_url.indexOf('/settings/kamus_usulan/asmas') != -1){
				console.log('halaman Kamus Usulan Aspirasi Masyarakat');
				tipe = 'asmas';
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_kamus_usulan_pokir">Singkron Kamus '+tipe+' ke DB Lokal</button>'
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_kamus_usulan_pokir').on('click', function(){
					singkron_kamus_usulan_pokir(tipe);
				});
			}
			else if(current_url.indexOf('/settings/kamus_usulan/reses') != -1)
			{
				console.log('halaman Kamus Usulan Aspirasi Anggota Dewan (Pokir / Reses)');
				tipe = 'reses';
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_kamus_usulan_pokir">Singkron Kamus '+tipe+' ke DB Lokal</button>'
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_kamus_usulan_pokir').on('click', function(){
					singkron_kamus_usulan_pokir(tipe);
				});
			}
			// Data Usulan Asmas
			else if(current_url.indexOf('/usulan/usulan-aspirasi') != -1)
			{
				if(current_url.indexOf('/usulan/usulan-aspirasi/pengajuan') != -1){
					console.log('halaman Usulan Aspirasi Masyarakat');
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_asmas_lokal">Singkron ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_asmas_lokal').on('click', function(){
						singkron_asmas_lokal();
					});
				}
				else if(current_url.indexOf('/usulan/usulan-aspirasi/monitor') != -1)
				{
					console.log('halaman Usulan Aspirasi Masyarakat');
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_asmas_lokal">Singkron ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_asmas_lokal').on('click', function(){
						singkron_asmas_lokal();
					});
				}
			}		
			// Data Usulan Pokir
			else if(current_url.indexOf('/usulan/usulan-pokir') != -1)
			{		
				if(current_url.indexOf('/usulan/usulan-pokir/pengajuan') != -1){
					console.log('halaman Usulan Aspirasi Anggota Dewan (Pokir / Reses)');
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_pokir_lokal">Singkron ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_pokir_lokal').on('click', function(){
						singkron_pokir_lokal();
					});
				}
				else if(current_url.indexOf('usulan/usulan-pokir/monitor') != -1)
				{
					console.log('halaman Usulan Aspirasi Anggota Dewan (Pokir / Reses)');
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_pokir_lokal">Singkron ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_pokir_lokal').on('click', function(){
						singkron_pokir_lokal();
					});
				}
			}
			// Standar Harga
			else if(current_url.indexOf('/standar_harga') != -1)
			{	
				if ([2, 6, 10, 14].includes(_token.level_id) )
				{
					window.type_data_ssh = 'ssh';
					if(current_url.indexOf('/standar_harga/ssh') != -1){
						type_data_ssh = 'SSH';
					}else if(current_url.indexOf('/standar_harga/hspk') != -1){
						type_data_ssh = 'HSPK';
					}else if(current_url.indexOf('/standar_harga/asb') != -1){
						type_data_ssh = 'ASB';
					}else if(current_url.indexOf('/standar_harga/sbu') != -1){
						type_data_ssh = 'SBU';
					}
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="hapus_arsip_ssh">Kosongkan Arsip '+type_data_ssh+'</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_ssh_ke_lokal">Singkron '+type_data_ssh+' ke DB Lokal</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-info" id="singkron_kategori_ke_lokal">Singkron Kelompok '+type_data_ssh+' ke DB Lokal</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-primary" id="singkron_satuan_ke_lokal">Singkron Satuan ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					var btn2 = ''
						+'<div class="aksi-extension">'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="cek_duplikat_ssh">Cek Duplikat '+type_data_ssh+'</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="set_mulit_rek">Set Multi Rek. Belanja '+type_data_ssh+'</button>'
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-primary" id="singkron_dari_db_lokal">Singkron '+type_data_ssh.toUpperCase()+' dari Lokal</button>'
						+'</div>';
					jQuery('#aksi-admin').append(btn2);				
					jQuery('#singkron_dari_db_lokal').on('click', function(){
						get_usulan_ssh_dari_lokal(type_data_ssh);
					});	
					jQuery('#singkron_ssh_ke_lokal').on('click', function(){
						singkron_ssh_ke_lokal(type_data_ssh);
					});
					jQuery('#singkron_satuan_ke_lokal').on('click', function(){
						singkron_satuan_ke_lokal();
					});
					jQuery('#singkron_kategori_ke_lokal').on('click', function(){
						show_loading();
						singkron_kategori_ke_lokal()
						.then(function(){
							alert('Berhasil singkron kategori standar harga!');
							hide_loading();
						})
					});
					jQuery('#hapus_arsip_ssh').on('click', function(){
						hapus_arsip_ssh(type_data_ssh);
					});
					jQuery('#cek_duplikat_ssh').on('click', function(){
						cek_duplikat_ssh(type_data_ssh);
					});
					jQuery('#set_mulit_rek').on('click', function(){
						set_mulit_rek();
					});						
					jQuery('#show_id_ssh').on('click', function(){
						show_id_ssh();
					});
					jQuery('#show_akun_ssh').on('click', function(){							
						show_akun_ssh();
					});						
					var modal = ''
						+'<div class="modal fade modal-extension" id="usulan-ssh" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999">'
					        +'<div class="modal-dialog" style="min-width: 90%;" role="document">'
					            +'<div class="modal-content">'
					                +'<div class="modal-header bgpanel-theme">'
					                    +'<h4 class="modal-title" id="">Daftar Usulan Satuan Harga <span class="info-title"></span></h4>'
										+'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
					                +'</div>'
					                +'<div class="modal-body">'
					                  	+'<table class="table table-hover table-striped" id="usulan-ssh-table" style="width: 100%;">'
					                      	+'<thead>'
					                        	+'<tr>'
					                          		+'<th class="text-center"><input type="checkbox" id="select-all-usulan-ssh"></th>'
					                          		+'<th class="text-center">Kode Standar Harga Lokal</th>'
					                          		+'<th class="text-center">Jenis Usulan</th>'
					                          		+'<th class="text-center">Nama</th>'
					                          		+'<th class="text-center">Spesifikasi</th>'
					                          		+'<th class="text-center">Satuan</th>'
					                          		+'<th class="text-center">Harga</th>'
					                          		+'<th class="text-center">TKDN</th>'
					                          		+'<th class="text-center">Akun</th>'
					                        	+'</tr>'
					                      	+'</thead>'
					                      	+'<tbody></tbody>'
					                  	+'</table>'
					                +'</div>'
					                +'<div class="modal-footer">'
					                    +'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'
					                    +'<button type="button" class="btn btn-danger" id="usulan-ssh-sipd">Simpan</button>'
					                +'</div>'
					            +'</div>'
					        +'</div>'
					    +'</div>'
						+'<div class="modal fade modal-extension" id="modal-extension" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
							+'<div class="modal-dialog" style="max-width: 900px;" role="document">'
								+'<div class="modal-content">'
									+'<div class="modal-header bgpanel-theme">'													
										+'<h4 class="modal-title text-center" style="font-weight: bold;" id="">Duplikat Standar Harga <span class="info-title"></span></h4>'
										+'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
									+'</div>'
									+'<div class="modal-body">'
										+'<table class="table table-bordered table-hover" id="table_duplikat">'
											+'<thead>'
												+'<tr>'
													+'<th class="text-center" style="font-weight: bold;">No</th>'
													+'<th class="text-center" style="font-weight: bold;"><input type="checkbox" id="select_all_hapus_ssh"></th>'												
													+'<th class="text-center" style="font-weight: bold;">ID</th>'
													+'<th class="text-left" style="font-weight: bold;">Kode Standar Harga</th>'
													+'<th class="text-left" style="font-weight: bold;">Uraian</th>'
													+'<th class="text-left" style="font-weight: bold;">Spesifikasi</th>'
													+'<th class="text-center" style="font-weight: bold;">Satuan</th>'
													+'<th class="text-left" style="font-weight: bold;">Harga</th>'										
												+'</tr>'
											+'</thead>'
											+'<tbody></tbody>'
										+'</table>'
									+'</div>'
									+'<div class="modal-footer">'
										+'<button type="button" class="btn btn-danger" id="hapus-duplikat">Hapus Komponen</button>'
										+'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'							
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
						+'<div class="modal fade modal-extension" id="modal-extension-rekening" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
						+'<div class="modal-dialog" style="max-width: 1200px;" role="document">'
							+'<div class="modal-content">'
								+'<div class="modal-header bgpanel-theme">'
									+'<h3 class="fw-bolder m-0">Tambah Rekening</h4>'
									+'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
								+'</div>'
								+'<div class="modal-body">'
									+'<table class="table table-bordered table-hover" id="table-extension-rekening">'											
										+'<thead>'
											+'<tr>'													
												+'<th class="text-center" style="font-weight: bold; max-width: 200px;"><input type="checkbox" id="select_all_akun"></th>'
												+'<th class="text-center" style="font-weight: bold;">Id Akun</th>'
												+'<th class="text-left" style="font-weight: bold;">Kode</th>'
												+'<th class="text-left" style="font-weight: bold;">Uraian</th>'							
											+'</tr>'
										+'</thead>'
										+'<tbody></tbody>'
									+'</table>'
								+'</div>'
								+'<div class="modal-footer">'
									+'<button type="button" class="btn btn-primary" id="proses_simpan_multirek">Simpan</button>'
									+'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'							
								+'</div>'
							+'</div>'
						+'</div>'
					+'</div>';
					jQuery('body').append(modal);
					jQuery('#select_all_hapus_ssh').on('click', function(){
						var cek = jQuery(this).is(':checked');
						jQuery('#table_duplikat tbody tr input[type="checkbox"]').prop('checked', cek);
					});
					jQuery('#select-all-usulan-ssh').on('click', function(){
						if(jQuery(this).is(':checked')){
							jQuery('#usulan-ssh tbody input[type="checkbox"]').prop('checked', true);
						}else{
							jQuery('#usulan-ssh tbody input[type="checkbox"]').prop('checked', false);
						}
					});
					jQuery('#usulan-ssh-sipd').on('click', function(){
						singkron_usulan_ssh_dari_lokal_modal();
					});
					jQuery('#hapus-duplikat').on('click', function(){
						hapus_duplikat_ssh();
					});
					jQuery('body').on('click', '#select_all_akun', function(){
						var cek = jQuery(this).is(':checked');
						jQuery(this).closest('table').find('tbody tr input[type="checkbox"]').prop('checked', cek);
					});
					jQuery('#proses_simpan_multirek').on('click', function(){
						proses_simpan_multirek();
					});
				}		
			}
			// Renja Belanja
			else if(current_url.indexOf('/perencanaan/renja/') != -1)
			{		
				var id_skpd = getUrlVars("id_skpd");
				var rekap_suber_dana = ''
					+'<button style="margin-left: 20px;" class="btn btn-sm btn-success btn-outline" id="rekap_sumber_dana">'
						+'<i class="menu-eye m-r-5"></i> <span>Lihat Rekap Sumber Dana</span>'
					+'</button>'
					+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning btn-outline" id="singkron_indikator_sub">'
						+'<i class="menu-download m-r-5"></i> <span>Singkron Master Indikator ke DB Lokal</span>'
					+'</button>';
				var singkron_rka = ''
					+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning btn-outline" id="open_modal_skpd">'
						+'<i class="menu-download m-r-5"></i> <span>Singkron RKA ke DB lokal</span>'
					+'</button>';
				// idunit=_token.unit;				
				if(current_url.indexOf('/perencanaan/renja/cascading/belanja?id_skpd='+id_skpd) != -1){			
					console.log('halaman Renja SKPD');
					singkron_rka += ''
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger btn-outline" id="get_renja_lokal">'
							+'<i class="menu-download m-r-5"></i> <span>Tarik RENJA dari DB lokal</span>'
						+'</button>';
					window.idunitskpd = id_skpd;
					var modal = ''
						+'<div class="modal fade modal-extension" id="modal-extension" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
							+'<div class="modal-dialog" style="max-width: 900px;" role="document">'
								+'<div class="modal-content">'
									+'<div class="modal-header bgpanel-theme">'
										+'<h3 class="fw-bolder m-0">Sinkronisasi Sub Kegiatan Renja Unit SKPD</h4>'
										+'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
									+'</div>'
									+'<div class="modal-body">'
										+'<table class="table table-bordered table-hover" id="table-extension">'
											+'<thead>'
												+'<tr>'
													+'<th class="text-center" style="font-weight: bold;"><input type="checkbox" id="modal_cek_all"></th>'												
													+'<th class="text-left" style="font-weight: bold;">Sub Kegiatan</th>'
													+'<th class="text-center" style="font-weight: bold;">Keterangan</th>'											
												+'</tr>'
											+'</thead>'
											+'<tbody></tbody>'
										+'</table>'
									+'</div>'
									+'<div class="modal-footer">'
										+'<button type="button" class="btn btn-primary" id="proses-extension">Singkronisasi Data SKPD</button>'
										+'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'							
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>'
						+'<div class="modal fade modal-extension" id="modal-extension-renja-lokal" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
							+'<div class="modal-dialog" style="max-width: 1200px;" role="document">'
								+'<div class="modal-content">'
									+'<div class="modal-header bgpanel-theme">'
										+'<h3 class="fw-bolder m-0">Sinkronisasi Sub Kegiatan Renja WP-SIPD</h4>'
										+'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
									+'</div>'
									+'<div class="modal-body">'
										+'<table class="table table-bordered table-hover" id="table-extension-renja-lokal">'
											+'<thead>'
												+'<tr>'
													+'<th class="text-center" style="font-weight: bold;"><input type="checkbox" id="modal_cek_all"></th>'
													+'<th class="text-left" style="font-weight: bold;">Perangkat Daerah</th>'
													+'<th class="text-left" style="font-weight: bold;">Program</th>'
													+'<th class="text-left" style="font-weight: bold;">Kegiatan</th>'
													+'<th class="text-left" style="font-weight: bold;">Sub Kegiatan</th>'
													+'<th class="text-left" style="font-weight: bold;">Keterangan</th>'											
												+'</tr>'
											+'</thead>'
											+'<tbody></tbody>'
										+'</table>'
									+'</div>'
									+'<div class="modal-footer">'
										+'<button type="button" class="btn btn-danger" id="hapus-sub-keg">Hapus Sub Kegiatan Not Exist</button>'
										+'<button type="button" class="btn btn-primary" id="proses-extension-renja-lokal">Proses</button>'
										+'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'							
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';
					jQuery('body').append(modal);			
					jQuery('body').on('click', '#modal_cek_all', function(){
						var cek = jQuery(this).is(':checked');
						jQuery(this).closest('table').find('tbody tr input[type="checkbox"]').prop('checked', cek);
					});	
					jQuery('#proses-extension').on('click', function(){
						singkron_subgiat_modal();
					});
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<label><input type="checkbox" id="only_pagu"> Hanya Pagu SKPD</label>'
							+singkron_rka
						+'</div>';				
					jQuery('.page-title').append(btn);
					jQuery('#get_renja_lokal').on('click', function(){
						get_renja_lokal();
					});
					jQuery('#open_modal_skpd').on('click', function(){
						open_modal_subgiat(id_skpd);
					});
					jQuery('#proses-extension-renja-lokal').on('click', function(){
						proses_modal_renja();
					});
					jQuery('#hapus-sub-keg').on('click', function(){
						hapus_modal_renja();
					});
					if(jQuery('#singkron_master_cse').length == 0){
						var master_html = ''
							+'<button onclick="return false;" class="btn btn-sm btn-primary" id="singkron_master_cse" style="margin-left: 5px;">Singkron Data Master ke DB Lokal</button>'
							+'<select class="form-control" style="width: 300px; margin-left: 5px;" id="data_master_cse">'
								+'<option value="">Pilih Data Master</option>'
								+'<option value="penerima_bantuan">Master Data Penerima Bantuan</option>'
								+'<option value="alamat">Master Data Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan</option>'
							+'</select>';
						jQuery('#aksi-admin').append(master_html);
						jQuery('#singkron_master_cse').on('click', function(){
							var val = jQuery('#data_master_cse').val();
							if(val == ''){
								alert('Data Master tidak boleh kosong!');
							}else{
								singkron_master_cse(val);
							}
						});
					}
				}
				else if(current_url.indexOf('/perencanaan/renja/cascading') != -1){				
					console.log('halaman Renja list SKPD oleh admin TAPD');
					var modal = ''
						+'<div class="modal fade modal-extension" id="modal-extension" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true" style="z-index: 99999; background: #0000003d;">'
							+'<div class="modal-dialog" style="max-width: 900px;" role="document">'
								+'<div class="modal-content">'
									+'<div class="modal-header bgpanel-theme">'
										+'<h3 class="fw-bolder m-0">Sinkronisasi Renja Unit SKPD</h4>'
										+'<button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"></button>'
									+'</div>'
									+'<div class="modal-body">'
										+'<table class="table table-bordered table-hover" id="table-extension">'
											+'<thead>'
												+'<tr>'
													+'<th class="text-center" style="font-weight: bold;"><input type="checkbox" id="modal_cek_all"></th>'
													+'<th class="text-center" style="font-weight: bold;">SKPD</th>'
													+'<th class="text-center" style="font-weight: bold;">Keterangan</th>'
												+'</tr>'
											+'</thead>'
											+'<tbody></tbody>'
										+'</table>'
									+'</div>'
									+'<div class="modal-footer">'
										+'<button type="button" class="btn btn-sm btn-danger" id="hapus-sub-keg">Hapus Sub Kegiatan Not Exist</button>'
										+'<button type="button" class="btn btn-sm btn-success" id="tarik-data-lokal">Tarik Data dari DB Lokal</button>'
										+'<button type="button" class="btn btn-sm btn-danger setting-kegiatan" id="kunci-tambah-kegiatan">Kunci Tambah Kegiatan</button>'
										+'<button type="button" class="btn btn-sm btn-danger setting-kegiatan" id="buka-tambah-kegiatan">Buka Tambah Kegiatan</button>'
										+'<button type="button" class="btn btn-sm btn-warning setting-kegiatan" id="kunci-kegiatan">Kunci Kegiatan</button>'
										+'<button type="button" class="btn btn-sm btn-warning setting-kegiatan" id="buka-kegiatan">Buka Kegiatan</button>'
										+'<button type="button" class="btn btn-sm btn-primary" id="proses-extension">Backup Data ke DB Lokal</button>'
										+'<button type="button" class="btn btn-sm btn-default" data-dismiss="modal">Tutup</button>'							
									+'</div>'
								+'</div>'
							+'</div>'
						+'</div>';	
					jQuery('body').append(modal);			
					jQuery('#modal_cek_all').on('click', function(){
						var cek = jQuery(this).is(':checked');
						jQuery('#table-extension tbody tr input[type="checkbox"]').prop('checked', cek);
					});	
					jQuery('#proses-extension').on('click', function(){
						singkron_skpd_modal();
					});
					jQuery('.setting-kegiatan').on('click', function(){
						var id = jQuery(this).attr('id');
						proses_setting_kegiatan(id);
					});
					jQuery('#tarik-data-lokal').on('click', function(){
						proses_setting_kegiatan('buka-tambah-kegiatan', true);
					});
					jQuery('#hapus-sub-keg').on('click', function(){
						proses_setting_kegiatan('hapus-sub-kegiatan', true);
					});
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<label><input type="checkbox" id="only_pagu"> Hanya Pagu SKPD</label>'
							+singkron_rka
						+'</div>';				
					jQuery('.page-title').append(btn);
					jQuery('#open_modal_skpd').on('click', function(){
						window.idunitskpd=0;
						open_modal_skpd();
					});
				}
			}
			// Pendapatan
			else if(current_url.indexOf('/pendapatan') != -1){
				console.log('halaman pendapatan');
				jQuery('.aksi-extension').remove();
				var btn = ''
					+'<div class="aksi-extension">'						
						+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_pendapatan_lokal">Singkron ke DB Lokal</button>'
					+'</div>';
				jQuery('.page-title').append(btn);
				jQuery('#singkron_pendapatan_lokal').on('click', function(){
					singkron_pendapatan_lokal();
				});
			}
			// Pembiayaan
			else if(current_url.indexOf('/pembiayaan') != -1)
			{
				if(current_url.indexOf('/pembiayaan/penerimaan') != -1){
					tipe = 'penerimaan';
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_pembiayaan_lokal">Singkron '+tipe+' ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_pembiayaan_lokal').on('click', function(){
						singkron_pembiayaan_lokal(tipe);
					});
				}
				else if(current_url.indexOf('/pembiayaan/pengeluaran') != -1){
					tipe = 'pengeluaran';
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_pembiayaan_lokal">Singkron '+tipe+' ke DB Lokal</button>'
						+'</div>';
					jQuery('.page-title').append(btn);
					jQuery('#singkron_pembiayaan_lokal').on('click', function(){
						singkron_pembiayaan_lokal(tipe);
					});
				}
			}
			cek_reload = false;
		// jika halaman login
		}else if(
			current_url.indexOf('/landing-page') != -1
			|| current_url.indexOf('/tahun/list') != -1
		){
			cek_reload = false;
		}else if(current_url.indexOf('/auth/login') != -1){
			var lihat_pass = ''
				+'<label style="margin-top: 15px; margin-bottom: 15px;"><input type="checkbox" onclick="lihat_password(this)"> Lihat Password</label>'
				+'<a class="btn btn-lg btn-warning w-100" onclick="login_sipd()">Login Chrome Extension</a>';
			var password = jQuery('input[name="password"]');
			if(password.length >= 1){
				password.after(lihat_pass);
				cek_reload = false;
				jQuery('#prov-autocomplete').after('<span style="color: red; font-weight: bold" id="id_prov"></span>')
				jQuery('#prov-autocomplete').on('change paste keyup', function(){
					var prov = jQuery(this).val();
					console.log('get_prov_login', prov);
					if(prov == ''){
						return;
					}
					get_prov_login()
					.then(function(prov_all){
						prov_all.map(function(b, i){
							if(b.nama_daerah == prov){
								jQuery('#id_prov').html('id_prov = '+b.id_daerah+' | kode = '+b.kode_ddn+' | '+b.nama_daerah);
								jQuery('#id_prov').attr('id_prov', b.id_daerah);
							}
						});
					});
				});
				jQuery('#kabkot-autocomplete').after('<span style="color: red; font-weight: bold" id="id_kab"></span>')
				jQuery('#kabkot-autocomplete').on('change paste keyup', function(){
					var id_prov = jQuery('#id_prov').attr('id_prov');
					var kab = jQuery(this).val();
					console.log('get_kab_login', kab, id_prov);
					if(kab == '' || typeof id_prov == 'undefined' || id_prov == ''){
						return;
					}
					get_kab_login(id_prov)
					.then(function(kab_all){
						kab_all.map(function(b, i){
							if(b.nama_daerah == kab){
								jQuery('#id_kab').html('id_kab = '+b.id_daerah+' | kode = '+b.kode_ddn+' | '+b.nama_daerah);
							}
						});
					});
				});

				var lihat_id = ''
					+'<span style="margin-top: 15px; margin-bottom: 15px;" class="btn btn-sm btn-info" id="lihat_id_daerah"> Lihat ID daerah</span>';
				jQuery('label[for="prov-autocomplete"]').before(lihat_id);
				jQuery('#lihat_id_daerah').on('click', function(){
					lihat_id_daerah();
				});
			}
		}

		// ulangi cek url
		if(cek_reload){
			current_url = window.location.href;
			cekUrl(current_url, nomor+1);
		}
	}, 1000);
}