export const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN ?? "";
export const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET ?? "";
export const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN ?? "";

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3456;

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const WHISPER_LOCAL_ENDPOINT = process.env.WHISPER_LOCAL_ENDPOINT ?? "";
export const WHISPER_LOCAL_INSTANCE = process.env.WHISPER_LOCAL_INSTANCE
  ? process.env.WHISPER_LOCAL_INSTANCE === "true"
  : false;
