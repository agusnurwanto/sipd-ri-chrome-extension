function singkron_sumber_dana_lokal() {
    if (confirm('Apakah anda yakin melakukan ini? data lama akan diupdate dengan data terbaru.')) {
        show_loading();
        get_sumber_dana_master()
        .then(function(data_dana){
            pesan_loading('Simpan data Sumber Dana ke DB Lokal!');
            const tgl = new Date();
            var data_sumber_dana = {
                action: 'singkron_sumber_dana',
                type: 'ri',
				tahun_anggaran: _token.tahun,
                api_key: config.api_key,
                dana: {}
            };
            data_dana.map(function (dana, i) {
                data_sumber_dana.dana[i] = {};
                data_sumber_dana.dana[i].created_at = tgl
                data_sumber_dana.dana[i].created_user = _token.daerah_id
                // data_sumber_dana.dana[i].created_at = dana.created_at
                // data_sumber_dana.dana[i].created_user = dana.created_user
                data_sumber_dana.dana[i].id_daerah = _token.daerah_id
                data_sumber_dana.dana[i].id_dana = dana.id_dana
                data_sumber_dana.dana[i].id_unik = dana.id_dana
                // data_sumber_dana.dana[i].id_unik = dana.id_unik
                data_sumber_dana.dana[i].is_locked = dana.is_locked
                data_sumber_dana.dana[i].kode_dana = dana.kode_dana
                data_sumber_dana.dana[i].nama_dana = dana.nama_dana                    
                data_sumber_dana.dana[i].set_input = dana.set_input
                data_sumber_dana.dana[i].sumber_dana = dana.sumber_dana //baru
                // data_sumber_dana.dana[i].status = dana.sumber_dana
                // data_sumber_dana.dana[i].status = dana.status
                // data_sumber_dana.dana[i].tahun = dana.tahun
                data_sumber_dana.dana[i].tahun = _token.tahun
                data_sumber_dana.dana[i].updated_at = dana.updated_at
                data_sumber_dana.dana[i].updated_user = _token.daerah_id
                // data_sumber_dana.dana[i].updated_user = dana.updated_user
            })
            var data = {
                message: {
                    type: "get-url",
                    content: {
                        url: config.url_server_lokal,
                        type: 'post',
                        data: data_sumber_dana,
                        return: true
                    }
                }
            };
            chrome.runtime.sendMessage(data, function (response) {
                console.log('responeMessage', response);
            });
        })
    }
}

function get_sumber_dana_master(){
    return new Promise(function(resolve, reject){
        if(typeof global_all_sumber_dana == 'undefined'){
            var apiKey = x_api_key();
            relayAjax({
                url: config.sipd_url+'api/master/sumber_dana/listNew',
                type: 'POST',
                data: {
                    tahun: _token.tahun,
                    id_daerah: _token.daerah_id,                
                    deleted_data: true,
                    // order[0][column]: 0,
                    // order[0][dir]: asc,
                    // search[value]: '',
                    length: 100000,
                    start: 0,
                },
                beforeSend: function (xhr) {                
                    xhr.setRequestHeader("X-API-KEY", apiKey);
                    xhr.setRequestHeader("x-access-token", _token.token);
                },
                success: function (res) {
                    window.global_all_sumber_dana = res.data.data;
                    resolve(global_all_sumber_dana);
                }
            });
        }else{
            resolve(global_all_sumber_dana);
        }
    })
}