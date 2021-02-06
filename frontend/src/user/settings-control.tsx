import React from "react";
import styled from "styled-components";
import { SettingOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";

import { toggleSettingsSidebar } from "./userSlice";

const SettingsButton = styled(SettingOutlined)`
  color: lightgray;
  box-sizing: border-box;
  padding: 0.2rem 0 0.2rem 0.5rem;
  > svg {
    height: 2rem;
    width: 2rem;
  }
  cursor: pointer;
`;

interface Props {}

const SettingsControl: React.FunctionComponent<Props> = () => {
  const dispatch = useDispatch();

  return <SettingsButton onMouseUp={() => dispatch(toggleSettingsSidebar())} />;
};

export default SettingsControl;
