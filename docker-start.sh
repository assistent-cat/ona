#!/usr/bin/env bash

# Copyright 2017 Mycroft AI Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

SOURCE="${BASH_SOURCE[0]}"

script=${0}
script=${script##*/}
cd -P "$( dirname "$SOURCE" )"
DIR="$( pwd )"

_module=""
function name-to-script-path() {
    case ${1} in
        "bus")               _module="mycroft.messagebus.service" ;;
        "skills")            _module="mycroft.skills" ;;
        "audio")             _module="mycroft.audio" ;;
        "voice")             _module="mycroft.client.speech" ;;
        "cli")               _module="mycroft.client.text" ;;
        "audiotest")         _module="mycroft.util.audio_test" ;;
        "wakewordtest")      _module="test.wake_word" ;;
        "enclosure")         _module="mycroft.client.enclosure" ;;

        *)
            echo "Error: Unknown name '${1}'"
            exit 1
    esac
}

function launch-process() {
    name-to-script-path ${1}

    # Launch process in foreground
    echo "Starting $1"
    python3 -m ${_module} $_params
}

function require-process() {
    # Launch process if not found
    name-to-script-path ${1}
    if ! pgrep -f "python3 (.*)-m ${_module}" > /dev/null ; then
        # Start required process
        launch-background ${1}
    fi
}

function launch-background() {
    # Check if given module is running and start (or restart if running)
    name-to-script-path ${1}
    if pgrep -f "python3 (.*)-m ${_module}" > /dev/null ; then
        if ($_force_restart) ; then
            echo "Restarting: ${1}"
            "${DIR}/stop-mycroft.sh" ${1}
        else
            # Already running, no need to restart
            return
        fi
    else
        echo "Starting background service $1"
    fi

    # Security warning/reminder for the user
    if [[ "${1}" == "bus" ]] ; then
        echo "CAUTION: The Mycroft bus is an open websocket with no built-in security"
        echo "         measures.  You are responsible for protecting the local port"
        echo "         8181 with a firewall as appropriate."
    fi

    # Launch process in background, sending logs to standard location
    python3 -m ${_module} $_params >> /var/log/mycroft/${1}.log 2>&1 &
}

source ./.venv/bin/activate

which python3

launch-background bus
launch-background audio
launch-background skills

tail -F /var/log/mycroft/*.log