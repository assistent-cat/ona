import { MediaTrack } from "../audio/mediaSlice";

interface SpeakMessage {
  msg_type: "speak";
  utterance: string;
}
interface RecognizedMessage {
  msg_type: "recognized";
  utterance: string;
}
interface PlayMediaMessage {
  msg_type: "play";
  data: MediaTrack;
}

interface StopMessage {
  msg_type: "stop";
}

export type BusMessage =
  | SpeakMessage
  | RecognizedMessage
  | PlayMediaMessage
  | StopMessage;
