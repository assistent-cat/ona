import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import "./index.css";
import App from "./app";
import store from "./store";
import WebSocketProvider from "./api/websocket";
import SpeakerProvider from "./audio/speaker";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <SpeakerProvider>
        <WebSocketProvider>
          <App />
        </WebSocketProvider>
      </SpeakerProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
