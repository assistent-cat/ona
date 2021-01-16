import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import "./index.css";
import App from "./app";
import store from "./store";
import WebSocketProvider from "./api/websocket";
import AudioPlayerProvider from "./audio/player";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <AudioPlayerProvider>
        <WebSocketProvider>
          <App />
        </WebSocketProvider>
      </AudioPlayerProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
