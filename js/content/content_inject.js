jQuery(document).on('show.bs.modal', '.modal-extension', function(event) { 
	jQuery(this).addClass('show');
	jQuery("#table-extension").DataTable({
		"aoColumnDefs": [
	        { "bSortable": false, "aTargets": [ 0 ] }, 
	        { "bSearchable": false, "aTargets": [ 0 ] }
	    ],
	    "aaSorting": [],
		lengthMenu: [[5, 20, 100, -1], [5, 20, 100, "All"]]
	});
});
jQuery(document).on('hide.bs.modal', '.modal-extension', function(event) { 
	jQuery("#table-extension").DataTable().destroy();
	jQuery(this).removeClass('show');
});

function lihat_password(that){
	if(jQuery(that).is(':checked')){
		jQuery('input[name="password"]').attr('type', 'text');
	}else{
		jQuery('input[name="password"]').attr('type', 'password');
	}
}