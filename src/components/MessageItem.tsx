import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { FormattedContent } from "./FormattedContent";
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Bot,
  User,
  Zap,
  Play,
  Pause,
  Loader2,
  Mic,
} from "lucide-react";

interface MessageItemProps {
  message: Message;
  onImageClick?: (imageUrl: string) => void;
  onRetry?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onImageClick, onRetry }) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // Audio note playback state (for user's recorded voice note)
  const [isPlayingNote, setIsPlayingNote] = useState(false);
  const noteAudioRef = useRef<HTMLAudioElement | null>(null);

  // TTS response speech playback state (for bot reading answer)
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.3); // Default brisk fast speed
  const [speakingLang, setSpeakingLang] = useState<"km" | "en" | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const hasError = !isUser && message.text.includes("⚠️");

  // Clean up audio objects on unmount
  useEffect(() => {
    return () => {
      if (noteAudioRef.current) {
        noteAudioRef.current.pause();
        noteAudioRef.current = null;
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Play/pause user's recorded audio note
  const togglePlayAudioNote = () => {
    if (!message.audio) return;

    if (isPlayingNote && noteAudioRef.current) {
      noteAudioRef.current.pause();
      setIsPlayingNote(false);
      return;
    }

    if (!noteAudioRef.current) {
      const audioUrl = `data:${message.audio.mimeType};base64,${message.audio.data}`;
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingNote(false);
      audio.onerror = () => setIsPlayingNote(false);
      noteAudioRef.current = audio;
    }

    noteAudioRef.current.play().then(() => setIsPlayingNote(true)).catch(() => setIsPlayingNote(false));
  };

  // Text-to-Speech: Dual Native Khmer and English audio playback
  const handleToggleSpeak = async () => {
    if (isSpeaking) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setSpeakingLang(null);
      return;
    }

    setIsLoadingAudio(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.text }),
      });

      if (res.ok) {
        const data = await res.json();
        const khmerAudioBase64 = data.khmerAudio;
        const englishAudioBase64 = data.englishAudio;

        if (khmerAudioBase64 || englishAudioBase64) {
          setIsLoadingAudio(false);
          setIsSpeaking(true);

          const playEnglishAudio = () => {
            if (englishAudioBase64) {
              setSpeakingLang("en");
              const audioEn = new Audio(`data:audio/mpeg;base64,${englishAudioBase64}`);
              audioEn.playbackRate = speechSpeed;
              currentAudioRef.current = audioEn;

              audioEn.onended = () => {
                setIsSpeaking(false);
                setSpeakingLang(null);
                currentAudioRef.current = null;
              };
              audioEn.onerror = () => {
                setIsSpeaking(false);
                setSpeakingLang(null);
                currentAudioRef.current = null;
              };
              audioEn.play().catch(() => {
                setIsSpeaking(false);
                setSpeakingLang(null);
              });
            } else {
              setIsSpeaking(false);
              setSpeakingLang(null);
            }
          };

          if (khmerAudioBase64) {
            setSpeakingLang("km");
            const audioKm = new Audio(`data:audio/mpeg;base64,${khmerAudioBase64}`);
            audioKm.playbackRate = speechSpeed;
            currentAudioRef.current = audioKm;

            audioKm.onended = () => {
              // Immediately transition to English voice automatically!
              playEnglishAudio();
            };
            audioKm.onerror = () => {
              playEnglishAudio();
            };

            audioKm.play().catch(() => {
              playEnglishAudio();
            });
          } else {
            playEnglishAudio();
          }
          return;
        }
      }
    } catch {
      // Ignore and fallback below
    }

    // Fallback to browser Web Speech API with automatic Khmer -> English sequence
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = message.text
        .replace(/<svg[\s\S]*?<\/svg>/gi, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/[*#`_~$-]/g, "");

      const englishIndex = cleanText.search(/(?:🇬🇧\s*)?(?:English\s*(?:Summary|Translation|Explanation)?|In English)\s*[:\-]/i);
      const khmerPart = englishIndex > 0 ? cleanText.slice(0, englishIndex).trim() : cleanText;
      const rawEnglish = englishIndex > 0 ? cleanText.slice(englishIndex).replace(/(?:🇬🇧\s*)?(?:English\s*(?:Summary|Translation|Explanation)?|In English)\s*[:\-]/i, "").trim() : "";
      const englishPart = rawEnglish ? `Now in English: ${rawEnglish}` : "Summary in English: " + cleanText.slice(0, 120);

      setIsSpeaking(true);
      setIsLoadingAudio(false);
      setSpeakingLang("km");

      const playBrowserEnglish = () => {
        setSpeakingLang("en");
        const utteranceEn = new SpeechSynthesisUtterance(englishPart);
        utteranceEn.rate = speechSpeed;
        utteranceEn.lang = "en-US";
        utteranceEn.onend = () => {
          setIsSpeaking(false);
          setSpeakingLang(null);
        };
        utteranceEn.onerror = () => {
          setIsSpeaking(false);
          setSpeakingLang(null);
        };
        window.speechSynthesis.speak(utteranceEn);
      };

      const utteranceKhmer = new SpeechSynthesisUtterance(khmerPart);
      utteranceKhmer.rate = speechSpeed;
      utteranceKhmer.lang = "km-KH";

      utteranceKhmer.onend = () => {
        playBrowserEnglish();
      };
      utteranceKhmer.onerror = () => {
        playBrowserEnglish();
      };

      window.speechSynthesis.speak(utteranceKhmer);
    } else {
      setIsLoadingAudio(false);
      setIsSpeaking(false);
      setSpeakingLang(null);
    }
  };

  return (
    <div className={`flex w-full my-2.5 ${isUser ? "justify-end" : "justify-start"} px-2 sm:px-4`}>
      <div
        className={`flex items-end gap-2 max-w-[94%] sm:max-w-[85%] md:max-w-[78%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className="shrink-0 mb-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-sm ring-1 ring-sky-300/30">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 via-sky-600 to-emerald-500 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-full bg-[#17212b] flex items-center justify-center text-sky-400">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">🇰🇭</span>
            </div>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`relative rounded-2xl p-3 sm:p-3.5 shadow-md transition-all ${
            isUser
              ? "bg-[#2b5278] text-white rounded-br-xs border border-sky-400/20"
              : "bg-[#182533] text-[#f5f5f5] rounded-bl-xs border border-white/5"
          }`}
        >
          {/* Header for Bot message */}
          {!isUser && (
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-sky-400">
                <span>Khmer Super AI Agent</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-300 font-normal">
                  ឆ្លាតវៃ
                </span>
              </div>
              {message.durationMs && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-400/90 font-mono">
                  <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{(message.durationMs / 1000).toFixed(1)}s</span>
                </div>
              )}
            </div>
          )}

          {/* User's Audio Voice Note Player (Telegram Voice Bubble Style) */}
          {message.audio && (
            <div className="mb-2 p-2.5 rounded-xl bg-black/25 border border-sky-400/30 flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayAudioNote}
                className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                {isPlayingNote ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                  <Mic className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                  <span>សារជាសំឡេង (Voice Note)</span>
                </div>

                {/* Animated sound wave bars */}
                <div className="flex items-center gap-0.5 h-4 mt-1.5">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 85, 65, 95, 40].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all ${
                        isPlayingNote
                          ? "bg-sky-400 animate-pulse"
                          : "bg-white/30"
                      }`}
                      style={{
                        height: isPlayingNote ? `${Math.max(20, (h * (i % 3 + 1)) % 100)}%` : `${h * 0.4}%`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {message.audio.durationSeconds !== undefined && (
                <span className="font-mono text-xs text-white/60 shrink-0">
                  {Math.floor(message.audio.durationSeconds / 60)}:
                  {(message.audio.durationSeconds % 60).toString().padStart(2, "0")}
                </span>
              )}
            </div>
          )}

          {/* Attached image if present */}
          {message.image && (
            <div className="mb-2.5 overflow-hidden rounded-lg border border-white/15 bg-black/40">
              <img
                src={message.image.previewUrl || `data:${message.image.mimeType};base64,${message.image.data}`}
                alt="Exercise problem"
                onClick={() =>
                  onImageClick?.(
                    message.image?.previewUrl || `data:${message.image?.mimeType};base64,${message.image?.data}`
                  )
                }
                className="max-h-64 w-full object-contain cursor-pointer hover:opacity-90 transition-opacity bg-black/20"
              />
              <div className="p-1.5 text-[11px] text-white/70 flex items-center justify-between bg-black/40">
                <span>📸 រូបថតលំហាត់/សំណួរ (ចុចដើម្បីពង្រីក)</span>
                {isUser && <span className="text-sky-300 text-[10px]">វិភាគរូបភាពព្រិលៗ</span>}
              </div>
            </div>
          )}

          {/* Text Content */}
          <FormattedContent content={message.text} />

          {/* Dual Bilingual Audio Response Active Indicator banner */}
          {isSpeaking && (
            <div className="mt-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-purple-500/15 border border-sky-400/30 flex items-center justify-between text-xs shadow-md">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <div className="flex items-center gap-1.5 font-medium">
                  {speakingLang === "km" ? (
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <span>🇰🇭 កំពុងនិយាយភាសាខ្មែរ...</span>
                      <span className="text-[10px] text-white/60">(បន្ទាប់មក: ភាសាអង់គ្លេស)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sky-300">
                      <span>🇬🇧 Now speaking English...</span>
                      <span className="text-[10px] text-white/60">(English Summary)</span>
                    </span>
                  )}
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-white/10 text-amber-300 text-[10px] font-mono">
                    {speechSpeed}x
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggleSpeak}
                className="text-[11px] text-rose-300 hover:text-rose-200 px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 cursor-pointer font-medium transition-colors"
              >
                បញ្ឈប់
              </button>
            </div>
          )}

          {/* Retry button if error */}
          {hasError && onRetry && (
            <div className="mt-2 pt-2 border-t border-rose-500/20">
              <button
                onClick={() => onRetry(message.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white transition-colors shadow-sm cursor-pointer"
              >
                <span>🔄 ព្យាយាមម្តងទៀត (Retry)</span>
              </button>
            </div>
          )}

          {/* Footer details: time, action buttons */}
          <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-white/5 text-[11px] text-white/50">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                title="ចម្លងសារ"
                className="hover:text-white transition-colors p-0.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {!isUser && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleToggleSpeak}
                    disabled={isLoadingAudio}
                    title={isSpeaking ? "បញ្ឈប់សំឡេង" : "ស្តាប់ចម្លើយជាសំឡេងទាំងពីរភាសា (ខ្មែរ + English)"}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                      isSpeaking
                        ? "bg-amber-500/20 text-amber-400 font-medium"
                        : "hover:bg-white/10 hover:text-white text-white/60"
                    }`}
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    ) : isSpeaking ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10.5px]">
                      {isLoadingAudio ? "កំពុងរៀបចំសំឡេង..." : isSpeaking ? "បិទសំឡេង" : "ស្តាប់សំឡេង (ខ្មែរ + English)"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextSpeed = speechSpeed === 1.0 ? 1.35 : speechSpeed === 1.35 ? 1.6 : 1.0;
                      setSpeechSpeed(nextSpeed);
                      if (currentAudioRef.current) {
                        currentAudioRef.current.playbackRate = nextSpeed;
                      }
                    }}
                    title="ផ្លាស់ប្តូរល្បឿននិយាយ (១.០x, ១.៣៥x លឿន, ១.៦x លឿនខ្លាំង)"
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-sky-300 hover:text-white text-[10px] font-mono transition-colors cursor-pointer border border-sky-400/20"
                  >
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    <span>{speechSpeed}x</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px] text-white/60">
              <span>{message.timestamp}</span>
              {isUser && (
                <span className="text-sky-300 font-bold" title="បានផ្ញើ">
                  ✓✓
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
