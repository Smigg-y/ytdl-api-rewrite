const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
var serveIndex = require('serve-index');
const { default: axios } = require("axios");

let port = process.env.PORT || 3000;

app.set('json spaces', 4);
app.use(express.static(__dirname + "/"));
app.use('/public', serveIndex(__dirname + '/public', { icons: true, stylesheet: "src/static/serve.css"}));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/./static/home.html');
});

app.get('/api', function(req, res) {
    res.sendFile(__dirname + '/./static/api.html');
});

module.exports = async () => new Promise((resolve) => {
    app.listen(port, function() {
        console.log("Listening on port ", port);
        if(port == 3000) {
            console.log('Running locally at http://localhost:3000');
        };

        resolve();
    });
}); 