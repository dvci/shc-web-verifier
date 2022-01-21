import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import frame from "assets/frame.png";
import { useQrDataContext } from "components/QrDataProvider";
import QrScanner from "./vendor/qr-scanner";

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

//QrScanner.WORKER_PATH = "./vendor/qr-scanner/qr-scanner-worker.min.js";

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

  const videoCallback = useCallback((videoElement) => {
    console.log(videoElement);
    // code to run on component mount
    qrScan = new QrScanner(
      //runningQrScanner.current,
      videoElement,
      (result) => {
        handleScan(result);
        qrScan.stop();
      },
      (error) => handleError(),
      (videoElement) => ({
        x: 0,
        y: 0,
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      })
    );
    runningQrScanner.current = qrScan;
    qrScan.start();
    return () => {
      qrScan.stop();
    };
  }, []);

  useEffect(() => {
    const currentScanner = runningQrScanner.current;
    // currentScanner.addEventListener("ended", videoCallback);

    // return () => {
    //   currentScanner.removeEventListener("ended", videoCallback);
    //  };
  }, []);
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
        <video className={classes.qrScanner} autoPlay ref={videoCallback} />
        <img alt="Scan Frame" className={classes.frame} src={frame} />
      </Grid>
    </Grid>
  );
};

export default QrScan;
