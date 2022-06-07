import QrScanner from 'qr-scanner';

const cameraPermission = async () => {
  if (window.cordova) {
    if (window.cordova.platformId === 'android' || window.cordova.platformId === 'ios') {
      if (window.cordova.platformId === 'ios') {
        window.cordova.plugins.iosrtc.registerGlobals();
      }
      const { diagnostic } = window.cordova.plugins;
      diagnostic.enableDebug();
      return new Promise((resolve, reject) => {
        diagnostic.getCameraAuthorizationStatus(
          (status) => {
            if (status === diagnostic.permissionStatus.GRANTED) {
              resolve(true);
            } else {
              diagnostic.requestCameraAuthorization(
                (requestedStatus) => {
                  if (requestedStatus === diagnostic.permissionStatus.GRANTED) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }
                },
                (requestedError) => {
                  reject(requestedError);
                },
                false
              );
            }
          },
          (error) => {
            reject(error);
          },
          false
        );
      });
    }
  }
  return Promise.resolve(true);
};

const hasMultipleCameras = async () => {
  const cameras = await QrScanner.listCameras(true);
  if (cameras.length > 1) return true;
  return false;
}

const switchCamera = async (currentDeviceId) => {
  const cameras = await QrScanner.listCameras();
  let nextDeviceId = null;
  if (cameras.length > 1) {
    if (!currentDeviceId) {
      nextDeviceId = cameras[1].id; // assume initialized with camera[0]
    } else {
      cameras.forEach((camera, idx) => {
        if (camera.id === currentDeviceId) {
          nextDeviceId = (idx === (cameras.length - 1))
            ? cameras[0].id : cameras[idx + 1].id;
        }
      })
    }
  }
  return nextDeviceId;
}

export { cameraPermission, hasMultipleCameras, switchCamera };
