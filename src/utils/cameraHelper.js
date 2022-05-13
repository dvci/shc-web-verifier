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

const switchCamera = async (currentDeviceId) => {
  let nextDeviceId = null;
  QrScanner.listCameras(true).then((cameras) => {
    if (currentDeviceId === null && cameras.length > 0) {
      nextDeviceId = cameras[0].id;
    } else {
      cameras.forEach((camera, idx) => {
        if (camera.id === currentDeviceId) {
          nextDeviceId = (idx === (cameras.length - 1))
            ? cameras[0].id : cameras[idx + 1].id;
        }
      })
    }
    return nextDeviceId;
  });
}

export { cameraPermission, switchCamera };
