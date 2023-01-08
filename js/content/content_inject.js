jQuery(document).on('show.bs.modal', '.modal-extension', function(event) { 
	jQuery(this).addClass('show');
});
jQuery(document).on('hide.bs.modal', '.modal-extension', function(event) { 
	jQuery(this).removeClass('show');
});

function lihat_password(that){
	if(jQuery(that).is(':checked')){
		jQuery('input[name="password"]').attr('type', 'text');
	}else{
		jQuery('input[name="password"]').attr('type', 'password');
	}
}