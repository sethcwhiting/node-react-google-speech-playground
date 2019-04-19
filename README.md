
# Node React Google Speech Playground

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An easy-to-set-up playground for cross device real-time Google Speech Recognition with Create React App, a Node server, and socket.io. *Phew.*

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It is based on the super reduced log only verison of the [Google Cloud Speech Node with Socket Playground](https://github.com/vin-ni/Google-Cloud-Speech-Node-Socket-Playground) by [Vinzenz Aubry](https://twitter.com/vinberto). It also draws some inspiration from [Amber B.](https://stackoverflow.com/users/7164429/amber-b)'s answer to [this question](https://stackoverflow.com/questions/50976084/how-do-i-stream-live-audio-from-the-browser-to-google-cloud-speech-via-socket-io) on Stack Overflow. It show's only two buttons, logs the results to the console and has no nlp. Use this if you want to implement it somewhere else.

## Run Local
1. get a free test key from [Google](https://cloud.google.com/speech/docs/quickstart )
2. place it into the project root and update the path in the `.env` file
3. open the terminal and go to the project root
4. run `npm install`
5. run `npm run build`
6. run `node server`
7. go to `http://127.0.0.1:1337/`

## Troubleshooting
- If you have delays in calls, check if `IPV6` is disabled on your server

Made by [Seth C Whiting](https://github.com/sethcwhiting)