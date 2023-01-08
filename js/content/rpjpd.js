function singkronisasi_rpjpd_dari_lokal(){

}

function get_rpjpd_lokal(){
	show_loading();
	pesan_loading('Get data RPJPD dari WP-SIPD');
	var data = {
	    message:{
	        type: "get-url",
	        content: {
			    url: config.url_server_lokal,
			    type: 'post',
			    data: { 
					action: 'get_rpjpd',
					run: 'open_modal_rpjpd',
					table: 'all',
					api_key: config.api_key
				},
    			return: true
			}
	    }
	};
	chrome.runtime.sendMessage(data, function(response) {
	    console.log('responeMessage', response);
	});
}

function open_modal_rpjpd(rpjpd){
	console.log('RPJPD', rpjpd);
	var body = '';
	rpjpd.map(function(b, i){
		body += ''
		+'<tr>'
			+'<td></td>'
			+'<td>'+b.visi_teks+'</td>'
			+'<td>'+b.misi_teks+'</td>'
			+'<td>'+b.saspok_teks+'</td>'
			+'<td>'+b.kebijakan_teks+'</td>'
			+'<td>'+b.isu_teks+'</td>'
		+'</tr>';
	});
	jQuery('#table-extension tbody').html(body);
	run_script('show_modal');
}