import { Modal } from "antd";
import React from "react";
import styled from "styled-components";

interface Props {
  visible: boolean;
  setVisible: any;
}

const StyledModal = styled(Modal)`
  max-height: calc(100vh - 225px);
  top: 16px;
  @media screen and (min-width: 700px) {
    max-width: 700px;
  }
`;

const HelpModal: React.FunctionComponent<Props> = ({ visible, setVisible }) => {
  const hide = () => {
    setVisible(false);
  };

  return (
    <StyledModal visible={visible} width="" onCancel={hide} footer={null}>
      <h1>Preguntes freqüents i ajuda</h1>
      <section>
        <h3>Parlo, però no passa res.</h3>
        Per defecte cal sempre dir "Ei, Mycroft" perquè l'assistent t'escolti.
        Si aquesta paraula d'activació ha estat detectada correctament, la icona
        del micròfon es posarà vermella. Si no és així, potser et convé
        desactivar aquesta funció a les opcions.
      </section>
      <section>
        <h3>Fins i tot sense paraula d'activació, parlo i no passa res.</h3>
        Intenta escriure alguna cosa al xat i veure si et respon. Si funciona
        pot ser un problema del teu micròfon. Si no funciona segurament s'hagi
        tallat la connexió, prova de recarregar la pàgina. Si segueix sense
        funcionar paciència, en el fons es tracta només d'una prova de concepte
        😉
      </section>
      <section>
        <h3>Sempre respon "Ho sento, no ho entenc", què li puc preguntar?</h3>
        Les habilitats són limitades, però pots provar el següent:
        <ul>
          <li>Quina hora és?</li>
          <li>El meteo a Vilanova i la Geltrú</li>
          <li>Hauria de portar un paraigua?</li>
          <li>Quin temps fa fora?</li>
          <li>Qui és el president d'Andorra?</li>
          <li>Viquipèdia Mercè Rodoreda</li>
          <li>Cerca dofins</li>
          <li>Repeteix el que dic</li>
          <li>Notícies Catalunya Ràdio</li>
          <li>Explica'm un conte</li>
          <li>Atura't</li>
        </ul>
      </section>
      <section>
        <h3>Com puc afegir habilitats? M'agradaria que l'assistent fes...</h3>
        No és possible, però si saps programar i tens ganes passa't pel xat de
        telegram de{" "}
        <a
          href="https://t.me/Mycroftencatala"
          target="_blank"
          rel="noreferrer noopener"
        >
          Mycroft en Català
        </a>
      </section>
      <section>
        <h3>Funciona molt malament.</h3>
        <p>
          Em sap greu. Darrere aquest assistent no hi ha cap gran empresa com
          Amazon o Google ni tampoc té una finalitat comercial. Es tracta d'una
          simple prova de concepte per demostrar que és possible crear
          assistents de veu en català. Un assistent de veu generalista, que
          pugui respondre correctament a qualsevol pregunta és molt difícil de
          fer.
        </p>
        <p>
          Tant Alexa com Google Assistant requereixen activar primer una
          habilitat abans d'interaccionar amb ella. D'aquesta manera tant el
          reconeixement de la parla com la comprensió de la llengua queden
          limitats al domini lingüístic de l'habilitat, cosa que millora
          substancialment la precisió.
        </p>
        <p>
          Mycroft, en canvi, té sempre totes les habilitats actives i competint
          per processar la teva comanda o pregunta. Això fa que, si no es
          desenvolupen les habilitats com a conjunt, sovint hi hagi comandes que
          es repeteixen en més d'una habilitat, provocant comportaments
          estranys.
        </p>
      </section>
      <section>
        <h3>Qui hi ha darrere de tot això?</h3>
        <p>
          L'Ona i en Pau no serien possibles sense:
          <ul>
            <li>
              <a
                href="https://www.softcatala.org/"
                target="_blank"
                rel="noreferrer noopener"
              >
                Softcatalà
              </a>{" "}
              i les estudiants del màster de Tradumàtica de la UAB, que han
              traduït{" "}
              <a
                href="https://www.softcatala.org/projectes/mycroft/"
                target="_blank"
                rel="noreferrer noopener"
              >
                Mycroft al català
              </a>
            </li>
            <li>
              El projecte{" "}
              <a
                href="http://festcat.talp.cat/readme.php"
                target="_blank"
                rel="noreferrer noopener"
              >
                FestCat
              </a>
              , desenvolupat pel centre TALP de la UPC i finançat per la
              Generalitat de Catalunya, que el 2007 van crear les veus pel
              projecte Festival.
            </li>
            <li>
              <a
                href="https://collectivat.cat/"
                target="_blank"
                rel="noreferrer noopener"
              >
                Col·lectivaT
              </a>
              , que ha creat les veus neuronals i va organitzar les primeres
              jornades sobre tecnologies lingüístiques lliures en català,
            </li>
            <li>
              El projecte{" "}
              <a
                href="https://commonvoice.mozilla.org/ca/speak"
                target="_blank"
                rel="noreferrer noopener"
              >
                Common Voice
              </a>{" "}
              i tothom que hi ha col·laborat enregistrant i validant talls de
              veu, gràcies als quals ha estat possible entrenar els primers
              models de reconeixement de la llengua lliures pel Català
            </li>
          </ul>
          El{" "}
          <a
            href="https://github.com/assistent-cat/ona"
            target="_blank"
            rel="noreferrer noopener"
          >
            projecte Ona
          </a>
          , que utilitza totes aquestes les tecnologies, té com a desenvolupador
          principal Ciaran O'Reilly. Pots trobar més informació sobre les
          tecnologies de la llengua en català{" "}
          <a
            href="https://www.softcatala.org/tecnologies-de-la-llengua-en-catala/"
            target="_blank"
            rel="noreferrer noopener"
          >
            aquí
          </a>{" "}
          i{" "}
          <a
            href="http://www.assistent.cat/"
            target="_blank"
            rel="noreferrer noopener"
          >
            aquí
          </a>
          .
        </p>
      </section>
    </StyledModal>
  );
};

export default HelpModal;
