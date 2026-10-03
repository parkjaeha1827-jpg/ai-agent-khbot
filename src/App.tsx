import React, { useState, useEffect, useRef } from "react";
import { Message, ChatImage, ChatAudio } from "./types";
import { TelegramHeader } from "./components/TelegramHeader";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";
import { ImageModal } from "./components/ImageModal";
import { TelegramBotModal } from "./components/TelegramBotModal";
import { HelpModal } from "./components/HelpModal";
import { Bot, Sparkles, SendHorizontal } from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "សួស្តីបងប្អូន! ខ្ញុំជា Khmer AI 🤖🇰🇭 ចង់ឱ្យខ្ញុំជួយដោះស្រាយលំហាត់ ឬឆ្លើយសំណួរអ្វីដែរ?",
      timestamp: new Date().toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ active: boolean; botUsername?: string }>({
    active: false,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or typing
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check Telegram Bot status on mount
  useEffect(() => {
    fetch("/api/telegram/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setTelegramStatus({ active: true, botUsername: data.botUsername });
        }
      })
      .catch(() => {});
  }, []);

  // Configure Telegram Bot
  const handleConfigureTelegram = async (token: string) => {
    try {
      const res = await fetch("/api/telegram/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success && data.bot) {
        setTelegramStatus({ active: true, botUsername: data.bot.username });
        return { success: true, message: data.message, bot: data.bot };
      }
      return { success: false, message: data.error || "មិនអាចតភ្ជាប់បានទេ" };
    } catch (err: any) {
      return { success: false, message: err.message || "មានបញ្ហាបច្ចេកទេស" };
    }
  };

  // Stop Telegram Bot
  const handleStopTelegram = async () => {
    try {
      await fetch("/api/telegram/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
      setTelegramStatus({ active: false });
    } catch {}
  };

  // Clear chat history
  const handleClearChat = () => {
    if (window.confirm("តើអ្នកចង់សម្អាតសារទាំងអស់មែនទេ?")) {
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          text: "សារទាំងអស់ត្រូវបានសម្អាតរួចរាល់! តើខ្ញុំអាចជួយដោះស្រាយលំហាត់ ឬឆ្លើយសំណួរអ្វីទៀតជូនបងប្អូន?",
          timestamp: new Date().toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  // Send message with streaming response
  const handleSendMessage = async (
    text: string,
    image?: ChatImage,
    audio?: ChatAudio,
    category?: string
  ) => {
    if (isTyping) return;

    const userMessageId = `user-${Date.now()}`;
    const botMessageId = `bot-${Date.now()}`;
    const startTime = Date.now();

    const newMsg: Message = {
      id: userMessageId,
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit" }),
      image: image,
      audio: audio,
      subjectCategory: category,
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setIsTyping(true);

    // Placeholder bot message for streaming text
    const initialBotMessage: Message = {
      id: botMessageId,
      role: "assistant",
      text: "",
      timestamp: new Date().toLocaleTimeString("km-KH", { hour: "2-digit", minute: "2-digit" }),
      subjectCategory: category,
    };

    setMessages((prev) => [...prev, initialBotMessage]);

    try {
      // Build conversation history for API
      const conversationPayload = updatedHistory.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
        image: m.image
          ? {
              data: m.image.data,
              mimeType: m.image.mimeType,
            }
          : undefined,
        audio: m.audio
          ? {
              data: m.audio.data,
              mimeType: m.audio.mimeType,
            }
          : undefined,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationPayload,
          userMood: category,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("ការឆ្លើយតបពីម៉ាស៊ីនបម្រើមានបញ្ហា");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                const elapsedMs = Date.now() - startTime;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? {
                          ...msg,
                          text: accumulatedText,
                          durationMs: elapsedMs,
                        }
                      : msg
                  )
                );
              }
              if (parsed.error) {
                let displayError = parsed.error;
                // Clean any raw technical JSON strings
                if (
                  typeof displayError === "string" &&
                  (displayError.includes('"code":') ||
                    displayError.includes("503") ||
                    displayError.includes("UNAVAILABLE") ||
                    displayError.includes("high demand") ||
                    displayError.startsWith("{"))
                ) {
                  displayError = "ប្រព័ន្ធកំពុងមានអ្នកប្រើប្រាស់ច្រើនបន្តិច (High Demand) សូមចុចលើពាក្យ 'ព្យាយាមម្តងទៀត'!";
                }

                accumulatedText = accumulatedText
                  ? `${accumulatedText}\n\n⚠️ ${displayError}`
                  : `⚠️ ${displayError}`;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: "សូមអភ័យទោស មានបញ្ហាបច្ចេកទេសក្នុងការតភ្ជាប់ សូមព្យាយាមសាកល្បងម្តងទៀត!",
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Retry previous message if error occurs
  const handleRetry = (errorBotMsgId: string) => {
    const errorIndex = messages.findIndex((m) => m.id === errorBotMsgId);
    if (errorIndex > 0) {
      // Find the user message before this bot message
      const userMessage = messages[errorIndex - 1];
      if (userMessage && userMessage.role === "user") {
        // Remove both the user and failed bot message from state and re-send
        setMessages((prev) => prev.filter((m) => m.id !== errorBotMsgId && m.id !== userMessage.id));
        handleSendMessage(userMessage.text, userMessage.image, userMessage.audio, userMessage.subjectCategory);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0e1621] text-[#f5f5f5] overflow-hidden select-text">
      {/* Header */}
      <TelegramHeader
        isTyping={isTyping}
        telegramActive={telegramStatus.active}
        botUsername={telegramStatus.botUsername}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        onClearChat={handleClearChat}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
      />

      {/* Main Chat Area with Telegram patterned background */}
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-2 relative"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(27, 40, 56, 0.4) 0%, rgba(14, 22, 33, 0.95) 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto w-full">
          {/* Messages list */}
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onImageClick={(url) => setSelectedImage(url)}
              onRetry={handleRetry}
            />
          ))}

          {/* Typing Indicator at bottom (Rule 11: typing..... indicator) */}
          {isTyping && (
            <div className="flex items-center gap-2 px-3 py-2 my-1 text-xs text-sky-400 font-medium animate-pulse">
              <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-[#182533] px-3 py-1.5 rounded-full border border-sky-400/20 flex items-center gap-1.5 shadow-sm">
                <span>typing</span>
                <span className="tracking-widest">.....</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat Input Bar */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />

      {/* Full Image Zoom Modal */}
      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* Telegram Bot Connector Modal */}
      <TelegramBotModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        telegramActive={telegramStatus.active}
        botUsername={telegramStatus.botUsername}
        onConfigureBot={handleConfigureTelegram}
        onStopBot={handleStopTelegram}
      />

      {/* Help / 15 Capabilities Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
}
