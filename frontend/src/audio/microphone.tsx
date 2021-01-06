import React, { useContext, useState } from "react";
import { AudioOutlined } from "@ant-design/icons";

import MicrophoneStream from "microphone-stream";
import L16 from "watson-speech/speech-to-text/webaudio-l16-stream";
import styled from "styled-components";

import { WebSocketContext } from "../api/websocket";
import { AudioStreamer } from "./audiostreamer";
import { AudioBucket } from "./audiobucket";

const MicButton = styled(AudioOutlined)`
  color: ${({ muted }) => (muted ? "lightgray" : "#6a96ff")};
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

      // (micStream as any).on("data", console.log);
      let mediaStream = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
      } catch (err) {
        console.log(err);
      }
      micStream.setStream(mediaStream);
    } else {
      (micStream as any).unpipe(AudioBucket);
    }

    l16Stream = new L16({ writableObjectMode: true });
    (l16Stream as any).on("format", console.log);
    micStream.pipe(l16Stream).pipe(audioStreamer);
  };

  const toggleMic = () => {
    if (ws?.socket) {
      if (muted) {
        startRecognitionStream();
      } else {
        (micStream as any).unpipe(l16Stream);
        (micStream as any).pipe(AudioBucket);
      }
      setMuted((muted) => !muted);
    }
  };
  return <MicButton muted={muted} onMouseUp={toggleMic} />;
};

export default Microphone;
