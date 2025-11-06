"use client";
import { AnimatePresence, motion } from "motion/react";
import { sortBy, uniqBy } from "lodash";
import { useState, useEffect, useRef, Suspense } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import {
  AIChatLog,
  AIChatMessage,
  AIChatMessageAuthor,
  AIChatMessageBody,
} from "@twilio-paste/ai-chat-log";
import {
  Box,
  ChatLog,
  ChatMessage,
  ChatBubble,
  ChatBookend,
  ChatBookendItem,
  Button,
} from "@twilio-paste/core";
import { ProductAIAssistantsIcon } from "@twilio-paste/icons/cjs/ProductAIAssistantsIcon";

import { useSearchParams } from "next/navigation";
import ToolMessage from "./toolMessage";
import WrapUpModal from "./wrapUpModal";
import { useRouter } from "next/navigation";

interface AIChatProps {
  forceVIVisible?: boolean;
}

const AIChat: React.FC<AIChatProps> = ({ forceVIVisible }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viSid, setViSid] = useState("");
  const [viVisible, setVIVisible] = useState(!!forceVIVisible);
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const wssURL =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_DOMAIN!
      : process.env.NEXT_PUBLIC_WS_BASE_URL!;
  const WS_URL = `wss://${wssURL}/api/ws/callConversation`;
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<any>(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => false,
    },
  );

  // 当连接打开时，拉取历史（首次）
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        event: "pollHistory",
        sessionId: code,
      });
    }
  }, [readyState]);

  // 当 code 变化且连接已打开时，重新拉取历史，确保使用最新的 sessionId
  useEffect(() => {
    if (readyState === ReadyState.OPEN && code) {
      sendJsonMessage({
        event: "pollHistory",
        sessionId: code,
      });
    }
  }, [code, readyState]);
  
  // Sync external control from parent to toggle VI visibility
  useEffect(() => {
    if (typeof forceVIVisible === "boolean") {
      setVIVisible(forceVIVisible);
    }
  }, [forceVIVisible]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  enum CallStatus {
    Ongoing = "ongoing",
    Ended = "ended",
    Ringing = "ringing",
  }
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.Ringing);

  useEffect(() => {
    const data = lastJsonMessage?.data || [];
    const event = (lastJsonMessage?.event as string) || "";
    switch (event) {
      case "aiIntro":
        setConversationHistory([...conversationHistory, ...data]);
        break;
      case "startCall":
        setCallStatus(CallStatus.Ongoing);
        break;
      case "endCall":
        setCallStatus(CallStatus.Ended);
        sendJsonMessage({
          event: "endCall",
        });
        break;
      case "history":
        const duplicatesRemoved = uniqBy(
          [...data, ...conversationHistory],
          "id",
        );
        setConversationHistory(duplicatesRemoved);
        break;
      case "voiceIntelligenceSid":
        setCallStatus(CallStatus.Ended);
        setViSid(lastJsonMessage.data.transcript_sid);
        console.log("voiceIntelligence transcript ready");
        break;
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [conversationHistory]); // Trigger scroll on message changes

  return (
    <>
      <Suspense>
        <AIChatLog>
          <ChatLog>
            <AnimatePresence initial={true}>
              {!viVisible && (
                <motion.div
                  style={{
                    height: 750,
                    overflow: "scroll",
                    scrollbarWidth: "none",
                  }}
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    opacity: +!viVisible,
                    height: +!viVisible * 750,
                    transition: { duration: 1 },
                  }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {sortBy(conversationHistory, ["dateCreated"]).map(
                    (message: any, index: number) => {
                      switch (message.role) {
                        case "user":
                          if (message?.content?.content) {
                            return (
                              <motion.div
                                style={{ margin: "20px" }}
                                initial={{
                                  x: 100,
                                  opacity: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  transition: { duration: 0.5 },
                                }}
                                key={index}
                              >
                                <ChatMessage variant="outbound" key={index}>
                                  <ChatBubble>
                                    <AIChatMessageBody>
                                      {message.content.content}
                                    </AIChatMessageBody>
                                  </ChatBubble>
                                </ChatMessage>
                              </motion.div>
                            );
                          }
                          break;
                        case "assistant":
                          return (
                            <motion.div
                              style={{ margin: "20px" }}
                              initial={{
                                x: -100,
                                opacity: 0,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                transition: { duration: 0.5 },
                              }}
                              key={index}
                            >
                              <AIChatMessage variant="bot" key={index}>
                                <AIChatMessageAuthor
                                  avatarIcon={ProductAIAssistantsIcon}
                                  aria-label="AI said"
                                >
                                  Hoot
                                </AIChatMessageAuthor>
                                <AIChatMessageBody animated>
                                  {message.content.content}
                                </AIChatMessageBody>
                              </AIChatMessage>
                            </motion.div>
                          );
                          break;
                        case "tool":
                          if (message.content.name === "Inform_User") {
                            return (
                              <motion.div
                                style={{ margin: "20px" }}
                                initial={{
                                  x: -100,
                                  opacity: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  transition: { duration: 0.5 },
                                }}
                                key={index}
                              >
                                <AIChatMessage variant="bot" key={index}>
                                  <AIChatMessageAuthor
                                    avatarIcon={ProductAIAssistantsIcon}
                                    aria-label="AI said"
                                  >
                                    Hoot
                                  </AIChatMessageAuthor>
                                  <AIChatMessageBody animated>
                                    {message.content.output
                                      .replace(`Assistant: I said "`, "")
                                      .replace(`" to the user.`, "")}
                                  </AIChatMessageBody>
                                </AIChatMessage>
                              </motion.div>
                            );
                          } else if (message.content.output !== "{}") {
                            return (
                              <motion.div
                                style={{ marginBottom: "20px" }}
                                initial={{
                                  x: -100,
                                  opacity: 0,
                                }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  transition: { duration: 0.5 },
                                }}
                                key={index}
                              >
                                <ToolMessage
                                  tool={message.content}
                                  key={index}
                                />
                              </motion.div>
                            );
                          }
                          break;
                        default:
                          return null;
                          break;
                      }
                    },
                  )}
                  <Box ref={scrollRef} minHeight="100px"></Box>
                </motion.div>
              )}
            </AnimatePresence>
            {(callStatus === CallStatus.Ended || viSid) && (
              <ChatBookend>
                <ChatBookendItem>Today</ChatBookendItem>
                <ChatBookendItem>
                  <strong>Call Ended</strong>
                </ChatBookendItem>
              </ChatBookend>
            )}
            {viSid && (
              <>
                {viSid && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => setVIVisible(!viVisible)}
                  >
                    {viVisible
                      ? "Back to Live Transcript"
                      : "See Voice Intelligence Analysis"}
                  </Button>
                )}
                <AnimatePresence initial={false}>
                  {viVisible && viSid ? (
                    <WrapUpModal transcriptSid={viSid} />
                  ) : null}
                </AnimatePresence>
              </>
            )}
          </ChatLog>
        </AIChatLog>
      </Suspense>
    </>
  );
};

export default AIChat;

// 移除 InactivityAlert 组件定义和相关导入 Spinner、AlertDialog
