import { combineReducers } from "@reduxjs/toolkit";

import chatReducer from "./chat/chatSlice";

const rootReducer = combineReducers({
  chat: chatReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
