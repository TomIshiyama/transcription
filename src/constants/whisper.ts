export const availableFormat = [
  "mp3",
  "mp4",
  "mpeg",
  "mpga",
  "m4a",
  "wav",
  "webm",
] as const;

export type AvailableFormat = (typeof availableFormat)[number];

export const availableText = ["txt"] as const;

// Whisper API 設定
export const WHISPER_MODEL = "whisper-1";
export const WHISPER_LANGUAGE = "ja";
export const WHISPER_RESPONSE_FORMAT = "json";
export const WHISPER_TEMPERATURE = 0;
