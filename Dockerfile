FROM ubuntu:18.04

ENV TERM linux
ENV DEBIAN_FRONTEND noninteractive

# Install Server Dependencies for Mycroft
RUN set -x \
	&& sed -i 's/# \(.*multiverse$\)/\1/g' /etc/apt/sources.list \
	&& apt-get update \
	&& apt-get -y install git python3 python3-pip locales sudo python3-dev python3-setuptools libtool \
	libffi-dev libssl-dev autoconf automake bison swig libglib2.0-dev \
	portaudio19-dev mpg123 screen flac curl libicu-dev pkg-config \
	libjpeg-dev libfann-dev build-essential jq pulseaudio  \
	pulseaudio-utils festival festvox-ca-ona-hts lame vlc mplayer \
	&& pip3 install future

COPY ./mycroft-core/mycroft /opt/mycroft/mycroft
COPY ./mycroft-core/bin /opt/mycroft/bin
COPY ./mycroft-core/scripts /opt/mycroft/scripts
COPY ./docker_setup.sh /opt/mycroft/docker_setup.sh
COPY ./docker-requirements.txt /opt/mycroft/docker-requirements.txt

COPY ./hivemind-core/setup.py /opt/hivemind/setup.py
COPY ./hivemind-core/jarbas_hive_mind /opt/hivemind/jarbas_hive_mind

RUN CI=true /opt/mycroft/docker_setup.sh --allow-root -sm \
	&& apt-get -y autoremove \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set the locale
RUN locale-gen ca_ES.UTF-8
ENV LANG ca_ES.UTF-8
ENV LANGUAGE ca_ES:en
ENV LC_ALL ca_ES.UTF-8

WORKDIR /opt/mycroft
ENV PYTHONPATH $PYTHONPATH:/mycroft/ai

RUN echo "PATH=$PATH:/opt/mycroft/bin" >> $HOME/.bashrc \
	&& echo "source /opt/mycroft/.venv/bin/activate" >> $HOME/.bashrc

EXPOSE 8181