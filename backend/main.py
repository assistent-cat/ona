from jarbas_hive_mind import get_listener
from jarbas_hive_mind.configuration import CONFIGURATION
from jarbas_hive_mind.master import HiveMind, HiveMindProtocol
from jarbas_hive_mind.database import ClientDatabase
from ovos_utils.log import LOG


class OnaBackendProtocol(HiveMindProtocol):
    def onMessage(self, payload, isBinary):
        if isBinary:
            LOG.debug(
                "Binary message received: {0} bytes".format(len(payload)))
        else:
            payload = self.decode(payload)
            LOG.debug(
                "Missatge de text rebut: {0}".format(payload))

        self.factory.on_message(self, payload, isBinary)


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

    print("test")

    factory = HiveMind(bus=listener.bus, announce=False)
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
