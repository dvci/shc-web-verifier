import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import frame from "assets/frame.png";
import { useQrDataContext } from "components/QrDataProvider";
import QrScanner from "./vendor/qr-scanner";

//import QrScanner from "./vendor/qr-scanner/qr-scanner.min.js";
QrScanner.WORKER_PATH = "/shc-web-verifier/qr-scanner-worker.min.js";
// "/Users/smcdougall/vci/shc-web-verifier/public/qr-scanner-worker.min.js";
//"shc-web-verifier/src/components/QrScan/vendor/qr-scanner/qr-scanner-worker.min.js";

const useStyles = makeStyles(() => ({
  button: {
    "&:hover": {
      cursor: "default",
    },
  },
  frame: {
    position: "relative",
    height: "550px",
    width: "640px",
    marginTop: "3rem",
    marginBottom: "3rem",
    zIndex: "2",
  },
  qrScanner: {
    width: "570px",
    height: "500px",
    "object-fit": "cover",
    position: "absolute",
    marginLeft: "2.2rem",
    marginTop: "4.5rem",
    "object-fit": "fill",
    zIndex: "1",
    "& section": {
      position: "unset !important",
      "& div": {
        boxShadow: "unset !important",
      },
    },
  },
}));

const healthCardPattern =
  /^shc:\/(?<multipleChunks>(?<chunkIndex>[0-9]+)\/(?<chunkCount>[0-9]+)\/)?[0-9]+$/;

const QrScan = () => {
  const history = useHistory();
  const classes = useStyles();
  const { setQrCodes } = useQrDataContext();
  const [scannedCodes, setScannedCodes] = useState([]);

  const handleScan = (data) => {
    if (healthCardPattern.test(data)) {
      const match = data.match(healthCardPattern);
      if (match.groups.multipleChunks) {
        const chunkCount = +match.groups.chunkCount;
        const currentChunkIndex = +match.groups.chunkIndex;
        let tempScannedCodes = [...scannedCodes];
        if (tempScannedCodes.length !== chunkCount) {
          tempScannedCodes = new Array(chunkCount);
          tempScannedCodes.fill(null, 0, chunkCount);
        }

        if (tempScannedCodes[currentChunkIndex - 1] === null) {
          tempScannedCodes[currentChunkIndex - 1] = data;
        }

        if (tempScannedCodes.every((code) => code)) {
          setQrCodes(tempScannedCodes);
          history.push("/display-results");
        }

        setScannedCodes(tempScannedCodes);
      } else {
        setQrCodes([data]);
        history.push("/display-results");
      }
    }
  };

  const handleError = () => {
    history.push("/display-results");
  };

  const runningQrScanner = useRef(null);
  let qrScan; // scope bound to callback
  //let videoElement;

  const videoCallback = (videoElement) => {
    //useCallback(
    console.log("in video callback");
    console.log(videoElement);
    if (!videoElement) {
      if (runningQrScanner.current) {
        qrScan.destroy();
        console.log("destroyed");
      }
      return;
    }
    console.log("about to make qr scanner");
    // code to run on component mount
    qrScan = new QrScanner(
      //runningQrScanner.current,
      videoElement,
      (result) => {
        console.log("got result");
        handleScan(result);
        qrScan.stop();
      },
      (error) => {
        //console.log("got error");
        //handleError();
        // handleError(), console.log(error), (qrScan.hasCamera = false);
      },
      (videoElement) => ({
        x: 0,
        y: 0,
        width: 570,
        height: 500,
        //width: videoElement.videoWidth,
        //height: videoElement.videoHeight,
      })
    );
    runningQrScanner.current = qrScan;
    console.log("qrScan:", qrScan);
    qrScan.start().then(() => {
      qrScan.hasCamera = true;
    });
    // return () => {
    //   qrScan.stop();
    // };
    // qrScan.start().then(() => {
    //   console.log("started");
    //   qrScan.hasCamera = true;
    // });
    // return () => {
    //   qrScan.stop();
  };
  // }, []);

  const videoRef = useRef(null);
  useEffect(() => {
    console.log("in effect");
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: "environment" } },
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.log(err);
      }
    };
    getUserMedia()
      .then(() => {
        console.log(videoRef.current.srcObject);
      })
      .then(() => {
        videoCallback(videoRef.current);
      });
    //.then(videoCallback(videoRef.current));
    // .then(
    //   qrScan.start().then(() => {
    //     console.log(qrScan);
    //   })
    // );
    // runningQrScanner.current.start().then(() => {
    //   runningQrScanner.current.hasCamera = true;
    //   console.log(runningQrScanner);
    // });
    // console.log(videoRef.current.srcObject);
    // videoCallback(videoRef.current);
    // console.log("starting qr scanner");
    // console.log(runningQrScanner);
    // runningQrScanner.current.start().then(() => {
    //   runningQrScanner.current.hasCamera = true;
    //   console.log(runningQrScanner);
    // });
    // return () => {
    //   runningQrScanner.current.stop();
    // };
    //videoCallback(videoRef.current);
  }, []);

  // useEffect(() => {
  //   //console.log("videoElement", videoElement);
  //   console.log("qrScan", qrScan);
  //   console.log("in effect");
  //   //videoCallback(videoElement);
  //   return () => {
  //     qrScan.stop();
  //   };
  // }, [qrScan]);

  // useEffect(() => {
  //   videoElement = document.getElementById("test");
  //   return new Promise((resolve) => {
  //     videoElement.addEventListener(
  //       "loadeddata",
  //       function () {
  //         const width = classes.qrScanner.width;
  //         const height = classes.qrScanner.height;

  //         // send back result
  //         resolve({ height, width });
  //       },
  //       false
  //     );
  //     console.log("height");
  //     console.log(videoElement.videoHeight);
  //   });

  //   // console.log("in effect");
  //   // window.open(videoCallback());
  //   // const currentScanner = runningQrScanner.current;
  //   // console.log("Video element:");
  //   // console.log(videoElement);
  // }, []);

  // useEffect(() => {
  //   if (props.redirectMode === "window-open") {
  //     const onMessage = ({ data, source }) => {
  //       props.onReady(data);
  //     };
  //     const registered = window.addEventListener("message", onMessage);
  //     const opened = window.open(props.startUrl);
  //     return () => {
  //       window.removeEventListener("message", onMessage);
  //     };
  //   }
  // }, []);
  // currentScanner.addEventListener("ended", videoCallback);

  // return () => {
  //   currentScanner.removeEventListener("ended", videoCallback);
  //  };
  //}, []);
  // }, [videoCallback]);

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      style={{ marginTop: "2rem" }}
    >
      {scannedCodes.length > 0 && (
        <>
          <Grid item xs={4} />
          <Grid item xs={4} alignItems="right" justifyContent="right">
            {scannedCodes.map((code, i) => (
              <Button
                className={classes.button}
                key={code || uuidv4()}
                variant="contained"
                color={code ? "success" : "error"}
                disableRipple
                style={{ marginRight: "0.5rem" }}
              >
                {`${i + 1}/${scannedCodes.length}`}
              </Button>
            ))}
          </Grid>
          <Grid item xs={4} />
        </>
      )}
      <Grid item xs={4}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          id="test"
          className={classes.qrScanner}
          //autoPlay
          ref={videoRef}
        />
        <img alt="Scan Frame" className={classes.frame} src={frame} />
      </Grid>
    </Grid>
  );
};

export default QrScan;
