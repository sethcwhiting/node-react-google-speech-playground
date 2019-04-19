import io from 'socket.io-client';
const socket = io('http://localhost:1337');

//================= CONFIG =================
// Stream Audio
let bufferSize = 2048,
	AudioContext,
	context,
	processor,
	input,
	globalStream;

//vars
let finalWord = false,
	removeLastSentence = true,
	streamStreaming = false;

//audioStream constraints
const constraints = {
	audio: true,
	video: false
};

//================= RECORDING =================
export const initRecording = () => {
	socket.emit('startGoogleCloudStream', ''); //init socket Google Speech Connection
	streamStreaming = true;
	AudioContext = window.AudioContext || window.webkitAudioContext;
	context = new AudioContext();
	processor = context.createScriptProcessor(bufferSize, 1, 1);
	processor.connect(context.destination);
	context.resume();

	const handleSuccess = stream => {
		globalStream = stream;
		input = context.createMediaStreamSource(stream);
		input.connect(processor);

		processor.onaudioprocess = e => {
			microphoneProcess(e);
		};
	};

	navigator.mediaDevices.getUserMedia(constraints)
		.then(handleSuccess);

    //================= SOCKET IO =================
    socket.on('connect', data => {
        socket.emit('join', 'Server Connected to Client');
    });


    socket.on('messages', data => {
        console.log('messages: ', data);
    });


    socket.on('speechData', data => {
        // console.log(data.results[0].alternatives[0].transcript);
        const dataFinal = undefined || data.results[0].isFinal;

        if (dataFinal === false) {
            let interimString = data.results[0].alternatives[0].transcript;
            console.log(interimString);

        } else if (dataFinal === true) {
            //log final string
            let finalString = data.results[0].alternatives[0].transcript;
            console.log("Google Speech sent 'final' Sentence and it is:");
            console.log(finalString);

            finalWord = true;
            removeLastSentence = false;
        }
    });

}

const microphoneProcess = (e) => {
	const left = e.inputBuffer.getChannelData(0);
	const left16 = downsampleBuffer(left, 44100, 16000);
	socket.emit('binaryData', left16);
}

//================= INTERFACE =================
export const stopRecording = () => {
	if (!streamStreaming){return} // stop disconnecting if already disconnected;

	streamStreaming = false;
	socket.emit('endGoogleCloudStream', '');


	let track = globalStream.getTracks()[0];
	track.stop();

	input.disconnect(processor);
	processor.disconnect(context.destination);
	context.close().then(() => {
		input = null;
		processor = null;
		context = null;
		AudioContext = null;
	});
}

//================= OTHER STUFF =================
window.onbeforeunload = () => {
	if (streamStreaming) { socket.emit('endGoogleCloudStream', ''); }
};

//================= SANTAS HELPERS =================
const downsampleBuffer = (buffer, sampleRate, outSampleRate) => {
    if (outSampleRate == sampleRate) {
        return buffer;
    }
    if (outSampleRate > sampleRate) {
        throw "downsampling rate should be smaller than original sample rate";
    }
    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    let result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }

        result[offsetResult] = Math.min(1, accum / count)*0x7FFF;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result.buffer;
}
