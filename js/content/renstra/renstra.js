function singkron_renstra(tipe){

}

function singkron_tujuan_renstra(tipe){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
    }
}

function singkron_sasaran_renstra(tipe){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
    }
}

function singkron_program_renstra(tipe){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
    }
}

function singkron_kegiatan_renstra(tipe){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
    }
}

function singkron_sub_kegiatan_renstra(tipe){
    if(confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')){
		show_loading();
    }
}

function get_tahapan_renstra(){
    return new Promise(function(resolve, reject){
		relayAjax({	      	
			url: config.sipd_url+'api/master/tahapan/list/renstra',			
			type: 'GET',	      							
			contentType : 'application/json',
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},	
	      	success: function(data){
	      		return resolve(data);
	      	}
	    });
    });
}

function jadwal_renstra_aktif(){    
    return new Promise(function(resolve, reject){    	
		relayAjax({
			url: config.sipd_url+'api/jadwal/renstra_jadwal/cek_aktif',                                    
			type: 'POST',	      				
			data: {            
				id_daerah: _token.daerah_id,				
				tahun: _token.tahun
			},
			beforeSend: function (xhr) {			    
				xhr.setRequestHeader("X-API-KEY", x_api_key());
				xhr.setRequestHeader("X-ACCESS-TOKEN", _token.token);  
			},
	      	success: function(jadwal_renstra_aktif){
	      		return resolve(jadwal_renstra_aktif);
	      	}
	    });
    });
}