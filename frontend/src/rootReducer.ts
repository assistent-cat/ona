import { combineReducers } from "@reduxjs/toolkit";

import chatReducer from "./chat/chatSlice";
import mediaReducer from "./audio/mediaSlice";

const rootReducer = combineReducers({
  chat: chatReducer,
  media: mediaReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
