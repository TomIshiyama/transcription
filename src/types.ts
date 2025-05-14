// メッセージイベントの型定義
export type SlackMessageEvent = {
  type: string;
  user: string;
  text: string;
  ts: string;
  channel: string;
  [key: string]: any;
};

// 文字起こしリクエストの型定義
export type TranscriptionRequest = {
  fileUrl: string;
  userId: string;
  channelId: string;
  timestamp: string;
  requestType: "transcription";
};

// 文字起こし結果の型定義
export type TranscriptionResult = {
  text: string;
  duration: number;
  requestType: "transcription";
};

export type SummaryRequest = {
  fileUrl: string;
  userId: string;
  channelId: string;
  timestamp: string;
  requestType: "summary";
};

// 文字起こし結果の型定義
export type SummaryResult = {
  text: string;
  duration: number;
  requestType: "summary";
};
