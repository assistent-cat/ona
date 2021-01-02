interface SpeakMessage {
  msg_type: "speak";
  utterance: string;
}

export type BusMessage = SpeakMessage;
