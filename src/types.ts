export interface ChatImage {
  data: string; // base64
  mimeType: string;
  name?: string;
  previewUrl?: string;
}

export interface ChatAudio {
  data: string; // base64
  mimeType: string;
  durationSeconds?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  image?: ChatImage;
  audio?: ChatAudio;
  voiceAudioUrl?: string;
  durationMs?: number;
  subjectCategory?: string;
}

export type BotMode =
  | "all"
  | "math_exercise"
  | "medical_law"
  | "coding"
  | "emotion_chat"
  | "comfort_advice"
  | "khmer_poetry"
  | "language_tutor";
