import { createSlice } from "@reduxjs/toolkit";

export interface Configuration {
  useHotword: boolean;
}

export interface UserState {
  configuration: Configuration;
  sidebarOpen: boolean;
}

let initialState: UserState = {
  configuration: {
    useHotword: true,
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
} = userSlice.actions;

export default userSlice.reducer;
