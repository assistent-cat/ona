FROM mycroft-catala:latest

COPY ./hivemind-core/setup.py /opt/hivemind/setup.py
COPY ./hivemind-core/jarbas_hive_mind /opt/hivemind/jarbas_hive_mind

RUN pip install /opt/hivemind
RUN which python
ENV PATH="/opt/venv/bin:$PATH"
RUN which python

RUN pip install git+http://github.com/JarbasLingua/jarbas-stt-plugin-vosk.git

COPY ./backend/requirements.txt /opt/backend/requirements.txt
RUN pip install -r /opt/backend/requirements.txt