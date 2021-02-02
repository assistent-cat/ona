import { combineReducers } from "@reduxjs/toolkit";

import chatReducer from "./chat/chatSlice";
import mediaReducer from "./audio/mediaSlice";
import userReducer from "./user/userSlice";

const rootReducer = combineReducers({
  chat: chatReducer,
  media: mediaReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
