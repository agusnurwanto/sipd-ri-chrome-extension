jQuery(document).on('show.bs.modal', '#modal', function(event) { 
	
});

function lihat_password(that){
	if(jQuery(that).is(':checked')){
		jQuery('input[name="password"]').attr('type', 'text');
	}else{
		jQuery('input[name="password"]').attr('type', 'password');
	}
}