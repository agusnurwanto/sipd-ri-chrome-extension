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
    		if(!opsi){
				jQuery('#modal-extension').modal('hide');
			}else{
				jQuery('#'+opsi.id).modal('hide');
			}
			break;
    	case 'config':
    		// merubah settingan config
    		for(var i in config){
    			if(opsi[i]){
    				config[i] = opsi[i];
    			}
    		}
			break;
    	case 'show_modal_sm':
    		window.options_datatable = {
				"aoColumnDefs": [
			        { "bSortable": false, "aTargets": [ 0 ] }, 
			        { "bSearchable": false, "aTargets": [ 0 ] }
			    ],
				lengthMenu: [[5, 20, 100, -1], [5, 20, 100, "All"]]
			};
    		if(opsi){
    			if(opsi.order){
    				options_datatable.order = opsi.order;
    			}
    		}
			jQuery('#modal-extension').modal('show');
			break;
    	case 'show_modal_usulan_ssh':
    		window.options_datatable = {
    			'columnDefs': [
    				{ 'width': '300px', 'targets': 6 }, 
    				{ orderable: false, targets: 1 }], 
    				lengthMenu: [ [10, 250, 500, -1], [10, 250, 500, 'All'] 
    			]
    		};
    		jQuery("#usulan-ssh").modal("show");
    		console.log('tampilkan popup usulan ssh');
			break;
	}
});