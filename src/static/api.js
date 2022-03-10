function start() {
    linkvideo = document.getElementById('linkvideo').value;

    if (!linkvideo || linkvideo.length < 20) {
        return showAlert('Please fill in the URL correctly');
    };

    loadingBtn('bootsearch');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(`/info?url=${linkvideo}`, requestOptions)
        .then(response => {
            if (response.status != 200) {
                showAlert('error: server did not respond correctly');

                console.log(response);
            } else {
                response.json().then((data) => {
                    if (!data.success) {
                        if (data.error.includes('410')) {
                            return showAlert(('error: this video is restricted'));
                        };

                        return showAlert(('error: ' + data.error));
                    };

                    document.getElementById('form').innerHTML = downloadScreen(data);
                    showBackBtn();
                }).catch((err) => {
                    console.log(err);
                    showAlert("error: couldn't get data");
                });
            };
        })
        .catch(error => {
            showAlert('error: cannot connect to server');
            console.log(error);
        });
};

function download(urlType) {
    loadingBtn('divDownload');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    var type = urlType.startsWith('video_') ? 'video' : 'audio';

    fetch(`/${type}?url=${linkvideo}&best=true`, requestOptions)
        .then(response => {
            if (response.status != 200) {
                showAlert('error: server did not respond correctly');

                console.log(response);
            } else {
                response.json().then((data) => {
                    if (!data.success) {
                        return showAlert(('error: ', data.error));
                    };

                    console.log(data.file);

                    var link = document.createElement('a');
                    link.href = data.file;
                    link.download = (data.file.split('file='))[1];
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    document.getElementById('divDownload').innerHTML = '';
                    document.getElementById('divDownload').innerHTML = `
                <div class="alert alert-success" role="alert">
                    <span class="material-icons">done</span>
                </div>`;

                    delay(5000)
                        .then(() => {
                            window.location.reload();
                        });
                }).catch((err) => {
                    showAlert("error: couldn't get data")
                });
            };
        })
        .catch(error => {
            showAlert("error: couldn't connect to server");
        });
};

function loadingBtn(id) {
    document.getElementById(id).innerHTML = '';
    document.getElementById(id).innerHTML = `
    <button class="btn btn-primary" type="button" disabled>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Please Wait...
    </button>`;
};

function delay(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};

function showAlert(msg) {
    document.getElementById('error').innerText = msg;
    document.getElementById('error').style.display = 'block';

    delay(8000)
        .then(() => {
            document.getElementById('error').innerText = '';
            document.getElementById('error').style.display = 'none';
        });
};

function downloadScreen(data) {
    return `
    <p class="h3 text-light">${data.title}</p>
    <img class="img-fluid rounded mt-2" src="${data.thumb}">
    <p class="mt-3 text-light">
        <strong>Duration:</strong> ${sToTime(data.duration)} <strong>Likes:</strong> ${data.likes}
    </p>
        
    <div id="divDownload" class="mt-4">
        <p class="text-light h5">
            Download:
        </p>
        <p type="button" class="btn btn-lg btn-primary" id="btnvideo" onclick="download('video_${data.videoid}')">Video <i class="inline-icon-search material-icons">smart_display</i></p>
        <p type="button" class="btn btn-lg btn-primary" id="btnaudio" onclick="download('audio_${data.videoid}')">Audio <i class="inline-icon-search material-icons">audiotrack</i></p>
    </div>

    <p type="button" class="btn btn-lg mt-2 text-light" id="bootback" onClick="window.location.reload();">Back</p>`;
};

function sToTime(duration) {
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output ~= "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    };

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
};

function showBackBtn() {
    document.getElementById("bootback").style.visibility = "visible";
};