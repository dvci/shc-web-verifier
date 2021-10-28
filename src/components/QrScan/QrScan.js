import React, { useCallback, useEffect } from 'react';
import { Box } from '@material-ui/core';
import jsQR from 'jsqr';
import { useHistory } from 'react-router-dom';
import frame from 'assets/frame.png';
import { useQrDataContext } from 'components/QrDataProvider';

const QrScan = () => {
  const history = useHistory();
  const { setQrCode } = useQrDataContext();

  const tick = useCallback(() => {
    const video = document.getElementById('video');
    if (!video) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const canvasElement = document.getElementById('canvas');
      if (!canvasElement) return;
      const canvas = canvasElement.getContext('2d');
      canvasElement.hidden = false;

      canvasElement.height = video.videoHeight;
      canvasElement.width = video.videoWidth;
      canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });
      if (code) {
        if (code.data.startsWith('shc:/')) {
          video.srcObject.getTracks().forEach((track) => track.stop());
          video.remove();
          setQrCode(code.data);
          history.push('/display-results');
        }
      }
    }

    requestAnimationFrame(tick);
  }, [history, setQrCode]);

  const startScanning = useCallback(() => {
    const video = document.createElement('video');
    video.id = 'video';
    video.hidden = true;
    document.children[0].appendChild(video);

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play().catch(() => {
          /* ignore error since it's caused by us stopping the scan */
        });
        requestAnimationFrame(tick);
      });
  }, [tick]);

  useEffect(() => {
    startScanning();
  }, [startScanning]);

  return (
    <Box
      mt={10}
      display="flex"
      justifyContent="center"
      bgcolor="common.grayMedium"
    >
      <canvas
        id="canvas"
        style={{
          position: 'absolute',
          marginTop: '4.5rem',
          height: '500px',
          width: '570px',
          zIndex: '1',
        }}
      />
      <img
        src={frame}
        alt="Scan Frame"
        style={{
          height: '550px',
          width: '640px',
          marginTop: '3rem',
          marginBottom: '3rem',
          zIndex: '2',
        }}
      />
    </Box>
  );
};

export default QrScan;
