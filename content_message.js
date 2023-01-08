window.addEventListener('message', function(event) {
	var command = event.data.command;
	console.log('run_script', event.data);
	switch(command) {
    	case 'show_modal':
			jQuery('#modal-extension').modal('show');
			break;
    	case 'hide_modal':
			jQuery('#modal-extension').modal('show');
			break;
	}
});