import json

from jarbas_hive_mind import get_listener
from jarbas_hive_mind.configuration import CONFIGURATION
from jarbas_hive_mind.master import HiveMind, HiveMindProtocol
from jarbas_hive_mind.database import ClientDatabase
from ovos_utils.log import LOG
from ovos_utils.messagebus import Message
from mycroft.stt import STTFactory
from mycroft.configuration import Configuration


class OnaBackendProtocol(HiveMindProtocol):
    def onConnect(self, request):

        LOG.info("Client connecting: {0}".format(request.peer))

        ip = request.peer.split(":")[1]
        context = {"source": self.peer}
        self.platform = request.headers.get("platform", "unknown")

        self.crypto_key = None
        # send message to internal mycroft bus
        data = {"ip": ip, "headers": request.headers}

        self.blacklist = {
            "messages": [],
            "skills": [],
            "intents": []
        }
        self.factory.mycroft_send("hive.client.connect", data, context)
        # return a pair with WS protocol spoken (or None for any) and
        # custom headers to send in initial WS opening handshake HTTP response
        headers = {"server": self.platform}
        return (None, headers)

    def onMessage(self, payload, isBinary):
        if isBinary:
            LOG.debug(
                "Binary message received: {0} bytes".format(len(payload)))
        else:
            payload = self.decode(payload)
            LOG.debug(
                "Missatge de text rebut: {0}".format(payload))

        self.factory.on_message_from_client(self, payload, isBinary)


class OnaFactory(HiveMind):
    def register_mycroft_messages(self):
        self.bus.on("message", self.on_message_from_mycroft)

    def on_message_from_client(self, client, payload, isBinary):
        """
       Process message from client, decide what to do internally here
       """

        if isBinary:
            print(payload)
            pass
        else:
            # Check protocol
            data = json.loads(payload)
            payload = data["payload"]
            msg_type = data["msg_type"]

            if msg_type == "recognized_utterance":
                utterance = payload.get('utterance')
                bus_message = {
                    "type": "recognizer_loop:utterance",
                    "data": {
                        "utterances": [utterance],
                        "context": {
                            "source": "WebChat",
                            "destination": "HiveMind",
                            "platform": "JarbasWebchatTerminalV0.1",
                            "client_name": "ei"
                        }
                    },
                }
                self.handle_bus_message(bus_message, client)

    def on_message_from_mycroft(self, message=None):
        # forward internal messages to clients if they are the target
        if isinstance(message, dict):
            message = json.dumps(message)
        if isinstance(message, str):
            message = Message.deserialize(message)

        LOG.debug(
            "Missatge de tipus: {0}".format(message.msg_type))
        if message.msg_type != "speak":
            return

        if message.msg_type == "complete_intent_failure":
            message.msg_type = "hive.complete_intent_failure"
        message.context = message.context or {}
        LOG.debug(
            "Missatge de mycroft rebut: {0}".format(message.serialize()))
        peers = message.context.get("destination") or []
        if not isinstance(peers, list):
            peers = [peers]
        for peer in peers:
            if peer and peer in self.clients:
                client = self.clients[peer].get("instance")
                payload = {"msg_type": "speak",
                           "utterance": message.data['utterance']
                           }
                self.interface.send(payload, client)


def start_mind(config=None, bus=None):

    config = config or CONFIGURATION

    with ClientDatabase() as db:
        db.add_client('unsafe', 'ciaran@oreilly.cat',
                      'unsafe', crypto_key=None)
        print(f"Total clients: {db.total_clients}")
    # listen
    listener = get_listener(bus=bus)

    # use http
    config["ssl"]["use_ssl"] = False

    # read port and ssl settings
    listener.load_config(config)

    # stt = STTFactory.create()
    print("test")
    config_core = Configuration.get()
    print(config_core.get("stt", {}))

    factory = OnaFactory(bus=listener.bus, announce=False)
    listener.listen(factory=factory, protocol=OnaBackendProtocol)


if __name__ == '__main__':
    # TODO argparse
    start_mind()

    # that's it, now external applications can connect to the HiveMind

    # use configuration to set things like
    #  - blacklisted/whitelisted ips
    #  - blacklisted/whitelisted message_types
    #  - blacklisted/whitelisted intents - Coming soon
    #  - blacklisted/whitelisted skills  - Coming soon

    # you can send messages to the mycroft bus to send/broadcast to clients
    # 'Message(hive.client.broadcast',
    #           {"payload":
    #               {"msg_type": "speak",
    #               "data": {"utterance": "Connected to the HiveMind"}
    #           })

    # or you can listen to hive mind events
    # "hive.client.connection.error"
    # "hive.client.connect"
    # "hive.client.disconnect"
    # "hive.client.send.error"
