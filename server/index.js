'use strict'

//  Google Cloud Speech Playground with node.js and socket.io
//  Created by Vinzenz Aubry for sansho 24.01.17
//  Feel free to improve!
//	Contact: vinzenz@sansho.studio

const express = require('express'); // const bodyParser = require('body-parser'); // const path = require('path');
const fs = require('fs');
const environmentVars = require('dotenv').config();

// Google Cloud
const speech = require('@google-cloud/speech');
const speechClient = new speech.SpeechClient(); // Creates a client


const app = express();
const port = process.env.PORT || 1337;
const server = require('http').createServer(app);

const io = require('socket.io')(server);

app.use('/assets', express.static(__dirname + './../build/static'));
app.use('/session/assets', express.static(__dirname + './../build/static'));
app.use(express.static(__dirname + './../build'));


// =========================== ROUTERS ================================ //

app.get('/', function (req, res) {
    res.render('index', {});
});

app.use('/', function (req, res, next) {
    next();
});


// =========================== SOCKET.IO ================================ //

io.on('connection', function (client) {
    let recognizeStream = null;

    client.on('join', function (data) {
        client.emit('messages', 'Socket Connected to Server');
    });

    client.on('messages', function (data) {
        client.emit('broad', data);
    });

    client.on('startGoogleCloudStream', function (data) {
        startRecognitionStream(this, data);
    });

    client.on('endGoogleCloudStream', function (data) {
        stopRecognitionStream();
    });

    client.on('binaryData', function (data) {
        if (recognizeStream !== null) {
            recognizeStream.write(data);
        }
    });

    function startRecognitionStream(client, data) {
        recognizeStream = speechClient.streamingRecognize(request)
            .on('error', console.error)
            .on('data', (data) => {
                client.emit('speechData', data);

                // if end of utterance, let's restart stream
                // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
                if (data.results[0] && data.results[0].isFinal) {
                    stopRecognitionStream();
                    startRecognitionStream(client);
                }
            });
    }

    function stopRecognitionStream() {
        if (recognizeStream) {
            recognizeStream.end();
        }
        recognizeStream = null;
    }
});


// =========================== GOOGLE CLOUD SETTINGS ================================ //

// The encoding of the audio file, e.g. 'LINEAR16'
// The sample rate of the audio file in hertz, e.g. 16000
// The BCP-47 language code to use, e.g. 'en-US'
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US'; //en-US

const request = {
    config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        profanityFilter: false,
        enableWordTimeOffsets: true,
        // speechContexts: [{
        //     phrases: ["hoful","shwazil"]
        //    }] // add your own speech context for better recognition
    },
    interimResults: true // If you want interim results, set this to true
};


// =========================== START SERVER ================================ //

server.listen(port, "127.0.0.1", function () { //http listen, to make socket work
    // app.address = "127.0.0.1";
    console.log('Server started on port:' + port)
});