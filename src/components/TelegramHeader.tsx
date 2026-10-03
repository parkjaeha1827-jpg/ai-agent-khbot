import React from "react";
import { Send, Bot, CheckCircle, Trash2, HelpCircle, SendHorizontal, Radio } from "lucide-react";

interface TelegramHeaderProps {
  isTyping: boolean;
  telegramActive: boolean;
  botUsername?: string;
  onOpenTelegramModal: () => void;
  onClearChat: () => void;
  onOpenHelpModal: () => void;
}

export const TelegramHeader: React.FC<TelegramHeaderProps> = ({
  isTyping,
  telegramActive,
  botUsername,
  onOpenTelegramModal,
  onClearChat,
  onOpenHelpModal,
}) => {
  return (
    <header className="w-full bg-[#17212b] border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* Left: Bot Profile & Status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-sm flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#17212b] flex items-center justify-center text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#17212b]"></span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-semibold text-white text-[15px] sm:text-base tracking-wide flex items-center gap-1">
              Khmer Super AI Agent
              <CheckCircle className="w-4 h-4 text-sky-400 fill-sky-400/20" />
            </h1>
            <span className="text-xs">🇰🇭</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {isTyping ? (
              <span className="text-sky-400 font-medium flex items-center gap-1 animate-pulse">
                typing<span className="tracking-widest">.....</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                online • ឆ្លាតវៃ & ឥតគិតថ្លៃ
              </span>
            )}

            {botUsername && (
              <span className="hidden sm:inline-block text-white/40">
                • @{botUsername}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Telegram Bot Connector status button */}
        <button
          onClick={onOpenTelegramModal}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            telegramActive
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
              : "bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30"
          }`}
          title="តភ្ជាប់ Telegram Bot ពិតប្រាកដ"
        >
          <SendHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {telegramActive ? `Telegram: @${botUsername}` : "តភ្ជាប់ Telegram Bot"}
          </span>
          <span className="sm:hidden">
            {telegramActive ? "ភ្ជាប់រួច" : "Telegram"}
          </span>
          {telegramActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        {/* Clear chat */}
        <button
          onClick={onClearChat}
          title="សម្អាតសារទាំងអស់"
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Help / Guide */}
        <button
          onClick={onOpenHelpModal}
          title="ការណែនាំ និងសមត្ថភាពទាំង ១៥"
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-sky-400 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
