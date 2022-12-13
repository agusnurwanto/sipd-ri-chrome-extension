function sendMessageAll(data, cb){
    console.log('data', data);
    chrome.runtime.sendMessage(data, function(response) {
        if(typeof cb == 'function'){
            cb(response);
        }
    });
}

function sendMessageTabActive(data, cb, nodebug){
    if(!nodebug){
        console.log('data', data);
    }
    if(data.tab){
        chrome.tabs.sendMessage(data.tab.id, data, function(response) {
            if(typeof cb == 'function'){
                cb(response);
            }
        });
    }else{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
                if(typeof cb == 'function'){
                    cb(response);
                }
            });
        });
    }
}

function relayAjax_lama(options, retries=20, delay=10000, timeout=90000){
    options.timeout = timeout;
    jQuery.ajax(options)
    .fail(function(){
        if (retries > 0) {
            console.log('Koneksi error. Coba lagi '+retries);
            setTimeout(function(){ 
                relayAjax(options, --retries, delay, timeout);
            },delay);
        } else {
            alert('Capek. Sudah dicoba berkali-kali error terus. Maaf, berhenti mencoba.');
        }
    });
}

// https://stackoverflow.com/questions/46946380/fetch-api-request-timeout
function timeoutAjax(ms, promise) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('TIMEOUT'))
        }, ms)

        promise
        .then(value => {
            clearTimeout(timer)
            resolve(value)
        })
        .catch(reason => {
            clearTimeout(timer)
            reject(reason)
        })
    })
}

function relayAjax(options, retries=20, delay=10000, timeout=9000000){
    timeoutAjax(timeout, postData(options.url, options.data))
    .then(data => {
        options.success(data);
    })
    .catch((error) => {
        console.log('pesan error', error);
        options.error();
        if (retries > 0) {
            console.log('Koneksi error. Coba lagi '+retries);
            setTimeout(function(){ 
                relayAjax(options, --retries, delay, timeout);
            },delay);
        } else {
            console.log('Capek. Sudah dicoba berkali-kali error terus. Maaf, berhenti mencoba.');
        }
    });
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
function postData(url = '', data = {}) {
    var formdata = new FormData();
    for(var i in data){
        if(typeof data[i] == 'string'){
            var val = data[i];
        }else{
            var val = JSON.stringify(data[i]);
        }
        formdata.append(i, val);
    }
    var parameter = {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'include',
        redirect: 'follow',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: formdata
    };

    return fetch(url, parameter)
    .then(response => {
        return response.text();
    })
    .then((data) => {
        return (data ? JSON.parse(data) : {});
    });
}