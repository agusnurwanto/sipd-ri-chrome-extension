_interval = false;

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
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-success" id="set_mulit_rek">Set Multi Kode SH dan Rek. Belanja '+type_data_ssh+'</button>'
								// +'<button style="margin-left: 20px;" class="btn btn-sm btn-info" id="show_id_ssh">Tampilkan ID Standar Harga</button>'
								// +'<button style="margin-left: 20px;" class="btn btn-sm btn-primary" id="show_akun_ssh">Tampilkan Link Akun</button>'
							+'</div>';
						jQuery('#aksi-admin').append(btn2);						
						jQuery('#singkron_ssh_ke_lokal').on('click', function(){
							singkron_ssh_ke_lokal(type_data_ssh);
						});
						jQuery('#singkron_satuan_ke_lokal').on('click', function(){
							singkron_satuan_ke_lokal();
						});
						jQuery('#singkron_kategori_ke_lokal').on('click', function(){
							singkron_kategori_ke_lokal();
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
						var simpan_multiaddkompakun = ''
							+'<button type="button" class="btn btn-danger" name="simpan_multiaddkompakun" id="simpan_multiaddkompakun">Simpan</button>';
						jQuery('app-ssh-form-akun .card-footer').prepend(simpan_multiaddkompakun);
						run_script("jQuery('.ngb-modal-window > div > div > app-ssh-form-akun').modal('show')').on('hidden.bs.modal', function () {"
							+"jQuery('#simpan_addkompakun').show();"
							+"jQuery('#simpan_multiaddkompakun').hide();"
							+"jQuery('select[name=kompakun]').val('').trigger('change');"
						+"});");
						jQuery('#show_id_ssh').on('click', function(){
							show_id_ssh();
						});
						jQuery('#show_akun_ssh').on('click', function(){							
							show_akun_ssh();
						});
						jQuery('body').on('click', '.checkall-ssh', function(){
							jQuery('.sipd-table tbody > tr > td .checkbox_ssh').prop('checked', jQuery(this).is(':checked'));
						});
						var modal = ''
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
							+'</div>';
						jQuery('body').append(modal);
						jQuery('#select_all_hapus_ssh').on('click', function(){
							var cek = jQuery(this).is(':checked');
							jQuery('#table_duplikat tbody tr input[type="checkbox"]').prop('checked', cek);
						});	
						jQuery('#hapus-duplikat').on('click', function(){
							hapus_duplikat_ssh();
						});

						jQuery('#usulan-ssh-sipd').on('click', function(){
							var list_usulan_selected = [];
							var nama_usulan = [];
							jQuery('#usulan-ssh-table tbody input[type="checkbox"]').map(function(i, b){
								if(jQuery(b).is(':checked')){
									var data = data_usulan_ssh[jQuery(b).val()];
									list_usulan_selected.push(data);
									nama_usulan.push(data.nama_standar_harga);
								}
							});
							if(list_usulan_selected.length == 0){
								alert('Pilih dulu item SSH yang akan disimpan!');
							}else{
								console.log('list_usulan_selected', list_usulan_selected);
								if (confirm('Apakah anda yakin menyimpan data ini? '+nama_usulan.join(','))) {
									simpan_usulan_ssh(list_usulan_selected);
								}
							}
						});
					}else if(current_url.indexOf('/standar_harga/hspk') != -1){
						type_data_ssh = 'HSPK';
						jQuery('.aksi-extension').remove();
						var btn = ''
							+'<div class="aksi-extension">'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="hapus_arsip_ssh">Kosongkan Arsip '+type_data_ssh+'</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_ssh_ke_lokal">Singkron '+type_data_ssh+' ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-info" id="singkron_kategori_ke_lokal">Singkron Kelompok '+type_data_ssh+' ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-primary" id="singkron_satuan_ke_lokal">Singkron Satuan ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="cek_duplikat_ssh">Cek Duplikat '+type_data_ssh+'</button>'
							+'</div>';
						jQuery('.page-title').append(btn);
						jQuery('#singkron_ssh_ke_lokal').on('click', function(){
							singkron_ssh_ke_lokal(type_data_ssh);
						});
						jQuery('#singkron_satuan_ke_lokal').on('click', function(){
							singkron_satuan_ke_lokal();
						});
						jQuery('#singkron_kategori_ke_lokal').on('click', function(){
							singkron_kategori_ke_lokal();
						});
						jQuery('#hapus_arsip_ssh').on('click', function(){
							hapus_arsip_ssh(type_data_ssh);
						});
						jQuery('#cek_duplikat_ssh').on('click', function(){
							cek_duplikat_ssh(type_data_ssh);
						});
						var modal = ''
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
							+'</div>';;
						jQuery('body').append(modal);
						jQuery('#select_all_hapus_ssh').on('click', function(){
							var cek = jQuery(this).is(':checked');
							jQuery('#table_duplikat tbody tr input[type="checkbox"]').prop('checked', cek);
						});	
						jQuery('#hapus-duplikat').on('click', function(){
							hapus_duplikat_ssh();
						});

						jQuery('#usulan-ssh-sipd').on('click', function(){
							var list_usulan_selected = [];
							var nama_usulan = [];
							jQuery('#usulan-ssh-table tbody input[type="checkbox"]').map(function(i, b){
								if(jQuery(b).is(':checked')){
									var data = data_usulan_ssh[jQuery(b).val()];
									list_usulan_selected.push(data);
									nama_usulan.push(data.nama_standar_harga);
								}
							});
							if(list_usulan_selected.length == 0){
								alert('Pilih dulu item SSH yang akan disimpan!');
							}else{
								console.log('list_usulan_selected', list_usulan_selected);
								if (confirm('Apakah anda yakin menyimpan data ini? '+nama_usulan.join(','))) {
									simpan_usulan_ssh(list_usulan_selected);
								}
							}
						});
					}
					else if(current_url.indexOf('/standar_harga/asb') != -1){
						type_data_ssh = 'ASB';
						jQuery('.aksi-extension').remove();
						var btn = ''
							+'<div class="aksi-extension">'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="hapus_arsip_ssh">Kosongkan Arsip '+type_data_ssh+'</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_ssh_ke_lokal">Singkron '+type_data_ssh+' ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-info" id="singkron_kategori_ke_lokal">Singkron Kelompok '+type_data_ssh+' ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-primary" id="singkron_satuan_ke_lokal">Singkron Satuan ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="cek_duplikat_ssh">Cek Duplikat '+type_data_ssh+'</button>'
							+'</div>';
						jQuery('.page-title').append(btn);
						jQuery('#singkron_ssh_ke_lokal').on('click', function(){
							singkron_ssh_ke_lokal(type_data_ssh);
						});
						jQuery('#singkron_satuan_ke_lokal').on('click', function(){
							singkron_satuan_ke_lokal();
						});
						jQuery('#singkron_kategori_ke_lokal').on('click', function(){
							singkron_kategori_ke_lokal();
						});
						jQuery('#hapus_arsip_ssh').on('click', function(){
							hapus_arsip_ssh(type_data_ssh);
						});
						jQuery('#cek_duplikat_ssh').on('click', function(){
							cek_duplikat_ssh(type_data_ssh);
						});

						var modal = ''
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
							+'</div>';;
						jQuery('body').append(modal);
						jQuery('#select_all_hapus_ssh').on('click', function(){
							var cek = jQuery(this).is(':checked');
							jQuery('#table_duplikat tbody tr input[type="checkbox"]').prop('checked', cek);
						});	
						jQuery('#hapus-duplikat').on('click', function(){
							hapus_duplikat_ssh();
						});

						jQuery('#usulan-ssh-sipd').on('click', function(){
							var list_usulan_selected = [];
							var nama_usulan = [];
							jQuery('#usulan-ssh-table tbody input[type="checkbox"]').map(function(i, b){
								if(jQuery(b).is(':checked')){
									var data = data_usulan_ssh[jQuery(b).val()];
									list_usulan_selected.push(data);
									nama_usulan.push(data.nama_standar_harga);
								}
							});
							if(list_usulan_selected.length == 0){
								alert('Pilih dulu item SSH yang akan disimpan!');
							}else{
								console.log('list_usulan_selected', list_usulan_selected);
								if (confirm('Apakah anda yakin menyimpan data ini? '+nama_usulan.join(','))) {
									simpan_usulan_ssh(list_usulan_selected);
								}
							}
						});
					}
					else if(current_url.indexOf('/standar_harga/sbu') != -1){
						type_data_ssh = 'SBU';
						jQuery('.aksi-extension').remove();
						var btn = ''
							+'<div class="aksi-extension">'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-warning" id="hapus_arsip_ssh">Kosongkan Arsip '+type_data_ssh+'</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="singkron_ssh_ke_lokal">Singkron '+type_data_ssh+' ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-info" id="singkron_kategori_ke_lokal">Singkron Kelompok '+type_data_ssh+' ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-primary" id="singkron_satuan_ke_lokal">Singkron Satuan ke DB Lokal</button>'
								+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger" id="cek_duplikat_ssh">Cek Duplikat '+type_data_ssh+'</button>'
							+'</div>';
						jQuery('.page-title').append(btn);
						jQuery('#singkron_ssh_ke_lokal').on('click', function(){
							singkron_ssh_ke_lokal(type_data_ssh);
						});
						jQuery('#singkron_satuan_ke_lokal').on('click', function(){
							singkron_satuan_ke_lokal();
						});
						jQuery('#singkron_kategori_ke_lokal').on('click', function(){
							singkron_kategori_ke_lokal();
						});
						jQuery('#hapus_arsip_ssh').on('click', function(){
							hapus_arsip_ssh(type_data_ssh);
						});
						jQuery('#cek_duplikat_ssh').on('click', function(){
							cek_duplikat_ssh(type_data_ssh);
						});

						var modal = ''
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
							+'</div>';;
						jQuery('body').append(modal);
						jQuery('#select_all_hapus_ssh').on('click', function(){
							var cek = jQuery(this).is(':checked');
							jQuery('#table_duplikat tbody tr input[type="checkbox"]').prop('checked', cek);
						});	
						jQuery('#hapus-duplikat').on('click', function(){
							hapus_duplikat_ssh();
						});

						jQuery('#usulan-ssh-sipd').on('click', function(){
							var list_usulan_selected = [];
							var nama_usulan = [];
							jQuery('#usulan-ssh-table tbody input[type="checkbox"]').map(function(i, b){
								if(jQuery(b).is(':checked')){
									var data = data_usulan_ssh[jQuery(b).val()];
									list_usulan_selected.push(data);
									nama_usulan.push(data.nama_standar_harga);
								}
							});
							if(list_usulan_selected.length == 0){
								alert('Pilih dulu item SSH yang akan disimpan!');
							}else{
								console.log('list_usulan_selected', list_usulan_selected);
								if (confirm('Apakah anda yakin menyimpan data ini? '+nama_usulan.join(','))) {
									simpan_usulan_ssh(list_usulan_selected);
								}
							}
						});
					}
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
					+'</button>'
					+'<button style="margin-left: 20px;" class="btn btn-sm btn-danger btn-outline" id="open_modal_skpd_import">'
						+'<i class="menu-download m-r-5"></i> <span>Tarik RENJA dari DB lokal</span>'
					+'</button>';
				// idunit=_token.unit;				
				if(current_url.indexOf('/perencanaan/renja/cascading/belanja?id_skpd='+id_skpd) != -1){			
					console.log('halaman Renja SKPD');
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
						+'</div>';
					jQuery('body').append(modal);			
					jQuery('#modal_cek_all').on('click', function(){
						var cek = jQuery(this).is(':checked');
						jQuery('#table-extension tbody tr input[type="checkbox"]').prop('checked', cek);
					});	
					jQuery('#proses-extension').on('click', function(){
						singkron_skpd_modal();
					});
					jQuery('.aksi-extension').remove();
					var btn = ''
						+'<div class="aksi-extension">'						
							+'<label><input type="checkbox" id="only_pagu"> Hanya Pagu SKPD</label>'
							+singkron_rka
						+'</div>';				
					jQuery('.page-title').append(btn);
					jQuery('#open_modal_skpd').on('click', function(){										
						open_modal_skpd();
					});
				}
				else if(current_url.indexOf('/perencanaan/renja/cascading') != -1){				
					console.log('halaman Renja list SKPD oleh admin TAPD');	
					idunitskpd=0;
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
										+'<button type="button" class="btn btn-primary" id="proses-extension">Singkronisasi Data SKPD</button>'
										+'<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>'							
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
					setTimeout(function(){
						jQuery('.aksi-extension').remove();
						var btn = ''
							+'<div class="aksi-extension">'						
								+'<label><input type="checkbox" id="only_pagu"> Hanya Pagu SKPD</label>'
								+singkron_rka
							+'</div>';				
						jQuery('.page-title').append(btn);
						jQuery('#open_modal_skpd').on('click', function(){										
						open_modal_skpd();
						});
					}, 1000);
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
			}
		}

		// ulangi cek url
		if(cek_reload){
			cekUrl(current_url, nomor+1);
		}
	}, 1000);
}