FROM mycroft-catala:latest

RUN addgroup --gid 1001 --system ona && \
    adduser --system --uid 1001 --gid 1001 ona && \
    chown -R ona:ona /opt && \
    chown -R ona:ona /var/log/mycroft

USER ona
WORKDIR /opt/backend

COPY --chown=ona ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=ona ./main.py ./main.py
COPY --chown=ona ./listener.py ./listener.py
COPY --chown=ona ./speaker.py ./speaker.py
COPY --chown=ona ./supervisord.conf /opt/mycroft/supervisord.conf
COPY --chown=ona ./mycroft.conf /home/ona/.mycroft/mycroft.conf

EXPOSE 5678

WORKDIR /opt/mycroft
ENTRYPOINT [ "supervisord", "-c", "/opt/mycroft/supervisord.conf" ]