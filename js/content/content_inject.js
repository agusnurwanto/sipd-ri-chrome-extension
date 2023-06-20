jQuery(document).on('show.bs.modal', '.modal-extension', function(event) { 
	jQuery(this).addClass('show');
	jQuery('.modal-backdrop').addClass('show');
	jQuery(this).find(".modal-body > table").DataTable(options_datatable);
});
jQuery(document).on('hide.bs.modal', '.modal-extension', function(event) { 
	jQuery(this).find(".modal-body table.dataTable").DataTable().destroy();
	jQuery('.modal-backdrop').removeClass('show');
	jQuery(this).removeClass('show');
});
const auth_key = 'v8.0.38-authf649fc9a5f55';

function lihat_password(that){
	if(jQuery(that).is(':checked')){
		jQuery('input[name="password"]').attr('type', 'text');
	}else{
		jQuery('input[name="password"]').attr('type', 'password');
	}
}

function login_sipd(){
	var user = jQuery('input[name="email"]').val();
	var pass = jQuery('input[name="password"]').val();
	jQuery('#wrap-loading').show();
	relayAjax({
		url: config.sipd_url + 'api/auth/auth/login',
		cache: true,
		type: 'post',
		data: {
			username: user,
			password: pass,
			id_daerah: config.id_daerah
		},
		success: function(ret){
			console.log(ret);
			jQuery('#wrap-loading').hide();
			localStorage.setItem(auth_key, JSON.stringify(ret));
			localStorage.setItem('login-detail', JSON.stringify({
				username: user,
				password: pass,
				id_daerah: config.id_daerah
			}));
			window.location.href = config.sipd_url;
		}
	});
}

function ganti_tahun(){
    localStorage.removeItem("sipd-konfigurasi-tahun");
    localStorage.removeItem("sipd-konfigurasi");
	window.location.href = config.sipd_url+'tahun/list';
}

function logout(){
    localStorage.removeItem(auth_key);
    localStorage.removeItem("sipd-konfigurasi-tahun");
    localStorage.removeItem("sipd-konfigurasi");
    localStorage.removeItem("sipd-konfigurasi-id_daerah");
    localStorage.removeItem("sipd-konfigurasi-unit-set");
	window.location.href = config.sipd_url;
}