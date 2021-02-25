import {
  AudioOutlined,
  CommentOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import { Modal } from "antd";
import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";

import { WebSocketContext } from "./api/websocket";
import { toggleMicrophone } from "./audio/mediaSlice";

interface Props {}

const ES_PAU = /pau/.test(window.location.hostname);

const NOM_ASSISTENT = ES_PAU ? "Pau" : "Ona";
const NOM_AMB_ARTICLE = ES_PAU ? "en Pau" : "l'Ona";
const INTRO = ES_PAU
  ? "En Pau és un assistent de veu en català."
  : "L'Ona és una assistent de veu en català.";

const MicButtonOn = styled(AudioOutlined)`
  color: red;
  box-sizing: border-box;
  padding: 0.2rem;
  > svg {
    height: 1.2rem;
    width: 1.2rem;
  }
`;

const ChatButton = styled(CommentOutlined)`
  color: #6a96ff;
  box-sizing: border-box;
  padding: 0.2rem;
  > svg {
    height: 1.2rem;
    width: 1.2rem;
  }
`;

const SettingsButton = styled(SettingOutlined)`
  color: gray;
  box-sizing: border-box;
  padding: 0.2rem;
  > svg {
    height: 1.2rem;
    width: 1.2rem;
  }
`;

const HelpButton = styled(QuestionCircleOutlined)`
  color: gray;
  box-sizing: border-box;
  padding: 0.2rem;
  > svg {
    height: 1.2rem;
    width: 1.2rem;
  }
`;

const StyledModal = styled(Modal)`
  max-height: calc(100vh - 225px);
  top: 16px;
  @media screen and (min-width: 700px) {
    max-width: 700px;
  }
`;

const Destacat = styled.span`
  color: #f38181;
  font-weight: bold;
  font-size: 1rem;
`;

const IntroModal: React.FunctionComponent<Props> = () => {
  const [visible, setVisible] = useState(true);
  const dispatch = useDispatch();
  const ws = useContext(WebSocketContext);

  const onOk = () => {
    hide();
    dispatch(toggleMicrophone());
  };

  const hide = () => {
    setVisible(false);
    ws.socket.send(
      JSON.stringify({
        msg_type: "welcome",
        payload: {},
      })
    );
  };

  return (
    <StyledModal
      visible={visible}
      onOk={onOk}
      okText="Activa el micròfon"
      onCancel={hide}
      cancelText="Prova sense micròfon"
      width=""
    >
      <h1>{NOM_ASSISTENT}, un Mycroft en català</h1>
      <p>
        {INTRO} Una petita demostració del que és possible gràcies als esforços
        de la comunitat de programari lliure catalana i d'entitats com{" "}
        <a
          href="https://www.softcatala.org"
          target="_blank"
          rel="noreferrer noopener"
        >
          Softcatalà
        </a>{" "}
        i{" "}
        <a
          href="https://collectivat.cat"
          target="_blank"
          rel="noreferrer noopener"
        >
          Col·lectivaT
        </a>
        .
      </p>
      <p>
        Per parlar amb {NOM_AMB_ARTICLE} cal primer pronunciar la paraula
        d'activació "Ei, Mycroft" (ei mai croft) seguit de la pregunta o l'ordre
        que volem. Per exemple:{" "}
        <Destacat>"Ei, Mycroft. Quina hora és?"</Destacat>.
      </p>
      <p>
        <MicButtonOn />
        Si es detecta la paraula d'activació, la icona del micròfon es posarà de
        color vermell
      </p>
      <p>
        <SettingsButton />
        Si creus que no acaba d'entendre la paraula d'activació, la pots
        desactivar a les opcions i parlar directament sense haver de dir "Ei,
        Mycroft". També pots seleccionar una de les veus neuronals que, si bé
        són més lentes, sonen millor.
      </p>
      <p>
        <ChatButton />
        Clicant la icona del xat podràs veure què ha reconegut l'assistent.
      </p>
      <p>
        <HelpButton />
        Si no saps què fer, fes clic a la icona d'ajuda
      </p>
      <p>
        El{" "}
        <a
          href="https://github.com/assistent-cat/ona"
          target="_blank"
          rel="noreferrer noopener"
        >
          codi d'en Pau i l'Ona
        </a>{" "}
        és completament obert i amb llicència AGPL. No s'emmagatzema cap
        interacció ni àudio (que només es fa servir durant el processament
        necessari per al reconeixement de la parla), la teva privacitat és
        important.
      </p>
      <p>
        <a
          href="https://www.assistent.cat"
          target="_blank"
          rel="noreferrer noopener"
        >
          Fes clic aquí per saber més sobre els components i projectes que fan
          possible {NOM_AMB_ARTICLE}.
        </a>
      </p>
    </StyledModal>
  );
};

export default IntroModal;
