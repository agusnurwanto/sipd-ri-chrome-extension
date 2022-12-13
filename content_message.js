window.addEventListener('message', function(event) {
	var command = event.data.command;
	console.log('run_script', event.data);
	switch(command) {
    	case 'window.data_siks':
			window.data_siks = event.data.data; console.log(data_siks);
			break;
	}
});