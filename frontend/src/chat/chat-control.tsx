import React from "react";
import styled from "styled-components";
import { CommentOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import { toggleSidebar } from "./chatSlice";
import { RootState } from "../rootReducer";

const ChatButton = styled(CommentOutlined)<{ open: boolean }>`
  color: ${({ open }) => (open ? "#6a96ff" : "lightgray")};
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
  const open = useSelector<RootState, boolean>(
    (state) => state.chat.sidebarOpen
  );

  return <ChatButton open={open} onMouseUp={() => dispatch(toggleSidebar())} />;
};

export default ChatControl;
