import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  type: "bot" | "human";
  message: string;
}

export interface ChatState {
  messages: ChatMessage[];
  sidebarOpen: boolean;
}

let initialState: ChatState = {
  messages: [],
  sidebarOpen: false,
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
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
  },
});

export const {
  appendChatMessage,
  resetChat,
  toggleSidebar,
  closeSidebar,
} = chatSlice.actions;

export default chatSlice.reducer;
