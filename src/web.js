const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
var serveIndex = require('serve-index');
const { default: axios } = require("axios");

const COOKIE = "" //"PREF=f4=4000000&tz=America.Sao_Paulo&f6=40000000; VISITOR_INFO1_LIVE=chRD8Jpd3Z4; SID=HAivj5wx8TtnAupfpgtzkeOM5F_BgBp6LMydqEc5yHk_tCpx6RgHHHD1Kqc1lK1YO7l06g.; __Secure-1PSID=HAivj5wx8TtnAupfpgtzkeOM5F_BgBp6LMydqEc5yHk_tCpxxEPeYhngYzHGj5kZu3SGcg.; __Secure-3PSID=HAivj5wx8TtnAupfpgtzkeOM5F_BgBp6LMydqEc5yHk_tCpxbdcQr8j0slHZaLaO6VaNxg.; HSID=A11sZM_GFn3VDr5mr; SSID=ARx4YvPjyMmfple7T; APISID=5m2xsOBtzFBYp5Gb/Ak_Vod1RdKhxB0kJZ; SAPISID=95rzxvKAK7WQg8je/AkEagixeJxMotp9QE; __Secure-1PAPISID=95rzxvKAK7WQg8je/AkEagixeJxMotp9QE; __Secure-3PAPISID=95rzxvKAK7WQg8je/AkEagixeJxMotp9QE; YSC=W8Y4LA4V9AY; LOGIN_INFO=AFmmF2swRgIhANP7alsn_6gDFHHs7Gj7rQjWNM0foNEEwcbQPo3BtNHpAiEA8UTxLe1S4arxR2kmVYvmdmrVOfkQ3VsBMoHzgfCqwi4:QUQ3MjNmeGE2MkpfYTl3eDgxc1lVVlZBRXVSbklZWC1FYlMzc0I4WGNKbXNpV2E5dFh1c1R5RVBMOXFndWNzVmRnTWpfWFJRZE9oNWJzOFpYbTYyZXpaM29hUmgyYXNGNTRRQUlCdmwtZlZQb3dTbkpIemFkc3JaSUlLT1liZnJGTkZ4cTUzbzBwLU5pNlFwTGowS3pLelFqdVZfcHQ2cGJB; CONSISTENCY=AGDxDePD-SKH7AUqq9Bp6aewNuH-wvN-AIDoa603aVITml7RBZecK0RtOWLn9xUEJNvg_yl9XIFdAzdkeZubErgWzx0PJnVFu9HsmrwyVjrWT7oKBnDg-vxmj5eMTsZflMZgCIhlA5mHVCbEiwQ3lFz7; SIDCC=AJi4QfEm1QkHMPGwsFcG3ROH9eBW5ESuKTVcLlI1b6lEiWzVxwrwIJ0iz2AFDXjHp9iC4wL44Q; __Secure-3PSIDCC=AJi4QfFpBlRv4VdfQ0ogagdUMfGyJPlw5_umkiRUp6wJeUpw5fV83m7Ki-jNvvhpewmCs6KlOWI"
const getRandom = () => { return `${Math.floor(Math.random() * 10000)}` };

const tryhost = async (req) => {
    tryurl = req.headers.host
    try {
        return 'https://' + tryurl;
    } catch (error) {
        return 'https://' + tryurl;
    };
};

let port = process.env.PORT || 3000;

// only use on localhost;
//process.env.FFMPEG_PATH = "C:\\Users\\44778\\Desktop\\ffmpeg-2022-03-07-git-e645a1ddb9-essentials_build\\bin\\ffmpeg.exe";

app.set('json spaces', 4);
app.use(express.static(__dirname + "/"));
app.use('/public', serveIndex(__dirname + '/public', { icons: true, stylesheet: "src/static/serve.css" }));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/./static/home.html');
});

app.get('/api', function(req, res) {
    res.sendFile(__dirname + '/./static/api.html');
});

app.get('/audio', async function(req, res) {
    var vurl = req.query.url;
    
    if (!vurl || vurl.length < 11) {
        return res.json({
            "success": false, "error": "invalid url"
        });
    };

    try {
        const audio = ytdl(vurl, { requestOptions: { headers: { cookie: COOKIE } } });
        
        var vinfo = await getVinfo(vurl);
        var filename = vinfo.videoid ? 'audio_' + vinfo.videoid : 'audio_' + getRandom()

        video.on('error', error => {
            return res.json({
                "success": false, "error": error.message
            });
        });

        ffmpeg(audio)
        .withAudioCodec('libmp3lame')
        .toFormat('mp3')
        .saveToFile(`${__dirname}/public/${filename}.mp3`)
        .on('end', () => {
            tryhost(req)
            .then(url => {
                res.json({
                    "success": true, "file": `${url}/file/?file=${filename}.mp3`
                });
            });
        })
        .on('error', function(error) {
            res.json({
                "success": false, "error": error.message
            });
        });
    } catch (error) {
        res.json({
            "success": false, "error": error.message
        });
    };
});

app.get('/video', async function(req, res) {
    var vurl = req.query.url;
    var bestQuality = req.query.best;

    if (!vurl && vurl.length < 11) {
        return res,json({
            "success": false, "error": "invalid url"
        });
    };

    try {
        var vinfo = await getVinfo(vurl);
        var filename = vinfo.videoid ? 'video_' + vinfo.videoid : 'video_' + getRandom();

        var vOpts = bestQuality ? { quality: "highest", filter: "audioandvideo", requestOptions: { headers: { cookie: COOKIE } } } :
            { requestOptions: { headers: { cookie: COOKIE } } };
        const video = ytdl(vurl, vOpts);

        video.on('error', error => {
            res.json({
                "success": false, "error": error.message
            });
        });

        video.on('end', () => {
            tryhost(req)
            .then(url => {
                res.json({
                    "success": true, "file": `${url}/file/?file=${filename}.mp4`
                });
            });
        });

        video.pipe(fs.createWriteStream(`${__dirname}/public/${filename}.mp4`));
    } catch (error) {
        res.json({
            "success": false, "error": error.message
        });
    };
});

app.get('/file', function(req, res) {
    let filename = req.query.file;
    let dir = `${__dirname}/public/${filename}`;

    if (!filename || !fs.existsSync(dir)) {
        return res.json({
            "success": false, "error": "file not found"
        });
    };

    res.download(`${__dirname}/public/${filename}`)
});

app.get('/info', async function(req, res) {
    let link = req.query.url;

    if (!link || link.length < 11) {
        res.json({
            "success": false, "error": "no url"
        });
    };

    data = await getVinfo(link);
    return res.json(data);
});

async function getVinfo(url) {
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
        })
        .catch(error => {
            return {
                "success": false,
                "error": error.message
            };
        });
    } catch (error) {
        return {
            "success": false,
            "error": error.message
        };
    };
};

module.exports = async () => new Promise((resolve) => {
    app.listen(port, function() {
        console.log("Listening on port ", port);
        if (port == 3000) {
            console.log('Running locally at http://localhost:3000');
        };

        resolve();
    });
}); 