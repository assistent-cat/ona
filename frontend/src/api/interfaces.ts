interface SpeakMessage {
  msg_type: "speak";
  utterance: string;
}
interface RecognizedMessage {
  msg_type: "recognized";
  utterance: string;
}

export type BusMessage = SpeakMessage | RecognizedMessage;
