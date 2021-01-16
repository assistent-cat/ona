import React, { useContext, useState } from "react";
import { AudioMutedOutlined, AudioOutlined } from "@ant-design/icons";

import MicrophoneStream from "microphone-stream";
import L16 from "watson-speech/speech-to-text/webaudio-l16-stream";
import styled from "styled-components";

import { WebSocketContext } from "../api/websocket";
import { AudioStreamer } from "./audiostreamer";
import { AudioBucket } from "./audiobucket";

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
  const [muted, setMuted] = useState(true);
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

  const toggleMic = () => {
    if (ws?.socket && ws.socket.readyState === 1) {
      if (muted) {
        startRecognitionStream();
      } else {
        (micStream as any).unpipe(l16Stream);
        (micStream as any).pipe(AudioBucket);
      }
      setMuted((muted) => !muted);
    }
  };
  return muted ? (
    <MicButtonOff onMouseUp={toggleMic} />
  ) : (
    <MicButtonOn onMouseUp={toggleMic} />
  );
};

export default Microphone;
