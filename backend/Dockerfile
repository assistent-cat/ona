FROM assistent/mycroft-catala:ona-0.0.1

RUN addgroup --gid 1001 --system ona && \
    adduser --system --uid 1001 --gid 1001 ona && \
    chown -R ona:ona /opt && \
    chown -R ona:ona /var/log/mycroft

WORKDIR /opt/backend

COPY --chown=ona ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=ona ./ona_backend ./ona_backend
COPY --chown=ona ./supervisord.conf /opt/mycroft/supervisord.conf
COPY --chown=ona ./mycroft.conf /home/ona/.mycroft/mycroft.conf
COPY --chown=ona ./lf_config_hack.py /opt/venv/lib/python3.8/site-packages/lingua_franca/config.py

RUN wget https://github.com/MycroftAI/mycroft-precise/releases/download/v0.3.0/precise-engine_0.3.0_x86_64.tar.gz && tar xvf precise-engine_0.3.0_x86_64.tar.gz
RUN wget https://github.com/MycroftAI/precise-data/raw/models/hey-mycroft.tar.gz && tar xvf hey-mycroft.tar.gz
ENV PYTHONPATH="/opt/backend:${PYTHONPATH}"

USER ona
RUN mkdir -p /home/ona/log/mycroft/
EXPOSE 5678

WORKDIR /opt/mycroft
ENTRYPOINT [ "supervisord", "-c", "/opt/mycroft/supervisord.conf" ]