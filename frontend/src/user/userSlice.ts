import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Configuration {
  useHotword: boolean;
  ttsEngine: "catotron" | "festival";
  ttsVoice: "ona" | "pau";
}

export interface UserState {
  configuration: Configuration;
  sidebarOpen: boolean;
}

let initialState: UserState = {
  configuration: {
    useHotword: true,
    ttsEngine: "catotron",
    ttsVoice: "ona",
  },
  sidebarOpen: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUser(state) {
      state = initialState;
    },
    toggleUseHotword(state) {
      state.configuration.useHotword = !state.configuration.useHotword;
    },
    toggleSettingsSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTTSEngine(state, action: PayloadAction<Configuration["ttsEngine"]>) {
      state.configuration.ttsEngine = action.payload;
    },
    setTTSVoice(state, action: PayloadAction<Configuration["ttsVoice"]>) {
      state.configuration.ttsVoice = action.payload;
    },
    closeSettingsSidebar(state) {
      state.sidebarOpen = false;
    },
  },
});

export const {
  resetUser,
  toggleUseHotword,
  toggleSettingsSidebar,
  closeSettingsSidebar,
  setTTSEngine,
  setTTSVoice,
} = userSlice.actions;

export default userSlice.reducer;
