window.addEventListener('message', function(event) {
	var command = event.data.command;
	var opsi = event.data.data;
	console.log('run_script', event.data);
	switch(command) {
    	case 'show_modal':
    		if(!opsi){
	    		window.options_datatable = {
					"aoColumnDefs": [
				        { "bSortable": false, "aTargets": [ 0 ] }, 
				        { "bSearchable": false, "aTargets": [ 0 ] }
				    ],
				    "order": [[2, 'asc'], [3, 'asc']],
					lengthMenu: [[5, 20, 100, -1], [5, 20, 100, "All"]]
				};
				jQuery('#modal-extension').modal('show');
			}else{
	    		window.options_datatable = {
					"aoColumnDefs": [
				        { "bSortable": false, "aTargets": [ 0 ] }, 
				        { "bSearchable": false, "aTargets": [ 0 ] }
				    ],
					lengthMenu: [[5, 20, 100, -1], [5, 20, 100, "All"]]
				};
				jQuery('#'+opsi.id).modal('show');
			}
			break;
    	case 'hide_modal':
			jQuery('#modal-extension').modal('hide');
			break;
    	case 'show_modal_sm':
    		window.options_datatable = {
				"aoColumnDefs": [
			        { "bSortable": false, "aTargets": [ 0 ] }, 
			        { "bSearchable": false, "aTargets": [ 0 ] }
			    ],
				lengthMenu: [[5, 20, 100, -1], [5, 20, 100, "All"]]
			};
			jQuery('#modal-extension').modal('show');
			break;
	}
});