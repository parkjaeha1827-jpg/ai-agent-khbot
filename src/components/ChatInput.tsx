import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Camera,
  X,
  Mic,
  Trash2,
  Loader2,
  Check,
  Radio,
} from "lucide-react";
import { ChatImage, ChatAudio } from "../types";

interface ChatInputProps {
  onSendMessage: (text: string, image?: ChatImage, audio?: ChatAudio) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<ChatImage | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setAttachedImage({
        data: base64Data,
        mimeType: file.type,
        name: file.name,
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle clipboard paste of screenshots
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            setAttachedImage({
              data: base64Data,
              mimeType: file.type,
              name: "Pasted Image",
              previewUrl: result,
            });
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  // Start voice audio recording
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("កម្មវិធីរុករករបស់អ្នកមិនទាន់បើកសិទ្ធិប្រើប្រាស់ Microphone ទេ");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("សូមអនុញ្ញាតបើកសិទ្ធិ Microphone ដើម្បីថតសំឡេង");
      setIsRecording(false);
    }
  };

  // Cancel recording without sending
  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Stop recording and send audio message
  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current) return;

    setIsProcessingVoice(true);
    if (timerRef.current) clearInterval(timerRef.current);

    mediaRecorderRef.current.onstop = async () => {
      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(",")[1];

        // Also try transcribing for instant subtitle
        let transcribedText = "";
        try {
          const transRes = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioData: base64Data, mimeType }),
          });
          if (transRes.ok) {
            const transData = await transRes.json();
            transcribedText = transData.text || "";
          }
        } catch {
          // Ignore transcribe error, audio still sent
        }

        const audioPayload: ChatAudio = {
          data: base64Data,
          mimeType,
          durationSeconds: recordingSeconds,
        };

        const finalPrompt = transcribedText || "🎙️ [សារសំឡេង/Voice Note]";
        onSendMessage(finalPrompt, attachedImage || undefined, audioPayload);

        // Reset
        setIsRecording(false);
        setIsProcessingVoice(false);
        setRecordingSeconds(0);
        setAttachedImage(null);
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorderRef.current.stop();
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if ((!trimmed && !attachedImage) || isLoading) return;

    onSendMessage(trimmed, attachedImage || undefined);
    setInputText("");
    setAttachedImage(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full bg-[#17212b] border-t border-white/10 p-2 sm:p-3 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Attached image preview banner */}
        {attachedImage && (
          <div className="flex items-center gap-2 p-2 mb-2 bg-[#202e3e] border border-sky-400/30 rounded-xl">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-black/40 shrink-0">
              <img
                src={attachedImage.previewUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {attachedImage.name || "រូបថតលំហាត់"}
              </p>
              <p className="text-[10px] text-sky-300">
                ✨ រូបថតត្រូវបានភ្ជាប់ (ទោះបីព្រិល ឬអក្សរដៃក៏ AI អាចដោះស្រាយបាន)
              </p>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Controls Bar */}
        <div className="flex items-end gap-1.5 bg-[#0e1621] rounded-2xl p-1.5 border border-white/10 focus-within:border-sky-500/50 transition-all shadow-inner">
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* When recording voice: Show Audio Recorder UI */}
          {isRecording ? (
            <div className="flex-1 flex items-center justify-between px-3 py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-mono text-sm font-semibold text-rose-400">
                    {formatSeconds(recordingSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-xs font-medium">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>កំពុងថតសំឡេង... (និយាយសំណួរ ឬលំហាត់របស់អ្នក)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  title="បោះបង់ការថត"
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={stopAndSendRecording}
                  disabled={isProcessingVoice}
                  title="បញ្ជូនសារសំឡេង"
                  className="px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
                >
                  {isProcessingVoice ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isProcessingVoice ? "កំពុងវិភាគ..." : "ផ្ញើសំឡេង"}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Attachment buttons */}
              <div className="flex items-center gap-0.5 text-white/60 mb-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="ភ្ជាប់រូបថតលំហាត់/សំណួរ (ទោះព្រិលក៏បាន)"
                  className="p-2 rounded-full hover:bg-white/10 hover:text-sky-400 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  title="ថតរូបលំហាត់ផ្ទាល់"
                  className="p-2 rounded-full hover:bg-white/10 hover:text-sky-400 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Text input area */}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={
                  attachedImage
                    ? "សរសេរសំណួរអំពីលំហាត់ក្នុងរូបនេះ ឬចុចបញ្ជូនភ្លាមៗ..."
                    : "សរសេរសារ ដោះស្រាយលំហាត់ ឬចុចរូប Microphone 🎙️ ដើម្បីនិយាយ..."
                }
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 text-white text-[14px] sm:text-[14.5px] placeholder-white/40 focus:ring-0 focus:outline-none resize-none py-1.5 px-1 leading-relaxed max-h-32 min-h-[38px]"
              />

              {/* Voice Mic button: Starts real recording */}
              <button
                type="button"
                onClick={startRecording}
                disabled={isLoading}
                title="ថត និងផ្ញើសារជាសំឡេង (Voice Note)"
                className="p-2 rounded-full mb-1 text-white/60 hover:text-sky-400 hover:bg-white/10 transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={(!inputText.trim() && !attachedImage) || isLoading}
                className={`p-2.5 rounded-full mb-0.5 transition-all shadow-md flex items-center justify-center ${
                  (inputText.trim() || attachedImage) && !isLoading
                    ? "bg-sky-500 hover:bg-sky-400 text-white active:scale-95 cursor-pointer shadow-sky-500/20"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Bottom hint label */}
        <div className="flex items-center justify-between px-2 pt-1.5 text-[10.5px] text-white/40">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
            🎙️ គាំទ្រការនិយាយជាសំឡេង និងឆ្លើយតបជាសំឡេងមកវិញ
          </span>
          <span>ចុច Enter ដើម្បីផ្ញើ (Shift+Enter ចុះបន្ទាត់)</span>
        </div>
      </div>
    </div>
  );
};
