declare module window {
  export const envConfig: {
    BACKEND_HOST: string;
    BACKEND_PORT: string;
    BACKEND_PATH: string;
    USE_SSL: boolean;
  };
}

export const WS_HOST = window?.envConfig?.BACKEND_HOST || "127.0.0.1";
export const WS_PORT = window?.envConfig?.BACKEND_PORT || "80";
export const WS_PATH = window?.envConfig?.BACKEND_PATH || "";
export const WS_URL = `${
  window?.envConfig?.USE_SSL ? "wss" : "ws"
}://${WS_HOST}:${WS_PORT}/${WS_PATH}`;
