import React, { useState } from "react";
import { Input } from "antd";
import { RightCircleFilled } from "@ant-design/icons";
import styled from "styled-components";

const InputWrapper = styled.div`
  padding: 1rem;
  display: flex;
`;

const StyledInput = styled(Input)`
  margin: 0;
  padding: 0.8rem 1rem;
  width: 100%;
  font-size: 1.2rem;
  border-radius: 0.4rem;
  box-sizing: border-box;
  border-color: #abc4ff;
  background-color: none;
  outline: none;
  flex: 1;
`;

const SubmitButton = styled(RightCircleFilled)`
  color: #6a96ff;
  box-sizing: border-box;
  padding: 0.2rem 0 0.2rem 0.5rem;
  > svg {
    height: 3rem;
    width: 3rem;
  }
  cursor: pointer;
`;

interface Props {
  onSubmit(utterance: string): void;
}

const ChatInput: React.FunctionComponent<Props> = (props) => {
  const [utterance, setUtterance] = useState("");
  const [utteranceHistory, setUtteranceHistory] = useState<{
    cursor: number;
    messages: string[];
  }>({
    cursor: 0,
    messages: [],
  });

  const onSubmit = () => {
    if (utterance) {
      props.onSubmit(utterance);

      setUtteranceHistory((history) => ({
        cursor: history.messages.length + 1,
        messages: [...history.messages, utterance],
      }));

      setUtterance("");
    }
  };

  const scrollSentMessages = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      if (utteranceHistory.cursor > 0) {
        const { cursor, messages } = utteranceHistory;
        setUtterance(messages[cursor - 1]);
        setUtteranceHistory((history) => ({
          cursor: history.cursor - 1,
          messages: history.messages,
        }));
      }
    }

    if (event.key === "ArrowDown") {
      if (utteranceHistory.cursor < utteranceHistory.messages.length) {
        const { cursor, messages } = utteranceHistory;
        setUtterance(messages[cursor + 1]);
        setUtteranceHistory((history) => ({
          cursor: history.cursor + 1,
          messages: history.messages,
        }));
      }
    }
  };
  return (
    <InputWrapper>
      <StyledInput
        onPressEnter={onSubmit}
        value={utterance}
        onChange={(event) => setUtterance(event.target.value)}
        onKeyUp={scrollSentMessages}
      />
      <SubmitButton onMouseUp={onSubmit} />
    </InputWrapper>
  );
};

export default ChatInput;
