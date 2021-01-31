import { AudioMutedOutlined, AudioOutlined } from "@ant-design/icons";
import MicrophoneStream from "microphone-stream";
import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import L16 from "watson-speech/speech-to-text/webaudio-l16-stream";

import { WebSocketContext } from "../api/websocket";
import { RootState } from "../rootReducer";
import { AudioStreamer } from "./audiostreamer";
import { AudioBucket } from "./audiobucket";
import { toggleMicrophone } from "./mediaSlice";

const MicButtonOn = styled(AudioOutlined)`
  color: #6a96ff;
  box-sizing: border-box;
  padding: 0.2rem 0 0.2rem 0.5rem;
  > svg {
    height: 3rem;
    width: 3rem;
  }
  cursor: pointer;
`;

const MicButtonOff = styled(AudioMutedOutlined)`
  color: lightgray;
  box-sizing: border-box;
  padding: 0.2rem 0 0.2rem 0.5rem;
  > svg {
    height: 3rem;
    width: 3rem;
  }
  cursor: pointer;
`;

interface Props {}

let micStream: MicrophoneStream;
let l16Stream: L16;

const Microphone: React.FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const muted = useSelector<RootState, boolean>(
    (state) => state.media.human.muted
  );

  const ws = useContext(WebSocketContext);

  const startRecognitionStream = async () => {
    const audioStreamer = new AudioStreamer(ws.socket);
    if (!micStream) {
      micStream = new MicrophoneStream({
        objectMode: true,
        bufferSize: 1024,
      });

      let mediaStream = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 16000,
          },
        });
        micStream.setStream(mediaStream);
      } catch (err) {
        console.log(err);
      }
    } else {
      (micStream as any).unpipe(AudioBucket);
    }

    l16Stream = new L16({ writableObjectMode: true });
    micStream.pipe(l16Stream).pipe(audioStreamer);
  };

  useEffect(() => {
    if (ws?.socket && ws.socket.readyState === 1) {
      if (!muted) {
        startRecognitionStream();
      } else {
        micStream.unpipe(l16Stream);
        micStream.pipe(AudioBucket);
      }
    }
  }, [muted]);

  const toggleMic = () => {
    dispatch(toggleMicrophone());
  };

  return muted ? (
    <MicButtonOff onMouseUp={toggleMic} />
  ) : (
    <MicButtonOn onMouseUp={toggleMic} />
  );
};

export default Microphone;
