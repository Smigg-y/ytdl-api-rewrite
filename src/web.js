const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
var serveIndex = require('serve-index');

const getRandom = () => {
    return `${Math.floor(Math.random() * 10000)}`;
};

const myhost = async (req) => {
    myurl = req.headers.host;
    try {
        return (`https://${req.headers.host}`);
    } catch (error) {
        return (`http://${req.headers.host}`);
    };
};

//process.env.FFMPEG_PATH = 'C:\\Users\\44778\\Desktop\\ffmpeg-2022-03-07-git-e645a1ddb9-essentials_build\\bin\\ffmpeg.exe';
//process.env.FFPROBE_PATH = 'C:\\Users\\44778\\Desktop\\ffmpeg-2022-03-07-git-e645a1ddb9-essentials_build\\bin\\ffprobe.exe';
const port = process.env.PORT || 3000;

app.set('json spaces', 4);
app.use(express.static(`${__dirname}/`));
app.use('/public', serveIndex(`${__dirname}/public`, { icons: true, stylesheet: 'src/static/serve.css', template: 'src/static/dir.html' }));
module.exports = () => {
    new Promise((resolve) => {
        app.listen(port, resolve());
    });
};

app.get('/url', async function (req, res) {
    res.send((`URL: ${await myhost(req)}`));
});

app.get('/', function (req, res) {
    res.sendFile(`${__dirname}/static/home.html`);
});

app.get('/api', function (req, res) {
    res.sendFile(`${__dirname}/static/api.html`);
});

app.get('/audio', async function (req, res) {
    let urlvideo = req.query.url;

    if (!urlvideo || urlvideo.length < 11) {
        return res.json({
            "success": false, "error": "invalid url"
        });
    };

    try {
        let videoinfo = await getInfo(urlvideo);
        let filename = videoinfo.videoid ? ('audio_' + videoinfo.videoid) : ('audio_' + getRandom());

        let videoOptions = { quality: 'highestaudio' };

        let audio = ytdl(urlvideo, videoOptions);

        ffmpeg(audio)
            .audioBitrate(128)
            .save(`${__dirname}/public/${filename}.mp3`)
            .on('end', () => {
                myhost(req)
                    .then(url => {
                        res.json({
                            "success": true, "file": `${url}/file/?file=${filename}.mp3`
                        });
                    });
            })
            .on('error', err => {
                res.json({
                    "success": false, "error": err.message
                });
            });
    } catch (e) {
        res.json({
            "success": false, "error": e.message
        });
    };
});

app.get('/video', async function (req, res) {
    let urlvideo = req.query.url;
    let bestQuality = req.query.best;

    if (!urlvideo && urlvideo.length < 11) {
        return res.json({
            "success": false, "error": "invalid url"
        });
    };

    try {
        let videoinfo = await getInfo(urlvideo);
        let filename = videoinfo.videoid ? 'video_' + videoinfo.videoid : 'video_' + getRandom();

        let videoOptions = bestQuality ? { quality: 'highest', filter: 'audioandvideo' } : { filter: 'audioandvideo' };

        let video = ytdl(urlvideo, videoOptions);

        video.on('error', err => {
            res.json({
                "success": false, "error": err.message
            });
        });

        video.on('end', () => {
            myhost(req)
                .then(url => {
                    res.json({
                        "success": true, "file": `${url}/file/?file=${filename}.mp4`
                    });
                });
        });

        video.pipe(fs.createWriteStream(`${__dirname}/public/${filename}.mp4`));
    } catch (e) {
        res.json({
            "success": false, "error": e.message
        });
    };
});

app.get('/file', function (req, res) {
    let filename = req.query.file;
    let file = `${__dirname}/public/${filename}`;

    if (!filename || !fs.existsSync(file)) {
        return res.json({
            "success": false, "error": "no url"
        });
    };

    res.download(`${__dirname}/public/${filename}`);
});

app.get('/info', async function (req, res) {
    let link = req.query.url;

    if (!link || link.length < 11) {
        res.json({
            "success": false, "error": "no url"
        });
    };

    let data = await getInfo(link);
    return res.json(data);
});

async function getInfo(url) {
    try {
        return await ytdl.getInfo(url)
            .then((info) => {
                return {
                    "success": true,
                    "title": info.videoDetails.title,
                    "videoid": info.videoDetails.videoId,
                    "thumb": info.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url,
                    "duration": info.videoDetails.lengthSeconds,
                    "likes": info.videoDetails.likes
                };
            }).catch(error => {
                return {
                    "success": false, "error": error.message
                };
            });
    } catch (error) {
        return {
            "success": false, "error": error.message
        };
    };
};