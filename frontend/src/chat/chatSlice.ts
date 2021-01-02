import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  type: "bot" | "human";
  message: string;
}

export interface ChatState {
  messages: ChatMessage[];
}

let initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    appendChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages = [...state.messages, action.payload];
    },
    resetChat(state) {
      state = initialState;
    },
  },
});

export const { appendChatMessage, resetChat } = chatSlice.actions;

export default chatSlice.reducer;
