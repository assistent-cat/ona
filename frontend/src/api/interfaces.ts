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

interface ListeningMessage {
  msg_type: "listening";
}
interface WaitingForHotwordMessage {
  msg_type: "waiting_for_hotword";
}

export type BusMessage =
  | SpeakMessage
  | RecognizedMessage
  | PlayMediaMessage
  | StopMessage
  | WaitingForHotwordMessage
  | ListeningMessage;
