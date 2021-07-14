import './App.css';
import React, { useState } from 'react';

import jsQR from 'jsqr';

function App() {
  const [isScanning, setIsScanning] = useState(false);

  let video, canvasElement, canvas, loadingMessage, outputContainer, outputMessage, outputData;

  function tick() {
    loadingMessage.innerText = "⌛ Loading video...";
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      loadingMessage.hidden = true;
      canvasElement.hidden = false;
      outputContainer.hidden = false;

      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        debugger;
        outputMessage.hidden = true;
        outputData.parentElement.hidden = false;
        outputData.innerText = code.data;
      } else {
        outputMessage.hidden = false;
        outputData.parentElement.hidden = true;
      }
    }

    requestAnimationFrame(tick);
  }

  const startScanning = () => {
    console.log('startScanning');
    setIsScanning(true);
    video = document.createElement("video");
    video.id = 'video';
    video.hidden = true;
    document.children[0].appendChild(video);
    canvasElement = document.getElementById("canvas");
    canvas = canvasElement.getContext("2d");
    loadingMessage = document.getElementById("loadingMessage");
    outputContainer = document.getElementById("output");
    outputMessage = document.getElementById("outputMessage");
    outputData = document.getElementById("outputData");

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.play();
      requestAnimationFrame(tick);
    });
  };

  const stopScanning = () => {
    console.log('stopScanning');
    video = document.getElementById("video");
    video.srcObject.getTracks().forEach(track => track.stop());
    video.remove();
    document.getElementById('canvas').hidden = true;
    setIsScanning(false);
  };

  const startButton = (
    <button id="start" onClick={startScanning} disabled={isScanning}>Start</button>
  );

  const stopButton = (
    <button id="stop" onClick={stopScanning} disabled={!isScanning}>Stop</button>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>SMART Health Cards Web Verifier</h1>
      </header>
      {startButton}
      {stopButton}
      <div id="loadingMessage">🎥 Unable to access video stream (please make sure you have a webcam enabled)</div>
      <canvas id="canvas" hidden></canvas>
      <div id="output" hidden>
      <div id="outputMessage">No QR code detected.</div>
      <div hidden><b>Data:</b> <span id="outputData"></span></div>
      </div>
    </div>
  );
}

export default App;
