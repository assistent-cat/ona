import React from "react";
import styled from "styled-components";

const Wrapper = styled.div<{ type: "human" | "bot" }>`
  display: flex;
  margin-bottom: 24px;
  ${({ type }) => (type === "human" ? "justify-content: flex-end;" : "")}
`;

const Bubble = styled.div<{ type: "human" | "bot" }>`
  color: #000000;
  background-color: #e2eafc;
  border-radius: ${({ type }) => (type === "human" ? 12 : 0)}px
    ${({ type }) => (type === "human" ? 0 : 12)}px 12px 12px;
  font-size: 1em;
  overflow: hidden;
  padding: 0.5rem 1rem;
  max-width: 75%;
`;

interface Props {
  message: string;
  type: "human" | "bot";
}

const ChatBubble: React.FunctionComponent<Props> = (props) => {
  return (
    <Wrapper type={props.type}>
      <Bubble type={props.type}>{props.message}</Bubble>
    </Wrapper>
  );
};

export default ChatBubble;
