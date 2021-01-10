FROM mycroft-catala:latest

COPY ./hivemind-core/setup.py /opt/hivemind/setup.py
COPY ./hivemind-core/jarbas_hive_mind /opt/hivemind/jarbas_hive_mind

RUN pip install --no-cache-dir /opt/hivemind
RUN which python
ENV PATH="/opt/venv/bin:$PATH"
RUN which python

RUN pip install --no-cache-dir git+http://github.com/JarbasLingua/jarbas-stt-plugin-vosk.git
RUN pip install --no-cache-dir git+https://github.com/JarbasLingua/jarbas-tts-plugin-catotron.git

COPY ./backend/requirements.txt /opt/backend/requirements.txt
RUN pip install --no-cache-dir -r /opt/backend/requirements.txt