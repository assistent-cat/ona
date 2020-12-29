#!/usr/bin/env bash
#
# Copyright 2020 Ciaran O'Reilly
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
##########################################################################

# Set a default locale to handle output from commands reliably
export LANG=C.UTF-8

# exit on any error
set -Ee

cd $(dirname $0)
TOP=$(pwd -L)

function clean_mycroft_files() {
    echo '
This will completely remove any files installed by mycroft (including pairing
information).
Do you wish to continue? (y/n)'
    while true; do
        read -N1 -s key
        case $key in
        [Yy])
            sudo rm -rf /var/log/mycroft
            rm -f /var/tmp/mycroft_web_cache.json
            rm -rf "${TMPDIR:-/tmp}/mycroft"
            rm -rf "$HOME/.mycroft"
            sudo rm -rf "/opt/mycroft"
            exit 0
            ;;
        [Nn])
            exit 1
            ;;
        esac
    done
    

}
function show_help() {
    echo '
Usage: dev_setup.sh [options]
Prepare your environment for running the mycroft-core services.

Options:
    --clean                 Remove files and folders created by this script
    -h, --help              Show this message
    -n, --no-error          Do not exit on error (use with caution)
    -p arg, --python arg    Sets the python version to use
'
}

# Parse the command line
opt_python=python3
param=''

for var in "$@" ; do
    # Check if parameter should be read
    if [[ $param == 'python' ]] ; then
        opt_python=$var
        param=""
        continue
    fi

    # Check for options
    if [[ $var == '-h' || $var == '--help' ]] ; then
        show_help
        exit 0
    fi

    if [[ $var == '--clean' ]] ; then
        if clean_mycroft_files; then
            exit 0
        else
            exit 1
        fi
    fi
    
    if [[ $var == '-n' || $var == '--no-error' ]] ; then
        # Do NOT exit on errors
	set +Ee
    fi

    if [[ $var == '-p' || $var == '--python' ]] ; then
        param='python'
    fi
done

# function found_exe() {
#     hash "$1" 2>/dev/null
# }


# function alpine_install() {
#     $SUDO apk add alpine-sdk git python3 py3-pip py3-setuptools py3-virtualenv mpg123 vorbis-tools pulseaudio-utils fann-dev automake autoconf libtool pcre2-dev pulseaudio-dev alsa-lib-dev swig python3-dev portaudio-dev libjpeg-turbo-dev
# }

# VIRTUALENV_ROOT=${VIRTUALENV_ROOT:-"${TOP}/.venv"}

# function install_venv() {
#     $opt_python -m venv "${VIRTUALENV_ROOT}/" --without-pip
#     # Force version of pip for reproducability, but there is nothing special
#     # about this version.  Update whenever a new version is released and
#     # verified functional.
#     curl https://bootstrap.pypa.io/get-pip.py | "${VIRTUALENV_ROOT}/bin/python" - 'pip==20.3.1'
#     # Function status depending on if pip exists
#     [[ -x ${VIRTUALENV_ROOT}/bin/pip ]]
# }

# if [[ ! -x ${VIRTUALENV_ROOT}/bin/activate ]] ; then
#     if ! install_venv ; then
#         echo 'Failed to set up virtualenv for mycroft, exiting setup.'
#         exit 1
#     fi
# fi

# # Start the virtual environment
# source "${VIRTUALENV_ROOT}/bin/activate"
# cd "$TOP"

# PYTHON=$(python -c "import sys;print('python{}.{}'.format(sys.version_info[0], sys.version_info[1]))")

# # Add mycroft-core to the virtualenv path
# # (This is equivalent to typing 'add2virtualenv $TOP', except
# # you can't invoke that shell function from inside a script)
# VENV_PATH_FILE="${VIRTUALENV_ROOT}/lib/$PYTHON/site-packages/_virtualenv_path_extensions.pth"
# if [[ ! -f $VENV_PATH_FILE ]] ; then
#     echo 'import sys; sys.__plen = len(sys.path)' > "$VENV_PATH_FILE" || return 1
#     echo "import sys; new=sys.path[sys.__plen:]; del sys.path[sys.__plen:]; p=getattr(sys,'__egginsert',0); sys.path[p:p]=new; sys.__egginsert = p+len(new)" >> "$VENV_PATH_FILE" || return 1
# fi

# if ! grep -q "$TOP" $VENV_PATH_FILE ; then
#     echo 'Adding mycroft-core to virtualenv path'
#     sed -i.tmp '1 a\
# '"$TOP"'
# ' "$VENV_PATH_FILE"
# fi

# # install required python modules
# if ! pip install -r docker-requirements.txt ; then
#     echo 'Error: Failed to install required dependencies. Exiting'
#     exit 1
# fi

# # set permissions for common scripts
# chmod +x bin/mycroft-cli-client
# chmod +x bin/mycroft-help
# chmod +x bin/mycroft-mic-test
# chmod +x bin/mycroft-msk
# chmod +x bin/mycroft-msm
# chmod +x bin/mycroft-pip
# chmod +x bin/mycroft-say-to
# chmod +x bin/mycroft-skill-testrunner
# chmod +x bin/mycroft-speak

# create and set permissions for logging
# if [[ ! -w /var/log/mycroft/ ]] ; then
#     # Creating and setting permissions
#     echo 'Creating /var/log/mycroft/ directory'
#     if [[ ! -d /var/log/mycroft/ ]] ; then
#         $SUDO mkdir /var/log/mycroft/
#     fi
#     $SUDO chmod 777 /var/log/mycroft/
# fi

git clone https://github.com/MycroftAI/lingua-franca
pip install lingua-franca/

bin/mycroft-pip install jarbas_stt_plugin_vosk

msm install https://github.com/JarbasSkills/skill-wolfie


git clone https://github.com/jmontane/mycroft-update-translations
pip install -r mycroft-update-translations/requirements.txt
python mycroft-update-translations/mycroft-update-translations.py

# if [[ ! $(git clone https://github.com/softcatala/lingua-franca) ]] ; then
#     echo 'Failed cloning catalan lingua-franca'
# fi

# if [[ ! $(pip install lingua-franca/) ]] ; then
#     echo 'Failed installing catalan lingua-franca'
# fi

# if [[ ! $(git clone https://github.com/jmontane/mycroft-update-translations) ]] ; then
#     echo 'Failed cloning jmontane translation update script'
# fi

# echo 'Installing requirements for translation update'
# if [[ ! $(pip install -r mycroft-update-translations/requirements.txt) ]] ; then
#     echo 'Failed installing requirements for jmontane translation update script'
# fi

# echo 'Updating translations'
# if [[ ! $($PYTHON mycroft-update-translations/mycroft-update-translations.py) ]] ; then
#     echo 'Failed updating translations'
# fi
    
#Store a fingerprint of setup
# md5sum docker-requirements.txt docker_setup.sh > .installed
