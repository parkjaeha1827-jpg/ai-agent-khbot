import React, { useState } from "react";
import { X, SendHorizontal, CheckCircle2, AlertCircle, Key, ExternalLink, Power } from "lucide-react";

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramActive: boolean;
  botUsername?: string;
  onConfigureBot: (token: string) => Promise<{ success: boolean; message: string; bot?: any }>;
  onStopBot: () => Promise<void>;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
  telegramActive,
  botUsername,
  onConfigureBot,
  onStopBot,
}) => {
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    const res = await onConfigureBot(tokenInput.trim());
    setLoading(false);

    if (res.success) {
      setStatusMessage({ text: res.message, type: "success" });
      setTokenInput("");
    } else {
      setStatusMessage({ text: res.message, type: "error" });
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await onStopBot();
    setLoading(false);
    setStatusMessage({ text: "បានផ្ដាច់ Telegram Bot រួចរាល់", type: "info" });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-[#17212b] rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0e1621] border-b border-white/10 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <SendHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base">តភ្ជាប់ Telegram Bot ពិតប្រាកដ</h2>
              <p className="text-[11px] text-white/50">ប្រើប្រាស់ឥតគិតថ្លៃ ១០០%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-white text-sm">
          {/* Status Badge */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              telegramActive
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-white/5 border-white/10 text-white/70"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  telegramActive ? "bg-emerald-400 animate-ping" : "bg-white/30"
                }`}
              />
              <div>
                <p className="font-medium text-xs sm:text-sm">
                  {telegramActive ? "ស្ថានភាព៖ កំពុងដំណើរការលើ Telegram" : "ស្ថានភាព៖ មិនទាន់តភ្ជាប់ Telegram នៅឡើយ"}
                </p>
                {botUsername && (
                  <p className="text-[11px] text-emerald-300 font-mono mt-0.5">
                    Username: @{botUsername}
                  </p>
                )}
              </div>
            </div>

            {telegramActive && (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                <span>ផ្ដាច់</span>
              </button>
            )}
          </div>

          {/* Form */}
          {!telegramActive ? (
            <form onSubmit={handleConnect} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-sky-400" />
                  <span>បញ្ចូល Telegram Bot Token របស់អ្នក (ពី @BotFather)៖</span>
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1621] border border-white/15 text-white placeholder-white/30 text-xs font-mono focus:border-sky-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  tokenInput.trim() && !loading
                    ? "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                <SendHorizontal className="w-3.5 h-3.5" />
                <span>{loading ? "កំពុងតភ្ជាប់..." : "តភ្ជាប់ និងបើកដំណើរការលើ Telegram"}</span>
              </button>
            </form>
          ) : (
            <div className="p-3 bg-[#0e1621] rounded-xl border border-white/10 text-xs space-y-2">
              <p className="text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Bot របស់អ្នកដំណើរការស្រាប់!</span>
              </p>
              <p className="text-white/70">
                លោកអ្នក ឬសិស្សានុសិស្សអាចបើកកម្មវិធី Telegram ហើយស្វែងរក <strong>@{botUsername}</strong> ដើម្បីឆាតសួរលំហាត់ ផ្ញើរូបថតលំហាត់ព្រិលៗ ឬសន្ទនាបានគ្រប់ពេលដោយឥតគិតថ្លៃ។
              </p>
              {botUsername && (
                <a
                  href={`https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:underline pt-1"
                >
                  <span>បើកក្នុង Telegram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Feedback messages */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
                  : statusMessage.type === "error"
                  ? "bg-rose-950/50 text-rose-300 border border-rose-500/30"
                  : "bg-blue-950/50 text-blue-300 border border-blue-500/30"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Step-by-step guide to get token */}
          <div className="pt-2 border-t border-white/10">
            <h3 className="text-xs font-semibold text-white/90 mb-2">
              របៀបបង្កើត Bot Telegram ដោយឥតគិតថ្លៃ (ត្រឹមតែ ៣០ វិនាទី)៖
            </h3>
            <ol className="text-[12px] space-y-1.5 text-white/70 list-decimal pl-4">
              <li>
                បើកកម្មវិធី Telegram ហើយស្វែងរក{" "}
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline font-mono"
                >
                  @BotFather
                </a>
              </li>
              <li>
                ផ្ញើសារពាក្យ <code className="text-sky-300 font-mono">/newbot</code> រួចដាក់ឈ្មោះ និង Username ឱ្យ Bot របស់អ្នក (ឧ. MyKhmerAIBot)
              </li>
              <li>
                ចម្លងលេខកូដសម្ងាត់ <code className="text-emerald-300 font-mono">HTTP API Token</code> មក Paste នៅប្រអប់ខាងលើ រួចចុច "តភ្ជាប់"!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
