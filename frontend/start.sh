#!/bin/bash

ENV_JS_FILE="/usr/share/nginx/html/env-config.js"
touch "$ENV_JS_FILE"
echo "window.envConfig = {" >> "$ENV_JS_FILE"; \
echo '"BACKEND_HOST"': "\"$ONA_CONFIG_BACKEND_HOST\"," >> "$ENV_JS_FILE"
echo '"BACKEND_PORT"': "\"$ONA_CONFIG_BACKEND_PORT\"," >> "$ENV_JS_FILE"
echo '"BACKEND_PATH"': "\"$ONA_CONFIG_BACKEND_PATH\"," >> "$ENV_JS_FILE"
echo '"USE_SSL"': "\"$ONA_CONFIG_USE_SSL\"," >> "$ENV_JS_FILE"
echo "};" >> "$ENV_JS_FILE";

exec nginx -g 'daemon off;'
