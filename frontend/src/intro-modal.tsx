import { Modal } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import styled from "styled-components";
import { toggleMicrophone } from "./audio/mediaSlice";
interface Props {}

const Destacat = styled.span`
  color: #f38181;
  font-weight: bold;
  font-size: 1.1rem;
`;

const IntroModal: React.FunctionComponent<Props> = () => {
  const [visible, setVisible] = useState(true);
  const dispatch = useDispatch();

  const onOk = () => {
    hide();
    dispatch(toggleMicrophone());
  };
  const hide = () => {
    setVisible(false);
  };

  return (
    <Modal
      visible={visible}
      onOk={onOk}
      okText="Activa el micròfon"
      onCancel={hide}
      cancelText="Prova sense micròfon"
    >
      <h1>Ona, un Mycroft en català</h1>
      <p>
        L'Ona és una assistent de veu en català que és possible només gràcies
        als esforços de la comunitat de programari lliure catalana i d'entitats
        com{" "}
        <a href="https://www.softcatala.org" target="_blank">
          Softcatalà
        </a>{" "}
        i{" "}
        <a href="https://collectivat.cat" target="_blank">
          Col·lectivaT
        </a>
        .
      </p>
      <p>
        Per parlar amb l'Ona cal primer pronunciar la paraula d'activació "Ei,
        Mycroft" (ei mai croft) seguit de la pregunta o l'ordre que volem. Per
        exemple: <Destacat>"Ei, Mycroft. Quina hora és?"</Destacat>
      </p>
      <p>
        El codi de l'Ona és completament obert i amb llicència AGPL. No
        s'emmagatzema cap interacció amb l'Ona (inclòs l'audio, que només es fa
        servir durant el processament necessari per al reconeixement de la
        parla), la teva privacitat és important.
      </p>
      <p>
        <a href="https://www.assistent.cat">
          Fes clic aquí per saber més sobre dels projectes que fan possible
          l'Ona.
        </a>
      </p>
    </Modal>
  );
};

export default IntroModal;
