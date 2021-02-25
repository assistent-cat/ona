import { Radio } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { LeftOutlined } from "@ant-design/icons";

import { RootState } from "../rootReducer";
import {
  closeSettingsSidebar,
  Configuration,
  setTTSEngine,
  setTTSVoice,
  toggleUseHotword,
} from "./userSlice";
import { setListening } from "../audio/mediaSlice";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SettingsWrapper = styled.div`
  overflow: auto;
  margin-top: 40px;
  padding: 0 24px;
  flex: 1;
`;

const SettingsHeader = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: row-reverse;
`;

const SettingsColumnElement = styled.div`
  width: 100%;
  margin-top: 1rem;
`;

const SettingsColumnTitle = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const SettingsTitle = styled.div`
  width: 100%;
  left: auto;
  right: auto;
  box-sizing: border-box;
  line-height: 2rem;
  font-weight: bold;
  font-size: 2rem;
  text-align: center;
  color: #888888;
`;

const SettingsClose = styled(LeftOutlined)`
  color: lightgray;
  z-index: 10;
  box-sizing: border-box;
  > svg {
    height: 2rem;
    width: 2rem;
  }
  cursor: pointer;
`;

const hotwordOptions = [
  { label: "Ei, Mycroft", value: true },
  { label: "Desactivada", value: false },
];

const ttsOptions = [
  { label: "Ona (Festival)", value: "ona-festival" },
  { label: "Pau (Festival)", value: "pau-festival" },
  { label: "Ona (Catotron)", value: "ona-catotron" },
  { label: "Pau (Catotron)", value: "pau-catotron" },
];

interface Props {}

const Settings: React.FunctionComponent<Props> = () => {
  const dispatch = useDispatch();

  const configuration = useSelector<RootState, Configuration>(
    (state) => state.user.configuration
  );

  const onChangeHotword = (e: RadioChangeEvent) => {
    dispatch(toggleUseHotword());
    dispatch(setListening(!e.target.value));
  };

  const onChangeTTSVoice = (e: RadioChangeEvent) => {
    const value = e.target.value;
    const [voice, engine] = value.split("-");
    dispatch(setTTSEngine(engine));
    dispatch(setTTSVoice(voice));
  };

  return (
    <ContentWrapper>
      <SettingsHeader>
        <SettingsClose onMouseUp={(e) => dispatch(closeSettingsSidebar())} />
        <SettingsTitle>Configuració</SettingsTitle>
      </SettingsHeader>
      <SettingsWrapper>
        <SettingsColumnElement>
          <SettingsColumnTitle>Paraula d'activació</SettingsColumnTitle>
          <Radio.Group
            options={hotwordOptions}
            optionType="button"
            value={configuration.useHotword}
            buttonStyle="solid"
            onChange={onChangeHotword}
          />
        </SettingsColumnElement>
        <SettingsColumnElement>
          <SettingsColumnTitle>Veu de l'assistent</SettingsColumnTitle>
          <Radio.Group
            options={ttsOptions}
            optionType="button"
            value={`${configuration.ttsVoice}-${configuration.ttsEngine}`}
            buttonStyle="solid"
            onChange={onChangeTTSVoice}
          />
        </SettingsColumnElement>
      </SettingsWrapper>
    </ContentWrapper>
  );
};

export default Settings;
