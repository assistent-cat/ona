import React from "react";
import styled from "styled-components";
import { CommentOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";

import { toggleSidebar } from "./chatSlice";

const ChatButton = styled(CommentOutlined)`
  color: lightgray;
  box-sizing: border-box;
  padding: 0.2rem 0 0.2rem 0.5rem;
  > svg {
    height: 3rem;
    width: 3rem;
  }
  cursor: pointer;
`;

interface Props {}

const ChatControl: React.FunctionComponent<Props> = () => {
  const dispatch = useDispatch();

  return <ChatButton onMouseUp={(e) => dispatch(toggleSidebar())} />;
};

export default ChatControl;
