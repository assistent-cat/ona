import React from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { LeftOutlined } from "@ant-design/icons";

import { RootState } from "../rootReducer";
import {
  closeSettingsSidebar,
  Configuration,
  toggleUseHotword,
} from "./userSlice";
import { Switch } from "antd";
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

const SettingsElement = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const SettingsToggle = styled(Switch)`
  width: auto;
`;
const SettingsLabel = styled.div`
  flex: 1;
  margin-left: 1rem;
  box-sizing: border-box;
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

interface Props {}

const Settings: React.FunctionComponent<Props> = () => {
  const dispatch = useDispatch();

  const configuration = useSelector<RootState, Configuration>(
    (state) => state.user.configuration
  );

  const onChangeHotword = (checked: boolean, event: MouseEvent) => {
    dispatch(toggleUseHotword());
    dispatch(setListening(!checked));
  };

  return (
    <ContentWrapper>
      <SettingsHeader>
        <SettingsClose onMouseUp={(e) => dispatch(closeSettingsSidebar())} />
        <SettingsTitle>Configuració</SettingsTitle>
      </SettingsHeader>
      <SettingsWrapper>
        <SettingsElement>
          <SettingsToggle
            checked={configuration.useHotword}
            onChange={onChangeHotword}
          />
          <SettingsLabel>Paraula d'activació</SettingsLabel>
        </SettingsElement>
      </SettingsWrapper>
    </ContentWrapper>
  );
};

export default Settings;
